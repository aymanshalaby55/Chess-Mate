import { Body, Controller, Post } from '@nestjs/common';
import { Side } from '@prisma/client';
import { GameService } from './game.service';
// import { JwtGuard } from '../auth/guard';
// import { GetUser } from '../auth/decorator';

@Controller('games')
// @UseGuards(JwtGuard)
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('computer')
  createComputerGame(@Body('side') side: Side) {
    return this.gameService.createGamePvc(1, side);
  }

  // @Get()
  // getGames(
  //   @GetUser('id') userId: number,
  //   @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  //   @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  // ) {
  //   return this.gameService.getGames(userId, limit, offset);
  // }

  // @Get(':id')
  // getGame(@Param('id', ParseIntPipe) gameId: number) {
  //   return this.gameService.getGame(gameId);
  // }
}
