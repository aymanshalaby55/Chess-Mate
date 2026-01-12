import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { GameStateManager } from '../state/game-state.manager';
import { GameRoom, JoinGamePayload, JoinByInvitePayload } from '../types/game.types';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class GameRoomHandler {
  private readonly logger = new Logger(GameRoomHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Join a game room
   */
  async joinGame(
    client: Socket,
    data: JoinGamePayload,
    server: Server,
  ): Promise<void> {
    const gameRoomId = GameStateManager.getRoomId(data.gameId);

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
    this.stateManager.setSocketToGame(client.id, gameRoomId);

    let room = this.stateManager.getRoom(gameRoomId);
    if (!room) {
      room = {
        gameId: data.gameId,
        players: new Map(),
        spectators: new Set(),
        currentTurn:
          new Chess(game.boardStatus).turn() === 'w' ? Side.white : Side.black,
        lastMoveTime: Date.now(),
      };
      this.stateManager.setRoom(gameRoomId, room);
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

  /**
   * Join a game via invite code
   */
  async joinByInvite(
    client: Socket,
    data: JoinByInvitePayload,
    server: Server,
    onGameStarted: (gameRoomId: string) => void,
  ): Promise<void> {
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
      await this.joinGame(
        client,
        { gameId: game.id, odId: data.odId, odName: data.odName },
        server,
      );
      return;
    }

    // If game already has player2 and it's this user, just join
    if (game.player2_id === data.odId) {
      this.logger.log(`Player2 ${data.odId} rejoining game ${game.id}`);
      await this.joinGame(
        client,
        { gameId: game.id, odId: data.odId, odName: data.odName },
        server,
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
    await this.prisma.game.update({
      where: { id: game.id },
      data: {
        player2_id: data.odId,
        status: GameStatus.ongoing,
      },
    });

    this.logger.log(`Player ${data.odId} joined game ${game.id} via invite`);

    // Join the game room
    await this.joinGame(
      client,
      { gameId: game.id, odId: data.odId, odName: data.odName },
      server,
    );

    // Notify player 1 that the game has started
    const gameRoomId = GameStateManager.getRoomId(game.id);
    client.to(gameRoomId).emit('game-started', {
      gameId: game.id,
      opponent: { odId: data.odId, odName: data.odName },
    });

    // Trigger timer start
    onGameStarted(gameRoomId);
  }
}

