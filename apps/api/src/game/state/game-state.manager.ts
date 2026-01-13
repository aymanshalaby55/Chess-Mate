import { Injectable, Logger } from '@nestjs/common';
import { GameRoom, MatchmakingPlayer } from '../types/game.types';

/**
 * Centralized state manager for all game-related data.
 * Handles game rooms, socket mappings, and matchmaking queue.
 */
@Injectable()
export class GameStateManager {
  private readonly logger = new Logger(GameStateManager.name);

  // Active game rooms
  private gameRooms: Map<string, GameRoom> = new Map();

  // Socket to game mapping
  private socketToGame: Map<string, string> = new Map();

  // Socket to user mapping
  private socketToUser: Map<string, number> = new Map();

  // Matchmaking queue
  private matchmakingQueue: Map<string, MatchmakingPlayer> = new Map();

  // ==================== GAME ROOMS ====================

  getRoom(gameRoomId: string): GameRoom | undefined {
    return this.gameRooms.get(gameRoomId);
  }

  setRoom(gameRoomId: string, room: GameRoom): void {
    this.gameRooms.set(gameRoomId, room);
  }

  deleteRoom(gameRoomId: string): boolean {
    return this.gameRooms.delete(gameRoomId);
  }

  hasRoom(gameRoomId: string): boolean {
    return this.gameRooms.has(gameRoomId);
  }

  // ==================== SOCKET TO GAME MAPPING ====================

  getGameIdBySocket(socketId: string): string | undefined {
    return this.socketToGame.get(socketId);
  }

  setSocketToGame(socketId: string, gameRoomId: string): void {
    this.socketToGame.set(socketId, gameRoomId);
  }

  deleteSocketToGame(socketId: string): boolean {
    return this.socketToGame.delete(socketId);
  }

  // ==================== SOCKET TO USER MAPPING ====================

  getUserIdBySocket(socketId: string): number | undefined {
    return this.socketToUser.get(socketId);
  }

  setSocketToUser(socketId: string, odId: number): void {
    this.socketToUser.set(socketId, odId);
  }

  deleteSocketToUser(socketId: string): boolean {
    return this.socketToUser.delete(socketId);
  }

  // ==================== MATCHMAKING QUEUE ====================

  getQueuePlayer(socketId: string): MatchmakingPlayer | undefined {
    return this.matchmakingQueue.get(socketId);
  }

  addToQueue(socketId: string, player: MatchmakingPlayer): void {
    this.matchmakingQueue.set(socketId, player);
  }

  removeFromQueue(socketId: string): boolean {
    return this.matchmakingQueue.delete(socketId);
  }

  getQueueSize(): number {
    return this.matchmakingQueue.size;
  }

  getQueueEntries(): IterableIterator<[string, MatchmakingPlayer]> {
    return this.matchmakingQueue.entries();
  }

  // ==================== CLEANUP ====================

  /**
   * Cleanup all data associated with a socket when disconnecting
   */
  cleanupSocket(socketId: string): { gameRoomId?: string; userId?: number } {
    const gameRoomId = this.socketToGame.get(socketId);
    const userId = this.socketToUser.get(socketId);

    this.matchmakingQueue.delete(socketId);
    this.socketToGame.delete(socketId);
    this.socketToUser.delete(socketId);

    return { gameRoomId, userId };
  }

  /**
   * Get room ID format from game ID
   */
  static getRoomId(gameId: number): string {
    return `game-${gameId}`;
  }

  /**
   * Extract game ID from room ID
   */
  static getGameId(roomId: string): number {
    return parseInt(roomId.replace('game-', ''), 10);
  }
}
