import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Side, TimeControl } from '@prisma/client';
import { GameService } from './game.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';

@Controller('games')
export class GameController {
  constructor(private gameService: GameService) {}

  /**
   * Create a game against the computer
   */
  @Post('computer')
  @UseGuards(JwtGuard)
  createComputerGame(
    @GetUser('id') userId: number,
    @Body('side') side: Side,
    @Body('timeControl') timeControl?: TimeControl,
  ) {
    return this.gameService.createGamePvc(userId, side, timeControl);
  }

  /**
   * Create a private game with invite link
   */
  @Post('private')
  @UseGuards(JwtGuard)
  createPrivateGame(
    @GetUser('id') userId: number,
    @Body('side') side: Side,
    @Body('timeControl') timeControl?: TimeControl,
  ) {
    return this.gameService.createPrivateGame(userId, side, timeControl);
  }

  /**
   * Join a game via invite code
   */
  @Post('join/:inviteCode')
  @UseGuards(JwtGuard)
  joinByInvite(
    @GetUser('id') userId: number,
    @Param('inviteCode') inviteCode: string,
  ) {
    return this.gameService.joinGameByInvite(userId, inviteCode);
  }

  /**
   * Get game by invite code (public - for preview before joining)
   */
  @Get('invite/:inviteCode')
  getGameByInvite(@Param('inviteCode') inviteCode: string) {
    return this.gameService.getGameByInvite(inviteCode);
  }

  /**
   * Get user's games
   */
  @Get()
  @UseGuards(JwtGuard)
  getGames(
    @GetUser('id') userId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.gameService.getGames(userId, limit, offset);
  }

  /**
   * Get a specific game
   */
  @Get(':id')
  @UseGuards(JwtGuard)
  getGame(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.getGame(gameId, userId);
  }

  /**
   * Resign from a game
   */
  @Post(':id/resign')
  @UseGuards(JwtGuard)
  resignGame(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) gameId: number,
  ) {
    return this.gameService.resignGame(gameId, userId);
  }

  /**
   * Save a move from computer game
   */
  @Post(':id/computer-move')
  @UseGuards(JwtGuard)
  makeComputerMove(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) gameId: number,
    @Body() move: { from: string; to: string; promotion?: string },
  ) {
    return this.gameService.makeComputerMove(gameId, userId, move);
  }

  /**
   * Get user statistics
   */
  @Get('stats/me')
  @UseGuards(JwtGuard)
  getMyStats(@GetUser('id') userId: number) {
    return this.gameService.getUserStats(userId);
  }

  /**
   * Get another user's statistics
   */
  @Get('stats/:userId')
  getUserStats(@Param('userId', ParseIntPipe) userId: number) {
    return this.gameService.getUserStats(userId);
  }
}
