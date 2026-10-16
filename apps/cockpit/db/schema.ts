import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const cockpitState = sqliteTable('cockpit_state', { id: text('id').primaryKey(), revision: integer('revision').notNull(), data: text('data').notNull() });
