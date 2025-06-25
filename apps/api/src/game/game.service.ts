import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';
import { GameDto } from './dto/game.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createGamePvc(userId: number, playerSide: Side): Promise<GameDto> {
    // Validate playerSide
    if (!Object.values(Side).includes(playerSide)) {
      throw new BadRequestException(`Invalid side: ${playerSide}`);
    }
    // pick computer side
    const computerSide = playerSide === Side.white ? Side.black : Side.white;

    const chess = new Chess();

    // Create the game record
    const game = await this.prisma.game.create({
      data: {
        player1_id: userId,
        player2_id: userId, // For PvC, same user as both players
        isComputer: true,
        computerSide,
        boardStatus: chess.fen(),
        status: GameStatus.ongoing,
      },
    });

    this.logger.log(`Created PvC game ${game.id} for user ${userId}`);
    return game;
  }

  async getGames(userId: number, limit: number = 1, offset: number = 0) {
    const games = await this.prisma.game.findMany({
      where: { OR: [{ player1_id: userId }, { player2_id: userId }] },
      take: limit,
      skip: offset,
    });

    if (!games || games.length === 0) {
      throw new NotFoundException('No game found for this user');
    }

    return games;
  }

  async getGame(gameId: number, userId: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        moves: {
          orderBy: { moveNumber: 'asc' },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    // Validate user access
    if (game.player1_id !== userId && game.player2_id !== userId) {
      throw new BadRequestException('User is not a player in this game');
    }

    return game;
  }

  async resignGame(gameId: number, userId: number) {
    const game = await this.getGame(gameId, userId);

    // Check if game is ongoing
    if (game.status !== GameStatus.ongoing) {
      throw new BadRequestException('Game is not ongoing');
    }

    // Determine winner (opponent of the resigning player)
    const winnerId =
      game.player1_id === userId ? game.player2_id : game.player1_id;

    // Update game status
    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.resigned,
        winnerId,
        lastMoveAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} resigned game ${gameId}`);
    return updatedGame;
  }
}
