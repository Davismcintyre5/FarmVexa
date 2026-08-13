import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadToken();
    }, []);

    useEffect(() => {
        if (token) {
            authApi.getProfile()
                .then((res) => setUser(res.data.data.user))
                .catch(() => logout())
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const loadToken = async () => {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken) {
            setToken(storedToken);
            if (storedUser) setUser(JSON.parse(storedUser));
        }
    };

    const login = async (data: any) => {
        const res = await authApi.login(data);
        const { user, token } = res.data.data;
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const register = async (data: any) => {
        const res = await authApi.register(data);
        return res.data;
    };

    const updateUser = (userData: any) => {
        setUser((prev: any) => ({ ...prev, ...userData }));
        AsyncStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
    };

    return (
        <AuthContext.Provider value={{
            user, token, isAuthenticated: !!token, isLoading,
            login, logout, register, updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);