import { GameStatus, Side } from '@prisma/client';

export class GameDto {
  id: number;
  player1_id: number;
  player2_id: number;
  computerSide: Side;
  isComputer: boolean;
  winnerId: number | null;
  status: GameStatus;
  boardStatus: string;
  createdAt: Date;
  lastMoveAt: Date;
}
