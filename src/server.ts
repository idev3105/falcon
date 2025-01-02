import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import type { RoomContext } from '$lib/types';
import {
	join as handleJoinEvent,
	leave as handleLeaveEvent,
	sendLocation
} from './events/room.event';
import { instrument } from '@socket.io/admin-ui';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const app = express();
app.use(cors({ origin: '*' })); // Allow all domains for all routes

const server = http.createServer(app);

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

	socket.on('location', async (location: { lat: number; lng: number }) => {
		await sendLocation(socket, roomContext, location);
		console.log(`User ${roomContext.sessionId} - ${roomContext.name} sent location`);
	});

	socket.on('disconnect', async () => {
		await handleLeaveEvent(socket, roomContext);
		console.log(`User ${roomContext.sessionId} - ${roomContext.name} disconnected`);
	});

	socket.on('test', () => {
		console.log('Test event received');
		socket.emit('test');
	});
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
