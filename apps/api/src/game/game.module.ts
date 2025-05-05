import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { GameService } from './game.service';
import { GameController } from './game.controller';

@Module({
  controllers: [GameController],
  providers: [GameService, PrismaService],
  exports: [GameService],
})
export class GameModule {}
