import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_FOR_SOCKET } from '../api/axios';

export function useSocket() {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<any>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let s: Socket | null = null;

    const connectSocket = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        
        if (!token) return;

        s = io(API_URL_FOR_SOCKET, {
          auth: { token },
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          timeout: 10000,
        });

        s.on('connect', () => {
          setIsConnected(true);
          setConnectionError(null);
          console.log('Socket connected');
        });

        s.on('disconnect', () => {
          setIsConnected(false);
          console.log('Socket disconnected');
        });

        s.on('connect_error', (error) => {
          setIsConnected(false);
          setConnectionError(error.message);
          console.log('Socket connection error:', error.message);
        });

        s.on('newAlert', (alert) => {
          setNewAlert(alert);
          console.log('New alert received:', alert);
        });

        setSocket(s);
      } catch (error) {
        console.error('Failed to connect socket:', error);
        setConnectionError('Failed to connect');
      }
    };

    connectSocket();

    return () => {
      if (s) {
        s.removeAllListeners();
        s.close();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated]);

  return {
    socket,
    isConnected,
    newAlert,
    setNewAlert,
    connectionError,
  };
}