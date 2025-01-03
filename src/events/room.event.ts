import { Socket } from 'socket.io';
import {
	join as joinRoom,
	leave as leaveRoom,
	saveLocation
} from '$lib/server/services/room.service';
import { join as sendJoinEvent, leave as sendLeaveEvent } from './event.event';
import type { RoomContext } from '$lib/types';

export async function join(socket: Socket, context: RoomContext) {
	if (!context.roomId || !context.name) return;
	await joinRoom(context.roomId, context.sessionId, context.name);
	await socket.join(context.roomId);
	await sendJoinEvent(socket, context);
}

export async function leave(socket: Socket, context: RoomContext) {
	if (!context.roomId) return;
	await leaveRoom(context.roomId, context.sessionId);
	await sendLeaveEvent(socket, context);
}

export async function sendLocation(
	socket: Socket,
	context: RoomContext,
	data: { lat: number; lng: number }
) {
	if (!context.roomId) return;
	await saveLocation(context.roomId, context.sessionId, data);
	await socket.to(context.roomId).emit('locations', data);
}
