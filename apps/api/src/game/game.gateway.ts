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

@WebSocketGateway({
  // Specify the port if different from your main app port
  port: 3000, // or remove this line if using same port as your main app
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Add these important options
  transports: ['polling', 'websocket'],
  allowEIO3: true,
})
export class ChessGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChessGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Test event - just echo back what was sent
  @SubscribeMessage('test-message')
  handleTestMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log('Received test message:', data);

    // Send back to sender
    client.emit('test-response', {
      message: 'Server received your message',
      originalData: data,
      timestamp: new Date().toISOString(),
    });
  }

  // Chess move event
  @SubscribeMessage('chess-move')
  handleChessMove(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log('Chess move received:', data);

    // Broadcast to all connected clients
    this.server.emit('move-update', {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  // Join room for game
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room: ${roomId}`);

    client.emit('joined-room', { roomId });

    // Notify others in the room
    client.to(roomId).emit('player-joined', {
      socketId: client.id,
      roomId,
    });
  }
}