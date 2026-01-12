import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { GameStateManager } from '../state/game-state.manager';

@Injectable()
export class TimerHandler {
  private readonly logger = new Logger(TimerHandler.name);

  constructor(private readonly stateManager: GameStateManager) {}

  /**
   * Start the game timer for a room
   */
  startGameTimer(
    gameRoomId: string,
    server: Server,
    onTimeout: (
      gameRoomId: string,
      loserColor: string,
      winnerId: number | null,
    ) => Promise<void>,
  ): void {
    const room = this.stateManager.getRoom(gameRoomId);
    if (!room) return;

    room.timerInterval = setInterval(() => {
      const currentRoom = this.stateManager.getRoom(gameRoomId);
      if (!currentRoom) {
        this.stopTimer(gameRoomId);
        return;
      }

      // Find current player
      for (const [, player] of currentRoom.players) {
        if (player.color === currentRoom.currentTurn) {
          const elapsed = Date.now() - (currentRoom.lastMoveTime || Date.now());
          const timeLeft = player.timeLeft - elapsed;

          // Broadcast time update
          server.to(gameRoomId).emit('time-update', {
            color: player.color,
            timeLeft: Math.max(0, timeLeft),
          });

          // Check for timeout
          if (timeLeft <= 0) {
            this.stopTimer(gameRoomId);
            const winnerId = Array.from(currentRoom.players.values()).find(
              (p) => p.color !== player.color,
            )?.odId;
            void onTimeout(gameRoomId, player.color, winnerId || null);
          }
          break;
        }
      }
    }, 100); // Update every 100ms
  }

  /**
   * Stop the timer for a room
   */
  stopTimer(gameRoomId: string): void {
    const room = this.stateManager.getRoom(gameRoomId);
    if (room?.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = undefined;
    }
  }

  /**
   * Calculate time spent since last move
   */
  getTimeSpent(gameRoomId: string): number {
    const room = this.stateManager.getRoom(gameRoomId);
    if (!room) return 0;

    const now = Date.now();
    return room.lastMoveTime ? now - room.lastMoveTime : 0;
  }

  /**
   * Update the last move time for a room
   */
  updateLastMoveTime(gameRoomId: string): void {
    const room = this.stateManager.getRoom(gameRoomId);
    if (room) {
      room.lastMoveTime = Date.now();
    }
  }
}
