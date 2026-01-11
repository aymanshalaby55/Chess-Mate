import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request, Response } from "express";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

interface AuthResult {
    access_token: string;
    user: {
        id: string;
        email: string;
        name: string;
        picture?: string;
    };
}

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) {}

    @Get("google")
    @UseGuards(AuthGuard("google"))
    googleAuth() {
        return "Redirecting to Google...";
    }

    @Get("google/callback")
    @UseGuards(AuthGuard("google"))
    googleAuthCallback(@Req() req: Request, @Res() res: Response) {
        const user = req.user;

        console.log(user);
        // After successful Google authentication, get login data
        const authResult = this.authService.googleLogin(user);

        // Using Promise.resolve to handle both Promise and non-Promise returns
        void Promise.resolve(authResult).then((result) => {
            // Check if result is a string (error message)
            if (typeof result === "string") {
                return res.redirect(
                    `http://localhost:3000/login?error=${encodeURIComponent(result)}`,
                );
            }

            const authData = result as AuthResult;
            const token = authData.access_token;

            // Set JWT token in HTTP-only cookie
            res.cookie("accesstoken", token);

            // Redirect to frontend with only user data in URL
            return res.redirect(`http://localhost:3000/`);
        });
    }

    @Get("logout")
    logout(@Res() res: Response) {
        res.clearCookie("accesstoken");
        return res.send({ message: "Logged out successfully" });
    }
}
