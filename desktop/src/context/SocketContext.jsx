import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [newAlert, setNewAlert] = useState(null);

    useEffect(() => {
        if (!token || !isAuthenticated) return;

        const s = io(API_URL, {
            auth: { token },
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        });

        s.on('connect', () => setIsConnected(true));
        s.on('disconnect', () => setIsConnected(false));
        s.on('connect_error', () => {}); // Silently handle
        s.on('newAlert', (alert) => setNewAlert(alert));

        setSocket(s);

        return () => {
            s.close();
        };
    }, [token, isAuthenticated]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, newAlert, setNewAlert }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);