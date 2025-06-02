import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const socket = io(SOCKET_URL, {
  autoConnect: false, // call socket.connect() manually after auth
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err);
});

export default socket;
