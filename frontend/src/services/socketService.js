import { io } from 'socket.io-client';

let socketInstance = null;

export const initSocket = (url = 'http://localhost:5000') => {
  if (!socketInstance) {
    socketInstance = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true
    });
  }
  return socketInstance;
};

export const getSocket = () => socketInstance;
