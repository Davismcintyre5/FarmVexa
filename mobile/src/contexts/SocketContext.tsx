import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext<any>(null);

const SOCKET_URL = 'https://farmvexaserver.pxxl.click';

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { token, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [newAlert, setNewAlert] = useState<any>(null);

    useEffect(() => {
        if (!token || !isAuthenticated) return;

        const s = io(SOCKET_URL, {
            auth: { token },
            transports: ['polling', 'websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
        });

        s.on('connect', () => setIsConnected(true));
        s.on('disconnect', () => setIsConnected(false));
        s.on('connect_error', () => {});
        s.on('newAlert', (alert: any) => setNewAlert(alert));

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