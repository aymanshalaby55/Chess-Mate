import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../../chat/chat.service';
import { GameStateManager } from '../state/game-state.manager';

@Injectable()
export class ChatHandler {
  private readonly logger = new Logger(ChatHandler.name);

  constructor(
    private readonly stateManager: GameStateManager,
    private readonly chatService: ChatService,
  ) {}

  /**
   * Send a chat message in a game
   */
  async sendMessage(
    client: Socket,
    gameId: number,
    message: string,
    server: Server,
  ): Promise<void> {
    const odId = this.stateManager.getUserIdBySocket(client.id);
    if (!odId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    const chatMessage = await this.chatService.createMessage(
      gameId,
      odId,
      message,
    );

    const gameRoomId = GameStateManager.getRoomId(gameId);
    server.to(gameRoomId).emit('new-message', chatMessage);
  }

  /**
   * Get message history for a game
   */
  async getMessages(
    client: Socket,
    gameId: number,
    limit: number = 100,
  ): Promise<void> {
    const messages = await this.chatService.getMessages(gameId, limit);
    client.emit('messages-history', messages);
  }
}

