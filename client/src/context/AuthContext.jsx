import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            authApi.getProfile()
                .then((res) => setUser(res.data.data.user))
                .catch((err) => {
                    if (err.response?.status === 401) {
                        logout();
                    }
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [token]);

    const login = async (data) => {
        try {
            const res = await authApi.login(data);
            const { user, token } = res.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setToken(token);
            setUser(user);
            return user;
        } catch (err) {
            if (err.response?.status === 402) {
                const responseData = err.response.data?.data;
                if (responseData?.token) {
                    localStorage.setItem('token', responseData.token);
                    localStorage.setItem('user', JSON.stringify(responseData.user));
                    setToken(responseData.token);
                    setUser(responseData.user);
                }
                throw err;
            }
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        return res.data;
    };

    const updateUser = (userData) => {
        setUser((prev) => ({ ...prev, ...userData }));
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