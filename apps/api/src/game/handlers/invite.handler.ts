import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { GameStateManager } from '../state/game-state.manager';
import { GameRoom, CreatePrivateGamePayload } from '../types/game.types';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class InviteHandler {
  private readonly logger = new Logger(InviteHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create a private game with invite code
   */
  async createPrivateGame(
    client: Socket,
    data: CreatePrivateGamePayload,
  ): Promise<void> {
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

    const gameRoomId = GameStateManager.getRoomId(game.id);

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

    this.stateManager.setRoom(gameRoomId, room);

    void client.join(gameRoomId);
    this.stateManager.setSocketToGame(client.id, gameRoomId);

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

  /**
   * Generate a unique invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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
