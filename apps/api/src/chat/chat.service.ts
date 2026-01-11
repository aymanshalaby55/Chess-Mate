import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new chat message
   */
  async createMessage(gameId: number, userId: number, message: string) {
    // Verify game exists
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }

    const chatMessage = await this.prisma.chatMessage.create({
      data: {
        gameId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
    });

    this.logger.log(`User ${userId} sent message in game ${gameId}`);
    return chatMessage;
  }

  /**
   * Get chat messages for a game
   */
  async getMessages(gameId: number, limit: number = 100, before?: Date) {
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        gameId,
        ...(before && { createdAt: { lt: before } }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            picture: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Return in chronological order
    return messages.reverse();
  }
}


