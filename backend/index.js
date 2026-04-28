import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5176;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration for Render/production
const corsOptions = {
  origin: NODE_ENV === 'production' ? FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Datos en memoria (para desarrollo)
let rooms = [
  {
    id: '1',
    name: 'Sala de Prueba',
    code: 'ABC123',
    players: [
      { id: '1', email: 'jugador1@test.com', teamId: 1 },
      { id: '2', email: 'jugador2@test.com', teamId: 1 }
    ],
    maxPlayers: 10,
    isStarted: false,
    currentRound: 1,
    currentTeam: 1,
    creatorId: '1'
  }
];

// Helpers
const generateId = () => Date.now().toString();
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  if (rooms.some(r => r.code === code)) return generateRoomCode();
  return code;
};

// Crear servidor HTTP y Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.id);
  // Enviar estado inicial de rooms al cliente conectado
  socket.emit('rooms:update', rooms);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
  });

  socket.on('disconnect', () => {
    console.log('Socket desconectado:', socket.id);
  });
});

// Endpoints
app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.post('/api/rooms', (req, res) => {
  const { name, creator } = req.body;
  if (!name || !creator) return res.status(400).json({ error: 'name and creator required' });

  const newRoom = {
    id: generateId(),
    name,
    code: generateRoomCode(),
    players: [ { id: creator.id, email: creator.email, teamId: creator.teamId || 1 } ],
    maxPlayers: 10,
    isStarted: false,
    currentRound: 1,
    currentTeam: 1,
    creatorId: creator.id
  };
  rooms.push(newRoom);
  // Emitir update por WebSocket
  io.emit('rooms:update', rooms);
  res.status(201).json(newRoom);
});

app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  const player = { id: generateId(), email, teamId: 0 };
  res.json(player);
});

app.post('/api/rooms/:id/join', (req, res) => {
  const { id } = req.params;
  const { player, teamId } = req.body;
  const room = rooms.find(r => r.id === id || r.code === id);
  if (!room) return res.status(404).json({ error: 'room not found' });
  const p = { id: player.id || generateId(), email: player.email, teamId: teamId || 1 };
  if (!room.players.some(pl => pl.id === p.id)) room.players.push(p);
  io.emit('rooms:update', rooms);
  io.to(room.id).emit('player:joined', { roomId: room.id, player: p });
  res.json(room);
});

app.put('/api/rooms/:id/start', (req, res) => {
  const { id } = req.params;
  const room = rooms.find(r => r.id === id || r.code === id);
  if (!room) return res.status(404).json({ error: 'room not found' });
  room.isStarted = true;
  io.emit('rooms:update', rooms);
  io.to(room.id).emit('room:started', { roomId: room.id });
  res.json(room);
});

// Endpoint para emitir eventos del juego (placeholder)
app.post('/api/rooms/:id/event', (req, res) => {
  const { id } = req.params;
  const { event } = req.body;
  io.to(id).emit('game:event', { roomId: id, event });
  res.json({ ok: true });
});

httpServer.listen(PORT, () => {
  console.log(`Backend (HTTP + WS) escuchando en http://localhost:${PORT} [${NODE_ENV}]`);
});
