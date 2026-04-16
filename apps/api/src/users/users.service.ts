import { Inject, Injectable } from '@nestjs/common';
import type { AuthIdentity, AuthProvider, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

interface CreateUserInput {
  email: string | null;
  nickname: string | null;
  passwordHash: string | null;
  timezone: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findAuthIdentity(
    provider: AuthProvider,
    providerUserId: string,
  ): Promise<(AuthIdentity & { user: User }) | null> {
    return this.prisma.authIdentity.findUnique({
      include: {
        user: true,
      },
      where: {
        provider_providerUserId: {
          provider,
          providerUserId,
        },
      },
    });
  }
}
