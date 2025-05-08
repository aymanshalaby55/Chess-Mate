export class CreateGameDto {
  player1_id: number;
  player2_id: number;
  computerSide?: 'white' | 'black';
  isComputer?: boolean;
}
