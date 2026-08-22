import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../core/database/database.service';
import { users } from '../../core/database/schema';
import { User } from './users.types';

type UserRow = typeof users.$inferSelect;

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async findByEmail(email: string): Promise<UserRow | undefined> {
    const [user] = await this.database.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async create(data: { email: string; passwordHash: string }): Promise<User> {
    const now = new Date();
    const [user] = await this.database.db
      .insert(users)
      .values({
        id: randomUUID(),
        email: data.email,
        passwordHash: data.passwordHash,
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      });

    if (!user) {
      throw new InternalServerErrorException('Failed to create user');
    }

    return user;
  }
}
