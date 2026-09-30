import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [scope, setScope] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const applySession = useCallback((data) => {
        if (data?.token) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
        }
        if (data?.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
        }
        setInvoice(data?.invoice || null);
        setScope(data?.scope || (data?.user?.approvalStatus === 'pending' ? 'pending' : 'active'));
    }, []);

    const clearSession = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setInvoice(null);
        setScope(null);
    }, []);

    const refresh = useCallback(async () => {
        try {
            const res = await authApi.me();
            const data = res.data?.data || {};
            setUser(data.user || null);
            setInvoice(data.invoice || null);
            setScope(data.scope || null);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            return data;
        } catch (err) {
            if (err.response?.status === 401) clearSession();
            throw err;
        }
    }, [clearSession]);

    // Initial load
    useEffect(() => {
        if (!token) {
            setIsLoading(false);
            return;
        }

        authApi.me()
            .then((res) => {
                const data = res.data?.data || {};
                setUser(data.user || null);
                setInvoice(data.invoice || null);
                setScope(data.scope || null);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
            })
            .catch((err) => {
                if (err.response?.status === 401) clearSession();
            })
            .finally(() => setIsLoading(false));
    }, [token, clearSession]);

    // Auto-refresh session every 60s while logged in
    useEffect(() => {
        if (!token) return;
        const id = setInterval(() => {
            refresh().catch(() => {});
        }, 60000);
        return () => clearInterval(id);
    }, [token, refresh]);

    // Refresh on window focus (user returns to tab)
    useEffect(() => {
        if (!token) return;
        const handler = () => {
            refresh().catch(() => {});
        };
        window.addEventListener('focus', handler);
        return () => window.removeEventListener('focus', handler);
    }, [token, refresh]);

    const login = async (data) => {
        const res = await authApi.login(data);
        const payload = res.data?.data || {};
        applySession(payload);
        return payload;
    };

    const logout = () => {
        clearSession();
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        const payload = res.data?.data || {};
        applySession(payload);
        return payload;
    };

    const updateUser = (userData) => {
        setUser((prev) => {
            const merged = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(merged));
            return merged;
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            invoice,
            scope,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout,
            register,
            updateUser,
            refresh,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);