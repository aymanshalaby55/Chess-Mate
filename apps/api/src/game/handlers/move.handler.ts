import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../prisma/prisma.service';
import { GameStateManager } from '../state/game-state.manager';
import { TimerHandler } from './timer.handler';
import { MakeMovePayload } from '../types/game.types';
import { GameStatus, Side } from '@prisma/client';
import { Chess } from 'chess.js';

@Injectable()
export class MoveHandler {
  private readonly logger = new Logger(MoveHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly prisma: PrismaService,
    private readonly timerHandler: TimerHandler,
  ) {}

  /**
   * Handle a chess move
   */
  async makeMove(
    client: Socket,
    data: MakeMovePayload,
    server: Server,
    onGameOver: (
      gameRoomId: string,
      winnerId: number | null,
      reason: string,
    ) => Promise<void>,
  ): Promise<void> {
    const gameRoomId = GameStateManager.getRoomId(data.gameId);
    const room = this.stateManager.getRoom(gameRoomId);
    const player = room?.players.get(client.id);

    if (!room || !player) {
      client.emit('error', { message: 'Not in game' });
      return;
    }

    // Get current game state
    const game = await this.prisma.game.findUnique({
      where: { id: data.gameId },
      include: { moves: true },
    });

    if (!game || game.status !== GameStatus.ongoing) {
      client.emit('error', { message: 'Game not active' });
      return;
    }

    // Validate it's player's turn
    const chess = new Chess(game.boardStatus);
    const isWhiteTurn = chess.turn() === 'w';
    const isPlayerTurn =
      (isWhiteTurn && player.color === Side.white) ||
      (!isWhiteTurn && player.color === Side.black);

    if (!isPlayerTurn) {
      client.emit('error', { message: 'Not your turn' });
      return;
    }

    // Make the move
    try {
      const move = chess.move({
        from: data.from,
        to: data.to,
        promotion: data.promotion,
      });

      if (!move) {
        client.emit('error', { message: 'Invalid move' });
        return;
      }

      // Calculate time spent
      const timeSpent = this.timerHandler.getTimeSpent(gameRoomId);
      this.timerHandler.updateLastMoveTime(gameRoomId);

      // Update player time
      const increment = (game.increment || 0) * 1000;
      player.timeLeft = Math.max(0, player.timeLeft - timeSpent + increment);

      // Check game status
      const isCheckmate = chess.isCheckmate();
      const isDraw = chess.isDraw();
      const isGameOver = isCheckmate || isDraw;

      let gameStatus: GameStatus = game.status;
      let winnerId: number | null = null;

      if (isCheckmate) {
        gameStatus = isWhiteTurn ? GameStatus.white_won : GameStatus.black_won;
        winnerId = player.odId;
      } else if (isDraw) {
        gameStatus = GameStatus.draw;
      }

      // Save move and update game
      await this.prisma.$transaction([
        this.prisma.move.create({
          data: {
            gameId: data.gameId,
            moveNumber: game.moves.length + 1,
            from: data.from,
            to: data.to,
            piece: move.piece,
            promotion: data.promotion,
            capture: !!move.captured,
            check: chess.inCheck(),
            checkmate: isCheckmate,
            fen: chess.fen(),
            timeSpent,
          },
        }),
        this.prisma.game.update({
          where: { id: data.gameId },
          data: {
            boardStatus: chess.fen(),
            status: gameStatus,
            winnerId,
            player1TimeLeft:
              player.color === Side.white
                ? player.timeLeft
                : game.player1TimeLeft,
            player2TimeLeft:
              player.color === Side.black
                ? player.timeLeft
                : game.player2TimeLeft,
            lastTimerUpdate: new Date(),
          },
        }),
      ]);

      // Update room state
      room.currentTurn = isWhiteTurn ? Side.black : Side.white;

      // Broadcast move to all in room
      server.to(gameRoomId).emit('move-made', {
        from: data.from,
        to: data.to,
        promotion: data.promotion,
        fen: chess.fen(),
        san: move.san,
        moveNumber: game.moves.length + 1,
        whiteTimeLeft:
          player.color === Side.white ? player.timeLeft : game.player1TimeLeft,
        blackTimeLeft:
          player.color === Side.black ? player.timeLeft : game.player2TimeLeft,
        isCheck: chess.inCheck(),
        isCheckmate,
        isDraw,
        currentTurn: chess.turn() === 'w' ? 'white' : 'black',
      });

      // Handle game over
      if (isGameOver) {
        await onGameOver(
          gameRoomId,
          winnerId,
          isCheckmate ? 'checkmate' : 'draw',
        );
      }
    } catch (error) {
      this.logger.error('Move error:', error);
      client.emit('error', { message: 'Invalid move' });
    }
  }
}
