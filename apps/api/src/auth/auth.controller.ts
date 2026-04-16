import { Body, Controller, Inject, Post } from '@nestjs/common';

import type { AuthSession } from '@onward/contracts';

import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post('signup')
  signup(@Body() dto: SignupDto): Promise<AuthSession> {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthSession> {
    return this.authService.login(dto);
  }

  @Post('google')
  google(@Body() dto: GoogleLoginDto): Promise<AuthSession> {
    return this.authService.loginWithGoogle(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthSession> {
    return this.authService.refresh(dto);
  }
}
