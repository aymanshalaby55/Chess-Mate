import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';

interface AuthResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

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
    return 'Redirecting to Google...';
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    // After successful Google authentication, get login data
    const authResult = this.authService.googleLogin(user);
    
    // Using Promise.resolve to handle both Promise and non-Promise returns
    Promise.resolve(authResult).then((result) => {
      // Check if result is a string (error message)
      if (typeof result === 'string') {
        return res.redirect(`http://localhost:3000/login?error=${encodeURIComponent(result)}`);
      }
      
      const authData = result as AuthResult;
      
      // Encode the user data to safely include in URL
      const userData = encodeURIComponent(JSON.stringify(authData.user));
      const token = authData.access_token;
      
      // Redirect to frontend with token and user data
      return res.redirect(`http://localhost:3000?token=${token}&user=${userData}`);
    });
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
