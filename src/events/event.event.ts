import type { RoomContext } from '$lib/types';
import type { Socket } from 'socket.io';

export async function join(socket: Socket, context: RoomContext) {
	if (!context.roomId) return;
	console.log('Send join event', context);
	await socket.to(context.roomId).emit('events', {
		type: 'join',
		data: { sessionId: context.sessionId }
	});
}

export async function leave(socket: Socket, context: RoomContext) {
	if (!context.roomId) return;
	await socket.to(context.roomId).emit('events', {
		type: 'leave',
		data: { sessionId: context.sessionId }
	});
}
