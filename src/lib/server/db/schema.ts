import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const shareSessionsTable = sqliteTable('d_share_sessions', {
	id: int().primaryKey({ autoIncrement: true }),
	token: text().notNull().unique()
});
