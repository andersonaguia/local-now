import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };
  let controller: AuthController;

  const user = {
    id: '3d8f1c2e-7a4b-4c9d-9e2f-1a2b3c4d5e6f',
    email: 'user@example.com',
    createdAt: new Date('2026-08-22T17:00:00.000Z'),
    updatedAt: new Date('2026-08-22T17:00:00.000Z'),
  };
  const tokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenType: 'Bearer' as const,
    expiresIn: 900,
  };

  beforeEach(async () => {
    authService.register.mockReset();
    authService.login.mockReset();
    authService.refresh.mockReset();
    authService.register.mockResolvedValue(user);
    authService.login.mockResolvedValue(tokens);
    authService.refresh.mockResolvedValue(tokens);

    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('should be able to return the created user without a password', async () => {
    const result = await controller.register({
      email: 'user@example.com',
      password: 's3nhA-fort3',
    });

    expect(authService.register).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 's3nhA-fort3',
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: user.id,
        email: user.email,
      }),
    );
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should be able to return access and refresh tokens', async () => {
    const result = await controller.login({
      email: 'user@example.com',
      password: '12Aa543!',
    });

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: '12Aa543!',
    });
    expect(result).toEqual(tokens);
  });

  it('should not be able to login with invalid credentials', async () => {
    authService.login.mockRejectedValue(new UnauthorizedException());

    await expect(
      controller.login({
        email: 'user@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should be able to rotate tokens from a refresh token', async () => {
    const result = await controller.refresh({
      refreshToken: 'old-refresh-token',
    });

    expect(authService.refresh).toHaveBeenCalledWith({
      refreshToken: 'old-refresh-token',
    });
    expect(result).toEqual(tokens);
  });
});
