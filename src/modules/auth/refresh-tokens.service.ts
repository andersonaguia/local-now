import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../core/database/database.service';
import { refreshTokens } from '../../core/database/schema';

@Injectable()
export class RefreshTokensService {
  constructor(private readonly database: DatabaseService) {}

  async create(data: {
    id?: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.database.db.insert(refreshTokens).values({
      id: data.id ?? randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      createdAt: new Date(),
    });
  }
}
