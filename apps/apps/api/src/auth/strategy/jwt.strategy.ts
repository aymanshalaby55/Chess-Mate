import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                (req: { cookies: { [x: string]: any } }) => {
                    let token: string = null;
                    if (req && req.cookies) {
                        token = req.cookies["accesstoken"] as string;
                    }
                    return token;
                },
            ]),
            secretOrKey: configService.get("JWT_SECRET"),
            ignoreExpiration: false,
        });
    }

    validate(payload: { email: string; sub: number }) {
        return { email: payload.email, id: payload.sub };
    }
}
