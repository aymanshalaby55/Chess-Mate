import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ChessGateway } from './game.gateway';

@Module({
  controllers: [GameController],
  providers: [GameService, PrismaService, ChessGateway],
  exports: [GameService],
})
export class GameModule {}
