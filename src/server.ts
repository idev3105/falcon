import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { createSocketServer } from './socket';

const app = express();
app.use(cors({ origin: '*' })); // Allow all domains for all routes

const server = http.createServer(app);

await createSocketServer(server);

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
