import { createHash, randomBytes } from 'node:crypto';

import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthProvider, User } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import type { TokenPayload } from 'google-auth-library';

import type { AuthSession, AuthUser } from '@onward/contracts';

import type { AppEnv } from '../config/app-env';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService<AppEnv, true>,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthSession> {
    const existingUser = await this.usersService.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const user = await this.usersService.create({
      email: dto.email,
      nickname: dto.nickname ?? null,
      passwordHash: await hash(dto.password, 12),
      timezone: dto.timezone ?? 'UTC',
    });

    return this.issueSession(user);
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('소셜 로그인으로 생성된 계정입니다.');
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.issueSession(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthSession> {
    const tokenRecord = await this.prisma.refreshToken.findFirst({
      include: {
        user: true,
      },
      where: {
        expiresAt: {
          gt: new Date(),
        },
        revokedAt: null,
        tokenHash: this.hashRefreshToken(dto.refreshToken),
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    await this.prisma.refreshToken.update({
      data: {
        revokedAt: new Date(),
      },
      where: {
        id: tokenRecord.id,
      },
    });

    return this.issueSession(tokenRecord.user);
  }

  async loginWithGoogle(dto: GoogleLoginDto): Promise<AuthSession> {
    const audience = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!audience) {
      throw new InternalServerErrorException(
        'GOOGLE_CLIENT_ID가 설정되지 않았습니다.',
      );
    }

    const googleClient = new OAuth2Client(audience);

    let payload: TokenPayload | undefined;

    try {
      const ticket = await googleClient.verifyIdToken({
        audience,
        idToken: dto.credential,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('유효하지 않은 Google credential입니다.');
    }

    if (!payload?.sub) {
      throw new UnauthorizedException('유효하지 않은 Google credential입니다.');
    }

    const existingIdentity = await this.usersService.findAuthIdentity(
      'google',
      payload.sub,
    );

    if (existingIdentity) {
      return this.issueSession(existingIdentity.user);
    }

    const email = payload.email ?? null;
    const emailVerified = payload.email_verified ?? false;
    const nickname =
      payload.given_name ?? payload.name ?? email?.split('@')[0] ?? 'Onward user';

    const user = await this.prisma.$transaction(async (tx) => {
      let existingUser: User | null = null;

      if (email && emailVerified) {
        existingUser = await tx.user.findUnique({
          where: {
            email,
          },
        });
      }

      const nextUser =
        existingUser ??
        (await tx.user.create({
          data: {
            email,
            nickname,
            passwordHash: null,
            timezone: 'UTC',
          },
        }));

      await tx.authIdentity.create({
        data: {
          email,
          emailVerified,
          provider: 'google',
          providerUserId: payload.sub,
          userId: nextUser.id,
        },
      });

      return nextUser;
    });

    return this.issueSession(user);
  }

  private async issueSession(user: User): Promise<AuthSession> {
    const accessTokenExpiresIn =
      this.configService.get<string>('ACCESS_TOKEN_TTL') ?? '15m';
    const refreshTokenExpiresInDays = this.getRefreshTokenTtlDays();
    const accessToken = await this.jwtService.signAsync({
      email: user.email,
      sub: user.id,
    });
    const refreshToken = randomBytes(48).toString('base64url');

    await this.prisma.refreshToken.create({
      data: {
        expiresAt: this.getRefreshTokenExpiry(refreshTokenExpiresInDays),
        tokenHash: this.hashRefreshToken(refreshToken),
        userId: user.id,
      },
    });

    return {
      accessToken,
      accessTokenExpiresIn,
      refreshToken,
      refreshTokenExpiresInDays,
      user: this.toAuthUser(user),
    };
  }

  private getRefreshTokenExpiry(days: number): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
    return expiresAt;
  }

  private getRefreshTokenTtlDays(): number {
    const configuredValue = Number(
      this.configService.get<string>('REFRESH_TOKEN_TTL_DAYS') ?? 30,
    );

    return Number.isNaN(configuredValue) ? 30 : configuredValue;
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthUser(user: User): AuthUser {
    return {
      email: user.email,
      id: user.id,
      nickname: user.nickname,
      timezone: user.timezone,
    };
  }
}
