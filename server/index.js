// InkYaiba Server — Entry Point
require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { setupSocketHandlers } = require('./socketHandlers');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173'],
  methods: ['GET', 'POST'],
}));

app.use(express.json());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Setup socket handlers
setupSocketHandlers(io);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'InkYaiba server is running ⚓',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start
server.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║     ⚓ InkYaiba Server Running ⚓     ║
  ║     Port: ${PORT}                        ║
  ║     Client: ${CLIENT_URL}  ║
  ╚═══════════════════════════════════════╝
  `);
});
