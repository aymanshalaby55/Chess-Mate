import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createGamePvc(userId: number, playerSide: Side) {
    // Validate playerSide
    if (!Object.values(Side).includes(playerSide)) {
      throw new BadRequestException(`Invalid side: ${playerSide}`);
    }
    // pick computer side.
    let computerSide;
    if (playerSide === Side.white) {
      computerSide = Side.black;
    } else {
      computerSide = Side.black;
    }

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
  async getGame(gameId: number, userId: number) {
    return userId;
  }

  // async resignGame(gameId: number, userId: number) {
  //   const game = await this.getGame(gameId);

  //   // Validate player
  //   if (game.player1_id !== userId && game.player2_id !== userId) {
  //     throw new BadRequestException('User is not a player in this game');
  //   }

  //   // Check if game is ongoing
  //   if (game.status !== GameStatus.ongoing) {
  //     throw new BadRequestException('Game is not ongoing');
  //   }

  //   // Determine winner (opponent of the resigning player)
  //   const winnerId = game.player1_id === userId ? game.player2_id : game.player1_id;

  //   // Update game status
  //   const updatedGame = await this.prisma.game.update({
  //     where: { id: gameId },
  //     data: {
  //       status: GameStatus.resigned,
  //       winnerId,
  //       lastMoveAt: new Date(),
  //     },
  //   });

  //   this.logger.log(`User ${userId} resigned game ${gameId}`);
  //   return updatedGame;
  // }
}
