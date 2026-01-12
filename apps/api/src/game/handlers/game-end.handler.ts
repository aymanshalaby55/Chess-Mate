import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { RatingService } from '../../rating/rating.service';
import { GameStateManager } from '../state/game-state.manager';
import { TimerHandler } from './timer.handler';
import { GameStatus, Side } from '@prisma/client';

@Injectable()
export class GameEndHandler {
  private readonly logger = new Logger(GameEndHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly prisma: PrismaService,
    private readonly ratingService: RatingService,
    private readonly timerHandler: TimerHandler,
  ) {}

  /**
   * End a game with a winner and reason
   */
  async endGame(
    gameRoomId: string,
    winnerId: number | null,
    reason: string,
    server: Server,
  ): Promise<void> {
    const room = this.stateManager.getRoom(gameRoomId);
    if (!room) return;

    // Clear timer
    this.timerHandler.stopTimer(gameRoomId);

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
      server.to(gameRoomId).emit('game-over', {
        winnerId,
        reason,
        status,
        ratingChanges,
      });
    } else {
      server.to(gameRoomId).emit('game-over', {
        winnerId,
        reason,
        status,
      });
    }

    // Cleanup room
    this.stateManager.deleteRoom(gameRoomId);
  }

  /**
   * Handle player resignation
   */
  async handleResign(
    client: Socket,
    gameId: number,
    server: Server,
  ): Promise<void> {
    const gameRoomId = GameStateManager.getRoomId(gameId);
    const room = this.stateManager.getRoom(gameRoomId);
    const player = room?.players.get(client.id);

    if (!room || !player) {
      client.emit('error', { message: 'Not in game' });
      return;
    }

    // Find opponent
    const opponent = Array.from(room.players.values()).find(
      (p) => p.odId !== player.odId,
    );

    await this.endGame(gameRoomId, opponent?.odId || null, 'resigned', server);
  }

  /**
   * Handle draw offer
   */
  handleOfferDraw(client: Socket, gameId: number): void {
    const gameRoomId = GameStateManager.getRoomId(gameId);
    const room = this.stateManager.getRoom(gameRoomId);
    const player = room?.players.get(client.id);

    if (!room || !player) return;

    client.to(gameRoomId).emit('draw-offered', {
      from: player.odId,
      odName: player.odName,
    });
  }

  /**
   * Handle draw acceptance
   */
  async handleAcceptDraw(
    client: Socket,
    gameId: number,
    server: Server,
  ): Promise<void> {
    const gameRoomId = GameStateManager.getRoomId(gameId);
    await this.endGame(gameRoomId, null, 'draw', server);
  }

  /**
   * Handle draw decline
   */
  handleDeclineDraw(client: Socket, gameId: number): void {
    const gameRoomId = GameStateManager.getRoomId(gameId);
    client.to(gameRoomId).emit('draw-declined');
  }

  /**
   * Handle player disconnect during game
   */
  async handlePlayerDisconnect(
    socketId: string,
    gameRoomId: string,
    server: Server,
  ): Promise<void> {
    const room = this.stateManager.getRoom(gameRoomId);
    if (!room) return;

    const player = room.players.get(socketId);
    if (player) {
      room.players.delete(socketId);

      // Notify other players
      server.to(gameRoomId).emit('player-disconnected', {
        odId: player.odId,
        odName: player.odName,
      });

      // If game was ongoing, handle abandonment
      if (room.players.size === 1) {
        // Give 60 seconds to reconnect
        setTimeout(async () => {
          const currentRoom = this.stateManager.getRoom(gameRoomId);
          if (currentRoom && currentRoom.players.size === 1) {
            // Player didn't reconnect, opponent wins
            const remainingPlayer = Array.from(currentRoom.players.values())[0];
            await this.endGame(
              gameRoomId,
              remainingPlayer.odId,
              'abandoned',
              server,
            );
          }
        }, 60000);
      }
    }
  }
}

