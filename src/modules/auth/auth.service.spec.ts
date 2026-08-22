import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('AuthService', () => {
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };
  let service: AuthService;

  const createdUser = {
    id: 'user-1',
    email: 'user@example.com',
    createdAt: new Date('2026-08-22T17:00:00.000Z'),
    updatedAt: new Date('2026-08-22T17:00:00.000Z'),
  };

  beforeEach(async () => {
    usersService.findByEmail.mockReset();
    usersService.create.mockReset();
    usersService.create.mockResolvedValue(createdUser);

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
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
});
