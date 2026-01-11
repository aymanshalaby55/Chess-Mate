import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatingService {
  private readonly logger = new Logger(RatingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate ELO rating change
   * K-factor: 32 for players under 2100, 24 for 2100-2400, 16 for 2400+
   */
  private calculateKFactor(rating: number): number {
    if (rating < 2100) return 32;
    if (rating < 2400) return 24;
    return 16;
  }

  /**
   * Calculate expected score based on ratings
   */
  private calculateExpectedScore(
    playerRating: number,
    opponentRating: number,
  ): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  /**
   * Calculate new rating after a game
   * @param playerRating Current player rating
   * @param opponentRating Opponent's rating
   * @param score 1 for win, 0.5 for draw, 0 for loss
   */
  calculateNewRating(
    playerRating: number,
    opponentRating: number,
    score: number,
  ): { newRating: number; change: number } {
    const kFactor = this.calculateKFactor(playerRating);
    const expectedScore = this.calculateExpectedScore(
      playerRating,
      opponentRating,
    );
    const change = Math.round(kFactor * (score - expectedScore));
    const newRating = Math.max(100, playerRating + change); // Minimum rating of 100

    return { newRating, change };
  }

  /**
   * Update ratings for both players after a game
   */
  async updateRatingsAfterGame(
    gameId: number,
    player1Id: number,
    player2Id: number,
    winnerId: number | null, // null means draw
  ) {
    const [player1, player2] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: player1Id } }),
      this.prisma.user.findUnique({ where: { id: player2Id } }),
    ]);

    if (!player1 || !player2) {
      this.logger.warn('Could not find players for rating update');
      return;
    }

    // Determine scores
    let player1Score: number;
    let player2Score: number;

    if (winnerId === null) {
      // Draw
      player1Score = 0.5;
      player2Score = 0.5;
    } else if (winnerId === player1Id) {
      player1Score = 1;
      player2Score = 0;
    } else {
      player1Score = 0;
      player2Score = 1;
    }

    // Calculate new ratings
    const player1Result = this.calculateNewRating(
      player1.rating,
      player2.rating,
      player1Score,
    );
    const player2Result = this.calculateNewRating(
      player2.rating,
      player1.rating,
      player2Score,
    );

    // Update in transaction
    await this.prisma.$transaction([
      // Update player 1
      this.prisma.user.update({
        where: { id: player1Id },
        data: {
          rating: player1Result.newRating,
          gamesPlayed: { increment: 1 },
          wins: winnerId === player1Id ? { increment: 1 } : undefined,
          losses: winnerId === player2Id ? { increment: 1 } : undefined,
          draws: winnerId === null ? { increment: 1 } : undefined,
        },
      }),
      // Update player 2
      this.prisma.user.update({
        where: { id: player2Id },
        data: {
          rating: player2Result.newRating,
          gamesPlayed: { increment: 1 },
          wins: winnerId === player2Id ? { increment: 1 } : undefined,
          losses: winnerId === player1Id ? { increment: 1 } : undefined,
          draws: winnerId === null ? { increment: 1 } : undefined,
        },
      }),
      // Record rating history for player 1
      this.prisma.ratingHistory.create({
        data: {
          userId: player1Id,
          rating: player1Result.newRating,
          gameId,
          change: player1Result.change,
        },
      }),
      // Record rating history for player 2
      this.prisma.ratingHistory.create({
        data: {
          userId: player2Id,
          rating: player2Result.newRating,
          gameId,
          change: player2Result.change,
        },
      }),
    ]);

    this.logger.log(
      `Updated ratings: Player ${player1Id}: ${player1.rating} -> ${player1Result.newRating} (${player1Result.change > 0 ? '+' : ''}${player1Result.change}), ` +
        `Player ${player2Id}: ${player2.rating} -> ${player2Result.newRating} (${player2Result.change > 0 ? '+' : ''}${player2Result.change})`,
    );

    return {
      player1: {
        oldRating: player1.rating,
        newRating: player1Result.newRating,
        change: player1Result.change,
      },
      player2: {
        oldRating: player2.rating,
        newRating: player2Result.newRating,
        change: player2Result.change,
      },
    };
  }

  /**
   * Get rating history for a user
   */
  async getRatingHistory(userId: number, limit: number = 50) {
    return this.prisma.ratingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}


