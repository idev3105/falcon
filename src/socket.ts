import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { RoomContext } from '$lib/types';
import {
	join as handleJoinEvent,
	leave as handleLeaveEvent,
	sendLocation
} from './events/room.event';
import { instrument } from '@socket.io/admin-ui';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import type { Http2SecureServer } from 'http2';

export async function createSocketServer(
	server: http.Server | Http2SecureServer
): Promise<SocketIOServer> {
	// create redis pub/sub adapter for socket io
	const pubClient = createClient({ url: 'redis://localhost:6379' });
	const subClient = pubClient.duplicate();

	await Promise.all([pubClient.connect(), subClient.connect()]);

	const io = new SocketIOServer(server, {
		adapter: createAdapter(pubClient, subClient),
		cors: {
			origin: '*'
		}
	});
	instrument(io, {
		auth: false,
		mode: 'development'
	});

	io.on('connection', async (socket) => {
		const roomContext: RoomContext = {
			sessionId: socket.id
		};

		console.log('New client connected:', socket.id);

		socket.on('join', async (data: { roomId: string; name: string }) => {
			roomContext.roomId = data.roomId;
			roomContext.name = data.name;
			await handleJoinEvent(socket, roomContext);
			console.log(
				`User ${roomContext.sessionId} - ${roomContext.name} joined room ${roomContext.roomId}`
			);
		});

		socket.on('leave', async () => {
			await handleLeaveEvent(socket, roomContext);
			console.log(`User ${roomContext.sessionId} - ${roomContext.name} left room`);
		});

		socket.on('locations', async (location: { lat: number; lng: number }) => {
			if (roomContext.roomId) {
				roomContext.currentLocation = location;
			}

			await sendLocation(socket, roomContext, location);
			console.log(`User ${roomContext.sessionId} - ${roomContext.name} sent location`);
		});

		socket.on('disconnect', async () => {
			await handleLeaveEvent(socket, roomContext);
			console.log(`User ${roomContext.sessionId} - ${roomContext.name} disconnected`);
		});
	});

	return io;
}
