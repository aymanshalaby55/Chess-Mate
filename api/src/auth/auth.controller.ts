import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates the Google OAuth flow
    // The guard handles the redirect
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: Request) {
    // After successful Google authentication, this will be called
    return this.authService.googleLogin(req);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignUpDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Create new user
    const newUser = await this.userService.createUser({
      email: signupDto.email,
      password: signupDto.password,
      name: signupDto.name,
    });

    // Remove sensitive data from response
    const { password: _, ...userWithoutPassword } = newUser;
    
    // Return user with token
    return this.authService.login(userWithoutPassword);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    const user = await this.authService.validateUser(
      signInDto.email,
      signInDto.password,
    );
    
    if (!user) {
      return { statusCode: 401, message: 'Invalid credentials' };
    }
    
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    return req.user;
  }
} 