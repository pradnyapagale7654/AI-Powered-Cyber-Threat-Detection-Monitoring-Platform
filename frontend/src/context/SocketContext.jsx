import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [newIncidents, setNewIncidents] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  useEffect(() => {
    // Explicitly target backend server port 5000 directly to avoid Vite dev proxy polling errors
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const socketClient = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    socketClient.on('connect', () => {
      console.log('Socket.IO Connected to CyberShield SOC Stream');
      setIsConnected(true);
    });

    socketClient.on('disconnect', () => {
      console.warn('Socket.IO Disconnected from SOC Stream');
      setIsConnected(false);
    });

    socketClient.on('connect_error', () => {
      setIsConnected(false);
    });

    socketClient.on('live-event', (eventData) => {
      setLiveEvents(prev => [eventData, ...prev.slice(0, 49)]);
    });

    socketClient.on('new-incident', (incidentData) => {
      setNewIncidents(prev => [incidentData, ...prev.slice(0, 19)]);
    });

    socketClient.on('new-alert', () => {
      setUnreadAlertsCount(prev => prev + 1);
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, liveEvents, newIncidents, unreadAlertsCount, setUnreadAlertsCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
