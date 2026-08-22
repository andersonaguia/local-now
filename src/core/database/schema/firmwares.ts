import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const firmwares = sqliteTable(
  'firmwares',
  {
    id: text('id').primaryKey(),
    model: text('model').notNull(),
    version: integer('version').notNull(),
    sha256: text('sha256').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    url: text('url').notNull(),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (table) => [
    uniqueIndex('firmwares_model_version_idx').on(table.model, table.version),
  ],
);
