import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AppEnv } from '../../config/app-env';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import type { AccessTokenPayload } from '../types/access-token-payload.type';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService<AppEnv, true>) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedUser {
    return {
      email: payload.email,
      userId: payload.sub,
    };
  }
}
