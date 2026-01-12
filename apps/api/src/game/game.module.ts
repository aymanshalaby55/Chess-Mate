import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { ChessGateway } from './game.gateway';
import { ChatService } from '../chat/chat.service';
import { RatingService } from '../rating/rating.service';

// State Manager
import { GameStateManager } from './state/game-state.manager';

// Handlers
import { MatchmakingHandler } from './handlers/matchmaking.handler';
import { GameRoomHandler } from './handlers/game-room.handler';
import { MoveHandler } from './handlers/move.handler';
import { TimerHandler } from './handlers/timer.handler';
import { GameEndHandler } from './handlers/game-end.handler';
import { InviteHandler } from './handlers/invite.handler';
import { ChatHandler } from './handlers/chat.handler';
import { SpectatorHandler } from './handlers/spectator.handler';

@Module({
  imports: [PrismaModule],
  controllers: [GameController],
  providers: [
    // Services
    GameService,
    ChatService,
    RatingService,

    // State Manager
    GameStateManager,

    // Handlers
    MatchmakingHandler,
    GameRoomHandler,
    MoveHandler,
    TimerHandler,
    GameEndHandler,
    InviteHandler,
    ChatHandler,
    SpectatorHandler,

    // Gateway
    ChessGateway,
  ],
  exports: [GameService, GameStateManager],
})
export class GameModule {}
