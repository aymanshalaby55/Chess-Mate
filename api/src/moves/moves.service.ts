import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { makeMove } from './dto/makMove.dto';
import { Chess } from 'chess.js';
import { GameStatus, Side } from '@prisma/client';

@Injectable()
export class MovesService {
  constructor(private readonly prisma: PrismaService) {}

  async makeMove(move: makeMove, gameId: number, userId: number) {
    // Fetch the game with relevant details
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

    if (game.status !== GameStatus.ongoing) {
      throw new BadRequestException('Game is not ongoing');
    }

    // Validate player authorization
    const isPlayer1 = game.player1_id === userId;
    const isPlayer2 = game.player2_id === userId;
    if (!game.isComputer && !isPlayer1 && !isPlayer2) {
      throw new BadRequestException('User is not a player in this game');
    }

    // Initialize chess board
    const chess = new Chess(game.boardStatus);

    // Validate whose turn it is
    const isWhiteTurn = chess.turn() === 'w';
    const isPlayerTurn =
      (isWhiteTurn && isPlayer1 && game.computerSide !== Side.white) ||
      (!isWhiteTurn && isPlayer2 && game.computerSide !== Side.black);
    if (!isPlayerTurn) {
      throw new BadRequestException('Not your turn to move');
    }

    // Validate the move
    const moveResult = chess.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    });

    if (!moveResult) {
      throw new BadRequestException('Invalid move');
    }

    // Check game outcome
    const isCheckmate = chess.isCheckmate();
    const isStalemate = chess.isStalemate();
    const isDraw = chess.isDraw();
    const isGameOver = isCheckmate || isStalemate || isDraw;

    let gameStatus: GameStatus = game.status;
    let winnerId: number | null = null;

    if (isGameOver) {
      if (isCheckmate) {
        gameStatus = GameStatus.white_won;
        winnerId = isWhiteTurn ? game.player1_id : game.player2_id;
      } else if (isStalemate || isDraw) {
        gameStatus = GameStatus.draw;
      }
    }

    // // Validate move number
    // const expectedMoveNumber = game.moves.length + 1;
    // if (move.moveNumber !== expectedMoveNumber) {
    //   throw new BadRequestException(
    //     `Invalid move number. Expected ${expectedMoveNumber}, got ${move.moveNumber}`,
    //   );
    // }

    // Use a transaction to ensure atomicity
    const data = await this.prisma.$transaction(async (prisma) => {
      // Create the move in the database
      await prisma.move.create({
        data: {
          gameId: move.gameId,
          moveNumber: move.moveNumber,
          from: move.from,
          to: move.to,
          piece: move.piece,
          promotion: move.promotion,
          capture: !!moveResult.captured,
          check: chess.inCheck(),
          checkmate: isCheckmate,
          fen: chess.fen(),
        },
      });

      // Update game state
      const updatedGame = await prisma.game.update({
        where: { id: gameId },
        data: {
          boardStatus: chess.fen(),
          status: gameStatus,
          winnerId,
          lastMoveAt: new Date(),
        },
      });

      return updatedGame;
    });
    return data;
  }
}
