import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { GameStateManager } from '../state/game-state.manager';

@Injectable()
export class SpectatorHandler {
  private readonly logger = new Logger(SpectatorHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Join a game as a spectator
   */
  async spectateGame(client: Socket, gameId: number): Promise<void> {
    const gameRoomId = GameStateManager.getRoomId(gameId);

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
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

    const room = this.stateManager.getRoom(gameRoomId);
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

    this.logger.log(`Spectator joined game ${gameId}`);
  }
}

