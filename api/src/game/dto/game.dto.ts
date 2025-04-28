import { GameStatus, Side } from '@prisma/client';

export class CreateGameDto {
  player1_id: number;
  player2_id: number;
  computerSide?: 'white' | 'black';
  isComputer?: boolean;
}

export class UpdateGameDto {
  winnerId?: number;
  status?: 'ongoing' | 'white_won' | 'black_won' | 'draw' | 'resigned';
  boardStatus: string;
}

export class GameDto {
  id: number;
  player1_id: number;
  player2_id: number;
  computerSide?: Side;
  isComputer: boolean;
  winnerId?: number;
  status: GameStatus;
  boardStatus: string;
  createdAt: Date;
  lastMoveAt: Date;
}
