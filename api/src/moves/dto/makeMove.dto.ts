export class makeMove {
  gameId: number;
  moveNumber?: number;
  from: string;
  to: string;
  piece: string;
  promotion?: string;
  capture?: boolean;
  check?: boolean;
  checkmate?: boolean;
  fen: string;
}
