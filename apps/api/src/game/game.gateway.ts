import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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

// Types
import {
  AuthenticatePayload,
  JoinMatchmakingPayload,
  JoinGamePayload,
  JoinByInvitePayload,
  MakeMovePayload,
  ResignPayload,
  DrawPayload,
  SendMessagePayload,
  GetMessagesPayload,
  CreatePrivateGamePayload,
  SpectatePayload,
} from './types/game.types';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
})
export class ChessGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChessGateway.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly matchmakingHandler: MatchmakingHandler,
    private readonly gameRoomHandler: GameRoomHandler,
    private readonly moveHandler: MoveHandler,
    private readonly timerHandler: TimerHandler,
    private readonly gameEndHandler: GameEndHandler,
    private readonly inviteHandler: InviteHandler,
    private readonly chatHandler: ChatHandler,
    private readonly spectatorHandler: SpectatorHandler,
  ) {}

  // ==================== CONNECTION LIFECYCLE ====================

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Cleanup and get game room if any
    const { gameRoomId } = this.stateManager.cleanupSocket(client.id);

    // Handle game disconnection
    if (gameRoomId) {
      void this.gameEndHandler.handlePlayerDisconnect(
        client.id,
        gameRoomId,
        this.server,
      );
    }
  }

  // ==================== AUTHENTICATION ====================

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: AuthenticatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.stateManager.setSocketToUser(client.id, data.odId);
    this.logger.log(`User ${data.odId} authenticated on socket ${client.id}`);
    client.emit('authenticated', { success: true });
  }

  // ==================== MATCHMAKING ====================

  @SubscribeMessage('join-matchmaking')
  async handleJoinMatchmaking(
    @MessageBody() data: JoinMatchmakingPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.matchmakingHandler.joinMatchmaking(client, data);
    await this.matchmakingHandler.findMatch(
      client.id,
      this.server,
      (gameRoomId) => this.startGameTimer(gameRoomId),
    );
  }

  @SubscribeMessage('leave-matchmaking')
  handleLeaveMatchmaking(@ConnectedSocket() client: Socket) {
    this.matchmakingHandler.leaveMatchmaking(client);
  }

  // ==================== GAME ROOM ====================

  @SubscribeMessage('join-game')
  async handleJoinGame(
    @MessageBody() data: JoinGamePayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.gameRoomHandler.joinGame(client, data, this.server);
  }

  @SubscribeMessage('join-by-invite')
  async handleJoinByInvite(
    @MessageBody() data: JoinByInvitePayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.gameRoomHandler.joinByInvite(
      client,
      data,
      this.server,
      (gameRoomId) => this.startGameTimer(gameRoomId),
    );
  }

  // ==================== MOVES ====================

  @SubscribeMessage('make-move')
  async handleMove(
    @MessageBody() data: MakeMovePayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.moveHandler.makeMove(
      client,
      data,
      this.server,
      (gameRoomId, winnerId, reason) =>
        this.gameEndHandler.endGame(gameRoomId, winnerId, reason, this.server),
    );
  }

  // ==================== GAME END ====================

  @SubscribeMessage('resign')
  async handleResign(
    @MessageBody() data: ResignPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.gameEndHandler.handleResign(client, data.gameId, this.server);
  }

  @SubscribeMessage('offer-draw')
  handleOfferDraw(
    @MessageBody() data: DrawPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.gameEndHandler.handleOfferDraw(client, data.gameId);
  }

  @SubscribeMessage('accept-draw')
  async handleAcceptDraw(
    @MessageBody() data: DrawPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.gameEndHandler.handleAcceptDraw(
      client,
      data.gameId,
      this.server,
    );
  }

  @SubscribeMessage('decline-draw')
  handleDeclineDraw(
    @MessageBody() data: DrawPayload,
    @ConnectedSocket() client: Socket,
  ) {
    this.gameEndHandler.handleDeclineDraw(client, data.gameId);
  }

  // ==================== CHAT ====================

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: SendMessagePayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatHandler.sendMessage(
      client,
      data.gameId,
      data.message,
      this.server,
    );
  }

  @SubscribeMessage('get-messages')
  async handleGetMessages(
    @MessageBody() data: GetMessagesPayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.chatHandler.getMessages(client, data.gameId, data.limit || 100);
  }

  // ==================== INVITE SYSTEM ====================

  @SubscribeMessage('create-private-game')
  async handleCreatePrivateGame(
    @MessageBody() data: CreatePrivateGamePayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.inviteHandler.createPrivateGame(client, data);
  }

  // ==================== SPECTATOR ====================

  @SubscribeMessage('spectate-game')
  async handleSpectate(
    @MessageBody() data: SpectatePayload,
    @ConnectedSocket() client: Socket,
  ) {
    await this.spectatorHandler.spectateGame(client, data.gameId);
  }

  // ==================== TIMER HELPER ====================

  private startGameTimer(gameRoomId: string): void {
    this.timerHandler.startGameTimer(
      gameRoomId,
      this.server,
      async (roomId, loserColor, winnerId) => {
        await this.gameEndHandler.endGame(
          roomId,
          winnerId,
          'timeout',
          this.server,
        );
      },
    );
  }
}
