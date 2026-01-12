import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { GameStateManager } from '../state/game-state.manager';
import { GameRoom } from '../types/game.types';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class MatchmakingHandler {
  private readonly logger = new Logger(MatchmakingHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Add a player to the matchmaking queue
   */
  joinMatchmaking(
    client: Socket,
    data: { odId: number; odName: string; rating: number; timeControl: string },
  ): void {
    this.logger.log(
      `User ${data.odId} joining matchmaking for ${data.timeControl}`,
    );

    this.stateManager.addToQueue(client.id, {
      ...data,
      joinedAt: Date.now(),
    });

    client.emit('matchmaking-joined', {
      position: this.stateManager.getQueueSize(),
    });
  }

  /**
   * Remove a player from the matchmaking queue
   */
  leaveMatchmaking(client: Socket): void {
    this.stateManager.removeFromQueue(client.id);
    client.emit('matchmaking-left');
  }

  /**
   * Try to find a match for a player
   */
  async findMatch(
    socketId: string,
    server: Server,
    onGameCreated: (gameRoomId: string) => void,
  ): Promise<void> {
    const player = this.stateManager.getQueuePlayer(socketId);
    if (!player) return;

    for (const [
      opponentSocketId,
      opponent,
    ] of this.stateManager.getQueueEntries()) {
      if (opponentSocketId === socketId) continue;
      if (opponent.timeControl !== player.timeControl) continue;

      // Rating difference tolerance (expands over time)
      const waitTime = Date.now() - player.joinedAt;
      const ratingTolerance = Math.min(
        100 + Math.floor(waitTime / 5000) * 50,
        500,
      );

      if (Math.abs(player.rating - opponent.rating) <= ratingTolerance) {
        await this.createMatchedGame(
          socketId,
          opponentSocketId,
          server,
          onGameCreated,
        );
        return;
      }
    }
  }

  /**
   * Create a game between two matched players
   */
  private async createMatchedGame(
    socket1Id: string,
    socket2Id: string,
    server: Server,
    onGameCreated: (gameRoomId: string) => void,
  ): Promise<void> {
    const player1 = this.stateManager.getQueuePlayer(socket1Id);
    const player2 = this.stateManager.getQueuePlayer(socket2Id);

    if (!player1 || !player2) return;

    // Remove from queue
    this.stateManager.removeFromQueue(socket1Id);
    this.stateManager.removeFromQueue(socket2Id);

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

    const gameRoomId = GameStateManager.getRoomId(game.id);

    // Create game room
    const room: GameRoom = {
      gameId: game.id,
      players: new Map(),
      spectators: new Set(),
      currentTurn: Side.white,
      lastMoveTime: Date.now(),
    };

    // Add players to room
    const socket1 = server.sockets.sockets.get(socket1Id);
    const socket2 = server.sockets.sockets.get(socket2Id);

    if (socket1 && socket2) {
      void socket1.join(gameRoomId);
      void socket2.join(gameRoomId);

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

      this.stateManager.setSocketToGame(socket1Id, gameRoomId);
      this.stateManager.setSocketToGame(socket2Id, gameRoomId);
    }

    this.stateManager.setRoom(gameRoomId, room);

    // Notify both players
    server.to(gameRoomId).emit('game-matched', {
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

    // Trigger game timer start callback
    void Promise.resolve(onGameCreated(gameRoomId));

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
    if (timeControl.includes('rapid') || timeControl.includes('classical')) {
      return 5;
    }
    if (timeControl.includes('blitz')) {
      return 2;
    }
    return 0;
  }
}
