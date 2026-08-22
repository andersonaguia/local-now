import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';
import { AuthTokens } from './auth.types';
import { durationToMs, durationToSeconds, hashToken } from './auth.utils';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokensService } from './refresh-tokens.service';

const PASSWORD_ROUNDS = 10;
const DUMMY_PASSWORD_HASH =
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

type RefreshPayload = {
  sub: string;
  jti: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await hash(dto.password, PASSWORD_ROUNDS);

    try {
      return await this.usersService.create({
        email: dto.email,
        passwordHash,
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);
    const passwordMatches = await compare(
      dto.password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const pair = await this.issueTokenPair(user);
    await this.refreshTokensService.create(pair.refreshSession);
    return pair.tokens;
  }

  async refresh(dto: RefreshDto): Promise<AuthTokens> {
    const payload = await this.readRefreshPayload(dto.refreshToken);
    const stored = await this.refreshTokensService.findById(payload.jti);

    if (!stored || stored.userId !== payload.sub) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.refreshTokensService.revokeAllForUser(stored.userId);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (
      stored.expiresAt.getTime() <= Date.now() ||
      stored.tokenHash !== hashToken(dto.refreshToken)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const pair = await this.issueTokenPair(user);
    const rotated = await this.refreshTokensService.rotate(
      stored.id,
      pair.refreshSession,
    );

    if (!rotated) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return pair.tokens;
  }

  private async readRefreshPayload(token: string): Promise<RefreshPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<
        Partial<RefreshPayload>
      >(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });

      if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return { sub: payload.sub, jti: payload.jti };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async issueTokenPair(user: { id: string; email: string }): Promise<{
    tokens: AuthTokens;
    refreshSession: {
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    };
  }> {
    const accessExpiresIn = this.config.getOrThrow<string>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.config.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );
    const refreshId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: user.id, email: user.email },
        {
          secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: durationToSeconds(accessExpiresIn),
        },
      ),
      this.jwtService.signAsync(
        { sub: user.id, jti: refreshId },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: durationToSeconds(refreshExpiresIn),
        },
      ),
    ]);

    return {
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: durationToSeconds(accessExpiresIn),
      },
      refreshSession: {
        id: refreshId,
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: new Date(Date.now() + durationToMs(refreshExpiresIn)),
      },
    };
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  const code = String(error.code);
  return code === 'SQLITE_CONSTRAINT' || code === 'SQLITE_CONSTRAINT_UNIQUE';
}
