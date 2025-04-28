import { Body, Controller, Injectable, Param, Post } from '@nestjs/common';
import { makeMove } from './dto/makMove.dto';
import { MovesService } from './moves.service';
import { GetUser } from 'src/auth/decorator';

@Controller('moves')
export class MovesController {
  constructor(private readonly movesService: MovesService) {}
  @Post(':gameId/addmove')
  addMove(
    @Param('gameId') gameId: number,
    @Body() move: makeMove,
    @GetUser() user,
  ) {
    return this.movesService.makeMove(move, gameId, user.id);
  }
}
