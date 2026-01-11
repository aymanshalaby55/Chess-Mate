import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ChessGateway } from './game.gateway';
import { ChatService } from '../chat/chat.service';
import { RatingService } from '../rating/rating.service';

@Module({
  imports: [PrismaModule],
  controllers: [GameController],
  providers: [GameService, ChessGateway, ChatService, RatingService],
  exports: [GameService],
})
export class GameModule {}
