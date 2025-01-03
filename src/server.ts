import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { createClient } from 'redis';
import { createSocketServer } from './socket';

const app = express();
app.use(cors({ origin: '*' })); // Allow all domains for all routes

const server = http.createServer(app);

// Create redis pub/sub adapter for socket io
const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

await createSocketServer(server);

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
