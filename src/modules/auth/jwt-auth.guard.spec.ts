import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth.types';
import { extractBearerToken, JwtAuthGuard } from './jwt-auth.guard';

type GuardRequest = {
  headers: { authorization?: string };
  user?: AuthUser;
};

describe('extractBearerToken', () => {
  it('should be able to read a Bearer token', () => {
    expect(extractBearerToken('Bearer access-token')).toBe('access-token');
  });

  it('should not be able to read a missing or malformed header', () => {
    expect(extractBearerToken(undefined)).toBeUndefined();
    expect(extractBearerToken('Basic abc')).toBeUndefined();
    expect(extractBearerToken('Bearer')).toBeUndefined();
  });
});

describe('JwtAuthGuard', () => {
  const jwtService = { verifyAsync: jest.fn() };
  const config = {
    getOrThrow: jest.fn().mockReturnValue('access-secret'),
  };
  const usersService = { findById: jest.fn() };
  let guard: JwtAuthGuard;

  function contextWithAuth(authorization?: string): {
    context: ExecutionContext;
    request: GuardRequest;
  } {
    const request: GuardRequest = {
      headers: { authorization },
      user: undefined,
    };

    return {
      request,
      context: {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext,
    };
  }

  beforeEach(() => {
    jwtService.verifyAsync.mockReset();
    usersService.findById.mockReset();
    config.getOrThrow.mockClear();
    guard = new JwtAuthGuard(
      jwtService as unknown as JwtService,
      config as unknown as ConfigService,
      usersService as unknown as UsersService,
    );
  });

  it('should be able to authenticate a valid access token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
    });
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    });
    const { context, request } = contextWithAuth('Bearer access-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
  });

  it('should not be able to authenticate without a token', async () => {
    const { context } = contextWithAuth();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should not be able to authenticate with an invalid token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    const { context } = contextWithAuth('Bearer bad-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('should not be able to authenticate when the user no longer exists', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      email: 'user@example.com',
    });
    usersService.findById.mockResolvedValue(undefined);
    const { context } = contextWithAuth('Bearer access-token');

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
