import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameStatus, Side, TimeControl } from '@prisma/client';
import { Chess } from 'chess.js';
import { GameDto } from './dto/game.dto';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a game against the computer
   */
  async createGamePvc(
    userId: number,
    playerSide: Side,
    timeControl?: TimeControl,
  ): Promise<GameDto> {
    if (!Object.values(Side).includes(playerSide)) {
      throw new BadRequestException(`Invalid side: ${playerSide}`);
    }

    const computerSide = playerSide === Side.white ? Side.black : Side.white;
    const chess = new Chess();

    // Parse time control if provided
    const timeInMs = timeControl
      ? this.parseTimeControl(timeControl) * 1000
      : null;

    const game = await this.prisma.game.create({
      data: {
        player1_id: userId,
        player2_id: userId, // For PvC, same user as both players
        isComputer: true,
        computerSide,
        boardStatus: chess.fen(),
        status: GameStatus.ongoing,
        timeControl,
        initialTime: timeControl ? this.parseTimeControl(timeControl) : null,
        increment: timeControl ? this.getIncrement(timeControl) : null,
        player1TimeLeft: timeInMs,
        player2TimeLeft: timeInMs,
      },
    });

    this.logger.log(`Created PvC game ${game.id} for user ${userId}`);
    return game;
  }

  /**
   * Create a private game with invite link
   */
  async createPrivateGame(
    userId: number,
    playerSide: Side,
    timeControl?: TimeControl,
  ) {
    const inviteCode = this.generateInviteCode();
    const chess = new Chess();
    const timeInMs = timeControl
      ? this.parseTimeControl(timeControl) * 1000
      : 600000;

    const game = await this.prisma.game.create({
      data: {
        player1_id: userId,
        isComputer: false,
        boardStatus: chess.fen(),
        status: GameStatus.waiting,
        isPrivate: true,
        inviteCode,
        timeControl,
        initialTime: timeControl ? this.parseTimeControl(timeControl) : 600,
        increment: timeControl ? this.getIncrement(timeControl) : 0,
        player1TimeLeft: timeInMs,
        player2TimeLeft: timeInMs,
      },
    });

    this.logger.log(
      `Created private game ${game.id} with invite code ${inviteCode}`,
    );

    return {
      ...game,
      inviteLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/play-online/room/${game.id}?invite=${inviteCode}`,
    };
  }

  /**
   * Join a game via invite code
   */
  async joinGameByInvite(userId: number, inviteCode: string) {
    const game = await this.prisma.game.findUnique({
      where: { inviteCode },
    });

    if (!game) {
      throw new NotFoundException('Invalid invite code');
    }

    if (game.status !== GameStatus.waiting) {
      throw new BadRequestException('Game is no longer available');
    }

    if (game.player1_id === userId) {
      throw new BadRequestException('Cannot join your own game');
    }

    const updatedGame = await this.prisma.game.update({
      where: { id: game.id },
      data: {
        player2_id: userId,
        status: GameStatus.ongoing,
      },
      include: {
        player1: {
          select: { id: true, name: true, rating: true, picture: true },
        },
        player2: {
          select: { id: true, name: true, rating: true, picture: true },
        },
      },
    });

    this.logger.log(`User ${userId} joined game ${game.id}`);
    return updatedGame;
  }

  /**
   * Get games for a user
   */
  async getGames(userId: number, limit: number = 10, offset: number = 0) {
    const games = await this.prisma.game.findMany({
      where: { OR: [{ player1_id: userId }, { player2_id: userId }] },
      include: {
        player1: {
          select: { id: true, name: true, rating: true, picture: true },
        },
        player2: {
          select: { id: true, name: true, rating: true, picture: true },
        },
        _count: { select: { moves: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return games;
  }

  /**
   * Get a specific game with all details
   */
  async getGame(gameId: number, userId?: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: {
        moves: { orderBy: { moveNumber: 'asc' } },
        player1: {
          select: { id: true, name: true, rating: true, picture: true },
        },
        player2: {
          select: { id: true, name: true, rating: true, picture: true },
        },
        chatMessages: {
          include: {
            user: { select: { id: true, name: true, picture: true } },
          },
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    return game;
  }

  /**
   * Get game by invite code
   */
  async getGameByInvite(inviteCode: string) {
    const game = await this.prisma.game.findUnique({
      where: { inviteCode },
      include: {
        player1: {
          select: { id: true, name: true, rating: true, picture: true },
        },
      },
    });

    if (!game) {
      throw new NotFoundException('Invalid invite code');
    }

    return game;
  }

  /**
   * Resign from a game
   */
  async resignGame(gameId: number, userId: number) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    if (game.player1_id !== userId && game.player2_id !== userId) {
      throw new BadRequestException('User is not a player in this game');
    }

    if (game.status !== GameStatus.ongoing) {
      throw new BadRequestException('Game is not ongoing');
    }

    const winnerId =
      game.player1_id === userId ? game.player2_id : game.player1_id;

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

  /**
   * Update game with computer move (for PvC games)
   */
  async makeComputerMove(
    gameId: number,
    userId: number,
    move: { from: string; to: string; promotion?: string },
  ) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { moves: true },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    if (!game.isComputer) {
      throw new BadRequestException('Not a computer game');
    }

    if (game.player1_id !== userId) {
      throw new BadRequestException('Not your game');
    }

    if (game.status !== GameStatus.ongoing) {
      throw new BadRequestException('Game is not ongoing');
    }

    const chess = new Chess(game.boardStatus);
    const moveResult = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });

    if (!moveResult) {
      throw new BadRequestException('Invalid move');
    }

    // Check game status
    const isCheckmate = chess.isCheckmate();
    const isDraw = chess.isDraw();
    let gameStatus: GameStatus = game.status;
    let winnerId: number | null = null;

    if (isCheckmate) {
      const computerWon = chess.turn() !== game.computerSide?.[0];
      gameStatus = computerWon ? GameStatus.black_won : GameStatus.white_won;
      winnerId = computerWon ? null : userId; // null for computer win
    } else if (isDraw) {
      gameStatus = GameStatus.draw;
    }

    // Save in transaction
    const result = await this.prisma.$transaction([
      this.prisma.move.create({
        data: {
          gameId,
          moveNumber: game.moves.length + 1,
          from: move.from,
          to: move.to,
          piece: moveResult.piece,
          promotion: move.promotion,
          capture: !!moveResult.captured,
          check: chess.inCheck(),
          checkmate: isCheckmate,
          fen: chess.fen(),
        },
      }),
      this.prisma.game.update({
        where: { id: gameId },
        data: {
          boardStatus: chess.fen(),
          status: gameStatus,
          winnerId,
        },
      }),
    ]);

    return result[1];
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        rating: true,
        gamesPlayed: true,
        wins: true,
        losses: true,
        draws: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get recent games
    const recentGames = await this.prisma.game.findMany({
      where: {
        OR: [{ player1_id: userId }, { player2_id: userId }],
        status: { not: GameStatus.ongoing },
      },
      orderBy: { lastMoveAt: 'desc' },
      take: 10,
      include: {
        player1: { select: { id: true, name: true, rating: true } },
        player2: { select: { id: true, name: true, rating: true } },
      },
    });

    // Get rating history
    const ratingHistory = await this.prisma.ratingHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      ...user,
      winRate: user.gamesPlayed > 0 ? (user.wins / user.gamesPlayed) * 100 : 0,
      recentGames,
      ratingHistory,
    };
  }

  // Helper methods
  private parseTimeControl(timeControl: TimeControl): number {
    const timeMap: Record<TimeControl, number> = {
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

  private getIncrement(timeControl: TimeControl): number {
    if (
      timeControl === TimeControl.rapid_10min ||
      timeControl === TimeControl.rapid_15min ||
      timeControl === TimeControl.rapid_30min ||
      timeControl === TimeControl.classical_60min
    ) {
      return 5;
    }
    if (
      timeControl === TimeControl.blitz_3min ||
      timeControl === TimeControl.blitz_5min
    ) {
      return 2;
    }
    return 0;
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
