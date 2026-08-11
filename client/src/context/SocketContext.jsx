import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const { token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [newAlert, setNewAlert] = useState(null);

    useEffect(() => {
        if (!token) return;

        const s = io(API_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        s.on('connect', () => setIsConnected(true));
        s.on('disconnect', () => setIsConnected(false));
        s.on('newAlert', (alert) => setNewAlert(alert));

        setSocket(s);
        return () => s.close();
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, newAlert, setNewAlert }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);