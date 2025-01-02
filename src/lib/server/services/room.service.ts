import type { Room, RoomParticipant } from '$lib/types';
import { db } from '../db';
import { roomParticipantTbl, roomTbl } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type { Location } from '$lib/types';

// create new room
export const create = async (name: string): Promise<Room> => {
	const token = crypto.randomUUID();
	const roomSql: typeof roomTbl.$inferInsert = {
		id: token,
		name: name ? name : 'New Room'
	};
	const roomRow = await db.insert(roomTbl).values(roomSql).returning();
	return {
		id: roomRow[0].id,
		name: roomRow[0].name,
		participants: []
	};
};

export const exist = async (id: string): Promise<boolean> => {
	const roomCount = await db.$count(roomTbl, eq(roomTbl.id, id));
	return roomCount > 0;
};

// check exist room by counting id
// if exist, create new room participant
export const join = async (
	roomId: string,
	sessionId: string,
	name: string
): Promise<RoomParticipant> => {
	const roomCount = await db.$count(roomTbl, eq(roomTbl.id, roomId));
	if (roomCount == 0) {
		throw new Error('Room not found');
	} else {
		const roomParticipantSql: typeof roomParticipantTbl.$inferInsert = {
			id: crypto.randomUUID(),
			name: name,
			sessionId: sessionId,
			roomId: roomId,
			currentLocation: null,
			historyLocation: []
		};
		const roomParticipantRow = await db
			.insert(roomParticipantTbl)
			.values(roomParticipantSql)
			.returning();

		let currentLocation: Location | undefined = undefined;
		let historyLocation: Location[] | undefined = [];

		if (roomParticipantRow[0].currentLocation) {
			currentLocation = roomParticipantRow[0].currentLocation;
		}
		if (roomParticipantRow[0].historyLocation) {
			historyLocation = roomParticipantRow[0].historyLocation;
		}

		return {
			id: roomParticipantRow[0].id,
			name: roomParticipantRow[0].name,
			currentLocation: currentLocation,
			historyLocation: historyLocation
		};
	}
};

// check exist room by counting id
// if exist, delete participant from room
export const leave = async (roomId: string, sessionId: string) => {
	const roomCount = await db.$count(roomTbl, eq(roomTbl.id, roomId));
	if (roomCount == 0) {
		throw new Error('Room not found');
	} else {
		await db
			.delete(roomParticipantTbl)
			.where(
				and(eq(roomParticipantTbl.roomId, roomId), eq(roomParticipantTbl.sessionId, sessionId))
			);
	}
};

// check exist room by counting id
// if exist, update participant location
// append location to history
// return participant id, name, current location, history location
export const saveLocation = async (roomId: string, sessionId: string, location: Location) => {
	const roomCount = await db.$count(roomTbl, eq(roomTbl.id, roomId));
	if (roomCount == 0) {
		throw new Error('Room not found');
	} else {
		// get history location and append new location
		const participant = await db
			.select()
			.from(roomParticipantTbl)
			.where(
				and(eq(roomParticipantTbl.roomId, roomId), eq(roomParticipantTbl.sessionId, sessionId))
			);
		if (participant[0].historyLocation) {
			participant[0].historyLocation.push(location);
		} else {
			participant[0].historyLocation = [location];
		}

		await db
			.update(roomParticipantTbl)
			.set({
				currentLocation: location,
				historyLocation: participant[0].historyLocation
			})
			.where(
				and(eq(roomParticipantTbl.roomId, roomId), eq(roomParticipantTbl.sessionId, sessionId))
			);
	}
};
