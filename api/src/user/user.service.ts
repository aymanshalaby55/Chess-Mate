import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    // Hash password if provided
    if (data.password) {
      data.password = await argon2.hash(data.password);
    }

    return await this.prisma.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
