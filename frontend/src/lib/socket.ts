/**
 * socket.ts - Cliente Socket.IO con autenticación JWT
 *
 * El token JWT se envía en el handshake (socket.handshake.auth.token).
 * El backend verifica el token antes de aceptar la conexión.
 */
import { io } from 'socket.io-client';
import { getToken } from './api';

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  auth: (cb) => {
    cb({ token: getToken() });
  },
});

export default socket;