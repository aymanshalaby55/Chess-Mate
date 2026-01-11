import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { GameService } from './game.service';
import { ChatService } from '../chat/chat.service';
import { RatingService } from '../rating/rating.service';
import { PrismaService } from '../prisma/prisma.service';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';

interface PlayerInfo {
  odId: number;
  odName: string;
  color: Side;
  timeLeft: number;
}

interface GameRoom {
  gameId: number;
  players: Map<string, PlayerInfo>; // socketId -> player info
  spectators: Set<string>;
  currentTurn: Side;
  timerInterval?: NodeJS.Timeout;
  lastMoveTime?: number;
}

interface MatchmakingPlayer {
  odId: number;
  odName: string;
  rating: number;
  timeControl: string;
  joinedAt: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
})
export class ChessGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChessGateway.name);

  // Active game rooms
  private gameRooms: Map<string, GameRoom> = new Map();

  // Socket to game mapping
  private socketToGame: Map<string, string> = new Map();

  // Socket to user mapping
  private socketToUser: Map<string, number> = new Map();

  // Matchmaking queue
  private matchmakingQueue: Map<string, MatchmakingPlayer> = new Map();

  constructor(
    private readonly gameService: GameService,
    private readonly chatService: ChatService,
    private readonly ratingService: RatingService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from matchmaking queue
    this.matchmakingQueue.delete(client.id);

    // Handle game disconnection
    const gameId = this.socketToGame.get(client.id);
    if (gameId) {
      this.handlePlayerDisconnect(client.id, gameId);
    }

    this.socketToGame.delete(client.id);
    this.socketToUser.delete(client.id);
  }

  private async handlePlayerDisconnect(socketId: string, gameId: string) {
    const room = this.gameRooms.get(gameId);
    if (!room) return;

    const player = room.players.get(socketId);
    if (player) {
      room.players.delete(socketId);

      // Notify other players
      this.server.to(gameId).emit('player-disconnected', {
        odId: player.odId,
        odName: player.odName,
      });

      // If game was ongoing, handle abandonment
      if (room.players.size === 1) {
        // Give 60 seconds to reconnect
        setTimeout(async () => {
          const currentRoom = this.gameRooms.get(gameId);
          if (currentRoom && currentRoom.players.size === 1) {
            // Player didn't reconnect, opponent wins
            const remainingPlayer = Array.from(currentRoom.players.values())[0];
            await this.endGame(gameId, remainingPlayer.odId, 'abandoned');
          }
        }, 60000);
      }
    }
  }

  // ==================== AUTHENTICATION ====================

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { odId: number; odName: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.socketToUser.set(client.id, data.odId);
    this.logger.log(`User ${data.odId} authenticated on socket ${client.id}`);
    client.emit('authenticated', { success: true });
  }

  // ==================== MATCHMAKING ====================

  @SubscribeMessage('join-matchmaking')
  async handleJoinMatchmaking(
    @MessageBody()
    data: { odId: number; odName: string; rating: number; timeControl: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `User ${data.odId} joining matchmaking for ${data.timeControl}`,
    );

    // Add to queue
    this.matchmakingQueue.set(client.id, {
      ...data,
      joinedAt: Date.now(),
    });

    client.emit('matchmaking-joined', { position: this.matchmakingQueue.size });

    // Try to find a match
    await this.findMatch(client.id);
  }

  @SubscribeMessage('leave-matchmaking')
  handleLeaveMatchmaking(@ConnectedSocket() client: Socket) {
    this.matchmakingQueue.delete(client.id);
    client.emit('matchmaking-left');
  }

  private async findMatch(socketId: string) {
    const player = this.matchmakingQueue.get(socketId);
    if (!player) return;

    // Find opponent with similar rating and same time control
    for (const [opponentSocketId, opponent] of this.matchmakingQueue) {
      if (opponentSocketId === socketId) continue;
      if (opponent.timeControl !== player.timeControl) continue;

      // Rating difference tolerance (expands over time)
      const waitTime = Date.now() - player.joinedAt;
      const ratingTolerance = Math.min(
        100 + Math.floor(waitTime / 5000) * 50,
        500,
      );

      if (Math.abs(player.rating - opponent.rating) <= ratingTolerance) {
        // Match found!
        await this.createMatchedGame(socketId, opponentSocketId);
        return;
      }
    }
  }

  private async createMatchedGame(socket1Id: string, socket2Id: string) {
    const player1 = this.matchmakingQueue.get(socket1Id);
    const player2 = this.matchmakingQueue.get(socket2Id);

    if (!player1 || !player2) return;

    // Remove from queue
    this.matchmakingQueue.delete(socket1Id);
    this.matchmakingQueue.delete(socket2Id);

    // Randomly assign colors
    const player1IsWhite = Math.random() < 0.5;

    // Parse time control
    const timeInSeconds = this.parseTimeControl(player1.timeControl);

    // Create game in database
    const game = await this.prisma.game.create({
      data: {
        player1_id: player1IsWhite ? player1.odId : player2.odId,
        player2_id: player1IsWhite ? player2.odId : player1.odId,
        isComputer: false,
        boardStatus: new Chess().fen(),
        status: GameStatus.ongoing,
        timeControl: player1.timeControl as any,
        initialTime: timeInSeconds,
        increment: this.getIncrement(player1.timeControl),
        player1TimeLeft: timeInSeconds * 1000,
        player2TimeLeft: timeInSeconds * 1000,
      },
    });

    const gameRoomId = `game-${game.id}`;

    // Create game room
    const room: GameRoom = {
      gameId: game.id,
      players: new Map(),
      spectators: new Set(),
      currentTurn: Side.white,
      lastMoveTime: Date.now(),
    };

    // Add players to room
    const socket1 = this.server.sockets.sockets.get(socket1Id);
    const socket2 = this.server.sockets.sockets.get(socket2Id);

    if (socket1 && socket2) {
      socket1.join(gameRoomId);
      socket2.join(gameRoomId);

      room.players.set(socket1Id, {
        odId: player1.odId,
        odName: player1.odName,
        color: player1IsWhite ? Side.white : Side.black,
        timeLeft: timeInSeconds * 1000,
      });

      room.players.set(socket2Id, {
        odId: player2.odId,
        odName: player2.odName,
        color: player1IsWhite ? Side.black : Side.white,
        timeLeft: timeInSeconds * 1000,
      });

      this.socketToGame.set(socket1Id, gameRoomId);
      this.socketToGame.set(socket2Id, gameRoomId);
    }

    this.gameRooms.set(gameRoomId, room);

    // Notify both players
    this.server.to(gameRoomId).emit('game-matched', {
      gameId: game.id,
      white: {
        odId: player1IsWhite ? player1.odId : player2.odId,
        odName: player1IsWhite ? player1.odName : player2.odName,
        rating: player1IsWhite ? player1.rating : player2.rating,
      },
      black: {
        odId: player1IsWhite ? player2.odId : player1.odId,
        odName: player1IsWhite ? player2.odName : player1.odName,
        rating: player1IsWhite ? player2.rating : player1.rating,
      },
      timeControl: player1.timeControl,
      initialTime: timeInSeconds * 1000,
      fen: new Chess().fen(),
    });

    // Start the timer
    this.startGameTimer(gameRoomId);

    this.logger.log(
      `Game ${game.id} created between ${player1.odId} and ${player2.odId}`,
    );
  }

  private parseTimeControl(timeControl: string): number {
    const timeMap: Record<string, number> = {
      bullet_1min: 60,
      bullet_2min: 120,
      blitz_3min: 180,
      blitz_5min: 300,
      rapid_10min: 600,
      rapid_15min: 900,
      rapid_30min: 1800,
      classical_60min: 3600,
    };
    return timeMap[timeControl] || 600;
  }

  private getIncrement(timeControl: string): number {
    // Add increment for longer time controls
    if (timeControl.includes('rapid') || timeControl.includes('classical')) {
      return 5;
    }
    if (timeControl.includes('blitz')) {
      return 2;
    }
    return 0;
  }

  // ==================== GAME ROOM ====================

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @MessageBody() data: { gameId: number; odId: number; odName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;

    // Get game from database
    const game = await this.prisma.game.findUnique({
      where: { id: data.gameId },
      include: {
        moves: { orderBy: { moveNumber: 'asc' } },
        player1: {
          select: { id: true, name: true, rating: true, picture: true },
        },
        player2: {
          select: { id: true, name: true, rating: true, picture: true },
        },
      },
    });

    if (!game) {
      client.emit('error', { message: 'Game not found' });
      return;
    }

    client.join(gameRoomId);
    this.socketToGame.set(client.id, gameRoomId);

    let room = this.gameRooms.get(gameRoomId);
    if (!room) {
      room = {
        gameId: data.gameId,
        players: new Map(),
        spectators: new Set(),
        currentTurn:
          new Chess(game.boardStatus).turn() === 'w' ? Side.white : Side.black,
        lastMoveTime: Date.now(),
      };
      this.gameRooms.set(gameRoomId, room);
    }

    const isPlayer1 = game.player1_id === data.odId;
    const isPlayer2 = game.player2_id === data.odId;

    if (isPlayer1 || isPlayer2) {
      room.players.set(client.id, {
        odId: data.odId,
        odName: data.odName,
        color: isPlayer1 ? Side.white : Side.black,
        timeLeft: isPlayer1
          ? game.player1TimeLeft || 600000
          : game.player2TimeLeft || 600000,
      });

      // Notify room of player joining
      client.to(gameRoomId).emit('player-joined', {
        odId: data.odId,
        odName: data.odName,
        color: isPlayer1 ? 'white' : 'black',
      });
    } else {
      room.spectators.add(client.id);
    }

    // Send current game state
    client.emit('game-state', {
      gameId: game.id,
      fen: game.boardStatus,
      status: game.status,
      moves: game.moves,
      white: game.player1,
      black: game.player2,
      whiteTimeLeft: game.player1TimeLeft,
      blackTimeLeft: game.player2TimeLeft,
      currentTurn:
        new Chess(game.boardStatus).turn() === 'w' ? 'white' : 'black',
      yourColor: isPlayer1 ? 'white' : isPlayer2 ? 'black' : 'spectator',
    });

    this.logger.log(`User ${data.odId} joined game ${data.gameId}`);
  }

  @SubscribeMessage('join-by-invite')
  async handleJoinByInvite(
    @MessageBody() data: { inviteCode: string; odId: number; odName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = await this.prisma.game.findUnique({
      where: { inviteCode: data.inviteCode },
    });

    if (!game) {
      client.emit('error', { message: 'Invalid invite code' });
      return;
    }

    // If this is the game creator, just join the room directly
    if (game.player1_id === data.odId) {
      this.logger.log(`Creator ${data.odId} joining their own game ${game.id}`);
      await this.handleJoinGame(
        { gameId: game.id, odId: data.odId, odName: data.odName },
        client,
      );
      return;
    }

    // If game already has player2 and it's this user, just join
    if (game.player2_id === data.odId) {
      this.logger.log(`Player2 ${data.odId} rejoining game ${game.id}`);
      await this.handleJoinGame(
        { gameId: game.id, odId: data.odId, odName: data.odName },
        client,
      );
      return;
    }

    // If game is not waiting, it's no longer available for new players
    if (game.status !== GameStatus.waiting) {
      client.emit('error', { message: 'Game is no longer available' });
      return;
    }

    // If game already has a different player2, reject
    if (game.player2_id && game.player2_id !== data.odId) {
      client.emit('error', { message: 'Game already has two players' });
      return;
    }

    // Add player 2 to the game
    const updatedGame = await this.prisma.game.update({
      where: { id: game.id },
      data: {
        player2_id: data.odId,
        status: GameStatus.ongoing,
      },
    });

    this.logger.log(`Player ${data.odId} joined game ${game.id} via invite`);

    // Join the game room
    await this.handleJoinGame(
      { gameId: game.id, odId: data.odId, odName: data.odName },
      client,
    );

    // Notify player 1 that the game has started
    const gameRoomId = `game-${game.id}`;
    client.to(gameRoomId).emit('game-started', {
      gameId: game.id,
      opponent: { odId: data.odId, odName: data.odName },
    });

    // Start the timer
    this.startGameTimer(gameRoomId);
  }

  // ==================== MOVES ====================

  @SubscribeMessage('make-move')
  async handleMove(
    @MessageBody()
    data: {
      gameId: number;
      from: string;
      to: string;
      promotion?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;
    const room = this.gameRooms.get(gameRoomId);
    const player = room?.players.get(client.id);

    if (!room || !player) {
      client.emit('error', { message: 'Not in game' });
      return;
    }

    // Get current game state
    const game = await this.prisma.game.findUnique({
      where: { id: data.gameId },
      include: { moves: true },
    });

    if (!game || game.status !== GameStatus.ongoing) {
      client.emit('error', { message: 'Game not active' });
      return;
    }

    // Validate it's player's turn
    const chess = new Chess(game.boardStatus);
    const isWhiteTurn = chess.turn() === 'w';
    const isPlayerTurn =
      (isWhiteTurn && player.color === Side.white) ||
      (!isWhiteTurn && player.color === Side.black);

    if (!isPlayerTurn) {
      client.emit('error', { message: 'Not your turn' });
      return;
    }

    // Make the move
    try {
      const move = chess.move({
        from: data.from,
        to: data.to,
        promotion: data.promotion,
      });

      if (!move) {
        client.emit('error', { message: 'Invalid move' });
        return;
      }

      // Calculate time spent
      const now = Date.now();
      const timeSpent = room.lastMoveTime ? now - room.lastMoveTime : 0;
      room.lastMoveTime = now;

      // Update player time
      const increment = (game.increment || 0) * 1000;
      if (player.color === Side.white) {
        player.timeLeft = Math.max(0, player.timeLeft - timeSpent + increment);
      } else {
        player.timeLeft = Math.max(0, player.timeLeft - timeSpent + increment);
      }

      // Check game status
      const isCheckmate = chess.isCheckmate();
      const isDraw = chess.isDraw();
      const isGameOver = isCheckmate || isDraw;

      let gameStatus: GameStatus = game.status;
      let winnerId: number | null = null;

      if (isCheckmate) {
        gameStatus = isWhiteTurn ? GameStatus.white_won : GameStatus.black_won;
        winnerId = player.odId;
      } else if (isDraw) {
        gameStatus = GameStatus.draw;
      }

      // Save move and update game
      await this.prisma.$transaction([
        this.prisma.move.create({
          data: {
            gameId: data.gameId,
            moveNumber: game.moves.length + 1,
            from: data.from,
            to: data.to,
            piece: move.piece,
            promotion: data.promotion,
            capture: !!move.captured,
            check: chess.inCheck(),
            checkmate: isCheckmate,
            fen: chess.fen(),
            timeSpent,
          },
        }),
        this.prisma.game.update({
          where: { id: data.gameId },
          data: {
            boardStatus: chess.fen(),
            status: gameStatus,
            winnerId,
            player1TimeLeft:
              player.color === Side.white
                ? player.timeLeft
                : game.player1TimeLeft,
            player2TimeLeft:
              player.color === Side.black
                ? player.timeLeft
                : game.player2TimeLeft,
            lastTimerUpdate: new Date(),
          },
        }),
      ]);

      // Update room state
      room.currentTurn = isWhiteTurn ? Side.black : Side.white;

      // Broadcast move to all in room
      this.server.to(gameRoomId).emit('move-made', {
        from: data.from,
        to: data.to,
        promotion: data.promotion,
        fen: chess.fen(),
        san: move.san,
        moveNumber: game.moves.length + 1,
        whiteTimeLeft:
          player.color === Side.white ? player.timeLeft : game.player1TimeLeft,
        blackTimeLeft:
          player.color === Side.black ? player.timeLeft : game.player2TimeLeft,
        isCheck: chess.inCheck(),
        isCheckmate,
        isDraw,
        currentTurn: chess.turn() === 'w' ? 'white' : 'black',
      });

      // Handle game over
      if (isGameOver) {
        await this.endGame(
          gameRoomId,
          winnerId,
          isCheckmate ? 'checkmate' : 'draw',
        );
      }
    } catch (error) {
      this.logger.error('Move error:', error);
      client.emit('error', { message: 'Invalid move' });
    }
  }

  // ==================== TIMER ====================

  private startGameTimer(gameRoomId: string) {
    const room = this.gameRooms.get(gameRoomId);
    if (!room) return;

    room.timerInterval = setInterval(async () => {
      const currentRoom = this.gameRooms.get(gameRoomId);
      if (!currentRoom) {
        clearInterval(room.timerInterval);
        return;
      }

      // Find current player
      for (const [, player] of currentRoom.players) {
        if (player.color === currentRoom.currentTurn) {
          const elapsed = Date.now() - (currentRoom.lastMoveTime || Date.now());
          const timeLeft = player.timeLeft - elapsed;

          // Broadcast time update
          this.server.to(gameRoomId).emit('time-update', {
            color: player.color,
            timeLeft: Math.max(0, timeLeft),
          });

          // Check for timeout
          if (timeLeft <= 0) {
            clearInterval(room.timerInterval);
            const winnerId = Array.from(currentRoom.players.values()).find(
              (p) => p.color !== player.color,
            )?.odId;
            await this.endGame(gameRoomId, winnerId || null, 'timeout');
          }
          break;
        }
      }
    }, 100); // Update every 100ms
  }

  // ==================== GAME END ====================

  private async endGame(
    gameRoomId: string,
    winnerId: number | null,
    reason: string,
  ) {
    const room = this.gameRooms.get(gameRoomId);
    if (!room) return;

    // Clear timer
    if (room.timerInterval) {
      clearInterval(room.timerInterval);
    }

    // Determine game status
    let status: GameStatus;
    switch (reason) {
      case 'checkmate':
        status = winnerId
          ? Array.from(room.players.values()).find((p) => p.odId === winnerId)
              ?.color === Side.white
            ? GameStatus.white_won
            : GameStatus.black_won
          : GameStatus.draw;
        break;
      case 'timeout':
        status = GameStatus.timeout;
        break;
      case 'resigned':
        status = GameStatus.resigned;
        break;
      case 'abandoned':
        status = GameStatus.abandoned;
        break;
      default:
        status = GameStatus.draw;
    }

    // Update game in database
    const game = await this.prisma.game.update({
      where: { id: room.gameId },
      data: { status, winnerId },
    });

    // Update ratings for PvP games
    if (!game.isComputer && game.player1_id && game.player2_id) {
      const ratingChanges = await this.ratingService.updateRatingsAfterGame(
        game.id,
        game.player1_id,
        game.player2_id,
        winnerId,
      );

      // Broadcast game over with rating changes
      this.server.to(gameRoomId).emit('game-over', {
        winnerId,
        reason,
        status,
        ratingChanges,
      });
    } else {
      this.server.to(gameRoomId).emit('game-over', {
        winnerId,
        reason,
        status,
      });
    }

    // Cleanup
    this.gameRooms.delete(gameRoomId);
  }

  @SubscribeMessage('resign')
  async handleResign(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;
    const room = this.gameRooms.get(gameRoomId);
    const player = room?.players.get(client.id);

    if (!room || !player) {
      client.emit('error', { message: 'Not in game' });
      return;
    }

    // Find opponent
    const opponent = Array.from(room.players.values()).find(
      (p) => p.odId !== player.odId,
    );

    await this.endGame(gameRoomId, opponent?.odId || null, 'resigned');
  }

  @SubscribeMessage('offer-draw')
  handleOfferDraw(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;
    const room = this.gameRooms.get(gameRoomId);
    const player = room?.players.get(client.id);

    if (!room || !player) return;

    client.to(gameRoomId).emit('draw-offered', {
      from: player.odId,
      odName: player.odName,
    });
  }

  @SubscribeMessage('accept-draw')
  async handleAcceptDraw(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;
    await this.endGame(gameRoomId, null, 'draw');
  }

  @SubscribeMessage('decline-draw')
  handleDeclineDraw(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;
    client.to(gameRoomId).emit('draw-declined');
  }

  // ==================== CHAT ====================

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { gameId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const odId = this.socketToUser.get(client.id);
    if (!odId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const chatMessage = await this.chatService.createMessage(
      data.gameId,
      odId,
      data.message,
    );

    const gameRoomId = `game-${data.gameId}`;
    this.server.to(gameRoomId).emit('new-message', chatMessage);
  }

  @SubscribeMessage('get-messages')
  async handleGetMessages(
    @MessageBody() data: { gameId: number; limit?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getMessages(
      data.gameId,
      data.limit || 100,
    );
    client.emit('messages-history', messages);
  }

  // ==================== INVITE SYSTEM ====================

  @SubscribeMessage('create-private-game')
  async handleCreatePrivateGame(
    @MessageBody()
    data: { odId: number; odName: string; timeControl: string; color?: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Generate unique invite code
    const inviteCode = this.generateInviteCode();
    const timeInSeconds = this.parseTimeControl(data.timeControl);

    // Determine player color
    const playerIsWhite =
      data.color === 'white' ||
      (data.color === 'random' && Math.random() < 0.5);

    const game = await this.prisma.game.create({
      data: {
        player1_id: data.odId,
        isComputer: false,
        boardStatus: new Chess().fen(),
        status: GameStatus.waiting,
        isPrivate: true,
        inviteCode,
        timeControl: data.timeControl as any,
        initialTime: timeInSeconds,
        increment: this.getIncrement(data.timeControl),
        player1TimeLeft: timeInSeconds * 1000,
        player2TimeLeft: timeInSeconds * 1000,
      },
    });

    const gameRoomId = `game-${game.id}`;

    // Create room
    const room: GameRoom = {
      gameId: game.id,
      players: new Map(),
      spectators: new Set(),
      currentTurn: Side.white,
    };

    room.players.set(client.id, {
      odId: data.odId,
      odName: data.odName,
      color: playerIsWhite ? Side.white : Side.black,
      timeLeft: timeInSeconds * 1000,
    });

    this.gameRooms.set(gameRoomId, room);

    client.join(gameRoomId);
    this.socketToGame.set(client.id, gameRoomId);

    client.emit('private-game-created', {
      gameId: game.id,
      inviteCode,
      inviteLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/play-online/room/${game.id}?invite=${inviteCode}`,
      yourColor: playerIsWhite ? 'white' : 'black',
    });

    this.logger.log(
      `Private game ${game.id} created with invite code ${inviteCode}`,
    );
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // ==================== SPECTATOR ====================

  @SubscribeMessage('spectate-game')
  async handleSpectate(
    @MessageBody() data: { gameId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const gameRoomId = `game-${data.gameId}`;

    const game = await this.prisma.game.findUnique({
      where: { id: data.gameId },
      include: {
        moves: { orderBy: { moveNumber: 'asc' } },
        player1: { select: { id: true, name: true, rating: true } },
        player2: { select: { id: true, name: true, rating: true } },
      },
    });

    if (!game) {
      client.emit('error', { message: 'Game not found' });
      return;
    }

    client.join(gameRoomId);

    let room = this.gameRooms.get(gameRoomId);
    if (room) {
      room.spectators.add(client.id);
    }

    client.emit('spectate-state', {
      gameId: game.id,
      fen: game.boardStatus,
      status: game.status,
      moves: game.moves,
      white: game.player1,
      black: game.player2,
      whiteTimeLeft: game.player1TimeLeft,
      blackTimeLeft: game.player2TimeLeft,
    });
  }
}
