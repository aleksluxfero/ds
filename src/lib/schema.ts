import { pgTable, serial, text, timestamp, bigint, pgEnum } from 'drizzle-orm/pg-core';

export const dreamTypeEnum = pgEnum('dream_type', [
  'normal',
  'lucid',
  'false_awakening',
  'sleep_paralysis',
  'vivid',
]);

export const users = pgTable('users', {
  id: bigint('id', { mode: 'number' }).primaryKey(), // Telegram User ID is a number, but can be large. Using bigint mode number for safety if it fits, or just bigint.
  firstName: text('first_name'),
  lastName: text('last_name'),
  username: text('username'),
  languageCode: text('language_code'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dreams = pgTable('dreams', {
  id: serial('id').primaryKey(),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  date: bigint('date', { mode: 'number' }), // Storing timestamp as number
  tags: text('tags').array(),
  type: dreamTypeEnum('type'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
