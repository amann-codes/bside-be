import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GoogleSignInDTO } from "./dto/login.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) { }
    @Post()
    async SignIn(@Body() body: GoogleSignInDTO) {
        const res = await this.authService.googleSignIn(body)
        return res
    }
}