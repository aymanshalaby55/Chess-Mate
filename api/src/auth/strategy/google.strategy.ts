import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const email= emails[0].value;
    const picture = photos[0].value;
    const googleProfile = {
      accessToken,
      refreshToken,
      profile,
    };

    // Check if user exists in database
    let user = await this.userService.findByGoogleId(id);

    // If user doesn't exist, check if email is already registered
    if (!user) {
      const existingUser = await this.userService.findByEmail(email);

      if (existingUser) {
        // Update existing user with Google info
        user = await this.userService.updateUser(existingUser.id, {
          googleId: id,
          googleProfile,
          picture,
        });
      } else {
        // Create new user
        user = await this.userService.createUser({
          email,
          name: name.givenName + ' ' + name.familyName,
          googleId: id,
          googleProfile,
          picture,
        });
      }
    }

    done(null, user);
  }
}
