// src/server.ts
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors'; // Ensure this line is present

const app = express();
app.use(cors({ origin: '*' })); // Allow all domains for all routes

const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: '*'
	}
});

const rooms: Record<string, Set<string>> = {}; // Store rooms and their connected clients

io.on('connection', (socket) => {
	let currentRoom: string | null = null;

	console.log('New client connected:', socket.id);

	socket.on('join', (token: string) => {
		currentRoom = token; // Use token as room identifier
		if (!rooms[currentRoom]) {
			rooms[currentRoom] = new Set();
		}
		rooms[currentRoom].add(socket.id);
		socket.join(currentRoom);
		console.log(`Client ${socket.id} joined room ${currentRoom}`);
	});

	socket.on('location', (location: { lat: number; lon: number }) => {
		if (currentRoom) {
			// Broadcast location to other clients in the same room
			socket.to(currentRoom).emit('location', {
				...location,
				sender: socket.id // Optionally include sender ID
			});
		}
	});

	socket.on('disconnect', () => {
		if (currentRoom) {
			rooms[currentRoom].delete(socket.id);
			if (rooms[currentRoom].size === 0) {
				delete rooms[currentRoom]; // Clean up empty rooms
			}
		}
		console.log('Client disconnected:', socket.id);
	});

	// Event for starting location sharing
	socket.on('startShare', (roomId) => {
		socket.to(roomId).emit('startShare', {
			sender: socket.id
		});
	});

	// Event for stopping location sharing
	socket.on('stopShare', (roomId) => {
		socket.to(roomId).emit('stopShare', {
			sender: socket.id
		});
	});
});

// Serve static files or set up routes here if needed
app.get('/', (req, res) => {
	res.send('Socket.IO server is running');
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
