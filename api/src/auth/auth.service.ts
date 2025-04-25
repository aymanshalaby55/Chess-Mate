import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (user && user.password) {
      const isPasswordValid = await argon2.verify(user.password, password);

      if (isPasswordValid) {
        const { password, ...result } = user;
        return result;
      }
    }

    return null;
  }


  async googleLogin(user: any) {
    if (!user) {
      return 'No user from Google';
    }

    // Check if user exists in our database
    let dbUser = await this.userService.findByEmail(user.email);
    
    // If user doesn't exist, create one
    if (!dbUser) {
      dbUser = await this.userService.createUser({
        email: user.email,
        name: user.name,
        googleId: user.id,
        picture: user.picture || null,
      });
    } 
    // If user exists but doesn't have googleId, update it
    else if (!dbUser.googleId) {
      dbUser = await this.userService.updateUser(dbUser.id, {
        googleId: user.id,
        picture: user.picture || dbUser.picture,
      });
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }
}
