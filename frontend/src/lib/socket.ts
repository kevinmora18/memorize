import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const socket = io(socketUrl, { 
  autoConnect: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

export default socket;


