import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @UseGuards(AuthGuard('jwt'))
  getUserInfo(@Req() req: Request) {
    const user: any = req.user;
    console.log(user)
    // The JWT guard already validated the token and attached the user to the request
    const userData  = this.userService.getUserData(user.email);
    console.log(userData);
    return req ;
  }
}
