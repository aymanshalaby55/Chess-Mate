import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Make sure the path is correct

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async googleLogin(user: any): Promise<{ access_token: string; user: any } | { message: string }> {
    if (!user) {
      return { message: 'No user from Google' };
    }

    // Check if user exists
    let dbUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    // Create new user if not exists
    if (!dbUser) {
      dbUser = await this.prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          googleId: user.id,
          picture: user.picture || null,
        },
      });
    }
    // Update existing user if googleId is missing
    else if (!dbUser.googleId) {
      dbUser = await this.prisma.user.update({
        where: { id: dbUser.id },
        data: {
          googleId: user.id,
          picture: user.picture || dbUser.picture,
        },
      });
    }

    // Generate JWT token
    const payload = { email: dbUser.email, sub: dbUser.id };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.picture,
      },
    };
  }
}
