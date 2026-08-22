import { InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const chain = {
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  };
  const db = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
  };
  let service: UsersService;

  const user = {
    id: 'user-1',
    email: 'user@example.com',
    createdAt: new Date('2026-08-22T17:00:00.000Z'),
    updatedAt: new Date('2026-08-22T17:00:00.000Z'),
  };

  beforeEach(() => {
    chain.from.mockReturnThis();
    chain.where.mockReturnThis();
    chain.values.mockReturnThis();
    chain.limit.mockReset();
    chain.returning.mockReset();
    db.select.mockClear();
    db.insert.mockClear();
    service = new UsersService({ db } as unknown as DatabaseService);
  });

  it('should be able to find a user by email', async () => {
    chain.limit.mockResolvedValue([
      { ...user, passwordHash: 'hashed-password' },
    ]);

    await expect(service.findByEmail('user@example.com')).resolves.toEqual({
      ...user,
      passwordHash: 'hashed-password',
    });
  });

  it('should be able to find a user by id', async () => {
    chain.limit.mockResolvedValue([
      { ...user, passwordHash: 'hashed-password' },
    ]);

    await expect(service.findById('user-1')).resolves.toEqual({
      ...user,
      passwordHash: 'hashed-password',
    });
  });

  it('should be able to detect when at least one user exists', async () => {
    chain.limit.mockResolvedValue([{ id: 'user-1' }]);

    await expect(service.hasAny()).resolves.toBe(true);
  });

  it('should not be able to detect users when the table is empty', async () => {
    chain.limit.mockResolvedValue([]);

    await expect(service.hasAny()).resolves.toBe(false);
  });

  it('should be able to create a user without returning the password hash', async () => {
    chain.returning.mockResolvedValue([user]);

    await expect(
      service.create({
        email: 'user@example.com',
        passwordHash: 'hashed-password',
      }),
    ).resolves.toEqual(user);
  });

  it('should not be able to create a user when the insert does not return a row', async () => {
    chain.returning.mockResolvedValue([]);

    await expect(
      service.create({
        email: 'user@example.com',
        passwordHash: 'hashed-password',
      }),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
