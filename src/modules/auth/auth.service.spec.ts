import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { hashToken } from './auth.utils';
import { RefreshTokensService } from './refresh-tokens.service';

const mockCompare = jest.fn<Promise<boolean>, [string, string]>();

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: (...args: [string, string]) => mockCompare(...args),
}));

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  const refreshTokensService = {
    create: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        JWT_ACCESS_SECRET: 'access-secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_ACCESS_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return values[key];
    }),
  };
  let service: AuthService;

  const createdUser = {
    id: 'user-1',
    email: 'user@example.com',
    createdAt: new Date('2026-08-22T17:00:00.000Z'),
    updatedAt: new Date('2026-08-22T17:00:00.000Z'),
  };
  const storedUser = {
    ...createdUser,
    passwordHash: 'hashed-password',
  };

  beforeEach(async () => {
    usersService.findByEmail.mockReset();
    usersService.create.mockReset();
    usersService.create.mockResolvedValue(createdUser);
    refreshTokensService.create.mockReset();
    jwtService.signAsync.mockReset();
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    mockCompare.mockReset();
    config.getOrThrow.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: RefreshTokensService, useValue: refreshTokensService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be able to create a user when the email is available', async () => {
    usersService.findByEmail.mockResolvedValue(undefined);

    const result = await service.register({
      email: 'user@example.com',
      password: 's3nhA-fort3',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    });
    expect(result).toEqual(createdUser);
  });

  it('should not be able to register a duplicated email', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        email: 'user@example.com',
        password: 's3nhA-fort3',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('should not be able to register when a unique constraint race occurs', async () => {
    usersService.findByEmail.mockResolvedValue(undefined);
    usersService.create.mockRejectedValue({
      code: 'SQLITE_CONSTRAINT_UNIQUE',
      message: 'UNIQUE constraint failed: users.email',
    });

    await expect(
      service.register({
        email: 'user@example.com',
        password: 's3nhA-fort3',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should be able to login with valid credentials', async () => {
    usersService.findByEmail.mockResolvedValue(storedUser);
    mockCompare.mockResolvedValue(true);

    const result = await service.login({
      email: 'user@example.com',
      password: '12Aa543!',
    });

    expect(mockCompare).toHaveBeenCalledWith('12Aa543!', 'hashed-password');
    expect(refreshTokensService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: hashToken('refresh-token'),
      }),
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      tokenType: 'Bearer',
      expiresIn: 900,
    });
  });

  it('should not be able to login with an unknown email', async () => {
    usersService.findByEmail.mockResolvedValue(undefined);
    mockCompare.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: '12Aa543!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(refreshTokensService.create).not.toHaveBeenCalled();
  });

  it('should not be able to login with a wrong password', async () => {
    usersService.findByEmail.mockResolvedValue(storedUser);
    mockCompare.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
