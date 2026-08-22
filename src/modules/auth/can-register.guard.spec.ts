import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CanRegisterGuard } from './can-register.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('CanRegisterGuard', () => {
  const usersService = { hasAny: jest.fn() };
  const jwtAuthGuard = { canActivate: jest.fn() };
  let guard: CanRegisterGuard;
  const context = {} as ExecutionContext;

  beforeEach(() => {
    usersService.hasAny.mockReset();
    jwtAuthGuard.canActivate.mockReset();
    guard = new CanRegisterGuard(
      usersService as unknown as UsersService,
      jwtAuthGuard as unknown as JwtAuthGuard,
    );
  });

  it('should be able to allow the first registration without a token', async () => {
    usersService.hasAny.mockResolvedValue(false);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtAuthGuard.canActivate).not.toHaveBeenCalled();
  });

  it('should be able to delegate to jwt auth when users already exist', async () => {
    usersService.hasAny.mockResolvedValue(true);
    jwtAuthGuard.canActivate.mockResolvedValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(jwtAuthGuard.canActivate).toHaveBeenCalledWith(context);
  });

  it('should not be able to register without a valid token after the first user exists', async () => {
    usersService.hasAny.mockResolvedValue(true);
    jwtAuthGuard.canActivate.mockRejectedValue(new UnauthorizedException());

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
