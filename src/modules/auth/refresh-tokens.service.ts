import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../core/database/database.service';
import { refreshTokens } from '../../core/database/schema';

type RefreshTokenRow = typeof refreshTokens.$inferSelect;

@Injectable()
export class RefreshTokensService {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<RefreshTokenRow | undefined> {
    const [token] = await this.database.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.id, id))
      .limit(1);

    return token;
  }

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

  async rotate(
    currentId: string,
    next: {
      id: string;
      userId: string;
      tokenHash: string;
      expiresAt: Date;
    },
  ): Promise<boolean> {
    return this.database.db.transaction(async (tx) => {
      const [revoked] = await tx
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(eq(refreshTokens.id, currentId), isNull(refreshTokens.revokedAt)),
        )
        .returning({ id: refreshTokens.id });

      if (!revoked) {
        return false;
      }

      await tx.insert(refreshTokens).values({
        id: next.id,
        userId: next.userId,
        tokenHash: next.tokenHash,
        expiresAt: next.expiresAt,
        createdAt: new Date(),
      });

      return true;
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.database.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }
}
