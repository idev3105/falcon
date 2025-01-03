import { json, text, pgTable } from 'drizzle-orm/pg-core';
import type { Location } from '$lib/types';

export const roomTbl = pgTable('room', {
	id: text('id').primaryKey(),
	name: text('name').notNull()
});

export const roomParticipantTbl = pgTable('room_participant', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	sessionId: text('session_id').notNull(),
	roomId: text('room_id')
		.notNull()
		.references(() => roomTbl.id),
	currentLocation: json('current_location').$type<Location>(),
	historyLocation: json('history_location').$type<Location[]>()
});
