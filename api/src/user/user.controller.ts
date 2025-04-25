import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';

// Define interface for the user object from JWT
interface JwtUser {
  email: string;
  sub: string;
  [key: string]: any;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @UseGuards(AuthGuard('jwt'))
  async getUserInfo(@Req() req: Request) {
    const user = req.user as JwtUser;
    // The JWT guard already validated the token and attached the user to the request
    const userData = await this.userService.getUserData(user.email);
    return userData;
  }
}
