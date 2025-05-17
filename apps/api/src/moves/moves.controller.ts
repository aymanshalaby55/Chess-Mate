import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { MovesService } from './moves.service';
import { ParseIntPipe } from '@nestjs/common';
import { makeMove } from './dto/makMove.dto';

@Controller('moves')
@UseGuards(JwtGuard)
export class MovesController {
  constructor(private readonly movesService: MovesService) {}

  @Post(':gameId/addmove')
  addMove(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Body() move: makeMove,
    @GetUser() user,
  ) {
    const id: number = user.id;
    return this.movesService.makeMove(move, gameId, id);
  }

  @Get(':id')
  getMove(@Param('id', ParseIntPipe) moveId: number) {
    return this.movesService.getMove(moveId);
  }

  @Get('gameMoves/:gameId')
  getGameMoves(@Param('gameId', ParseIntPipe) gameId: number) {
    return this.movesService.getGameMoves(gameId);
  }
}
