import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [scope, setScope] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    const refresh = async () => {
        try {
            const res = await authApi.me();
            const { user: u, invoice: inv, scope: sc } = res.data.data;
            setUser(u);
            setInvoice(inv);
            setScope(sc);
            localStorage.setItem('user', JSON.stringify(u));
            return { user: u, invoice: inv, scope: sc };
        } catch (err) {
            if (err.response?.status === 401) logout();
            throw err;
        }
    };

    useEffect(() => {
        if (token) {
            refresh().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => { refresh().catch(() => {}); }, 60000);
        const onFocus = () => { refresh().catch(() => {}); };
        window.addEventListener('focus', onFocus);
        return () => { clearInterval(interval); window.removeEventListener('focus', onFocus); };
    }, [token]);

    const login = async (data) => {
        try {
            const res = await authApi.login(data);
            const { user: u, invoice: inv, scope: sc, token: t } = res.data.data;
            localStorage.setItem('token', t);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(t);
            setUser(u);
            setInvoice(inv || null);
            setScope(sc || null);
            return { user: u, invoice: inv, scope: sc };
        } catch (err) {
            if (err.response?.status === 402) {
                const responseData = err.response.data?.data;
                if (responseData?.token) {
                    localStorage.setItem('token', responseData.token);
                    localStorage.setItem('user', JSON.stringify(responseData.user));
                    setToken(responseData.token);
                    setUser(responseData.user);
                    setInvoice(responseData.invoice || null);
                    setScope(responseData.scope || 'expired');
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
        setInvoice(null);
        setScope(null);
    };

    const register = async (data) => {
        const res = await authApi.register(data);
        const { user: u, invoice: inv, scope: sc, token: t } = res.data.data;
        localStorage.setItem('token', t);
        localStorage.setItem('user', JSON.stringify(u));
        setToken(t);
        setUser(u);
        setInvoice(inv || null);
        setScope(sc || 'pending');
        return res.data;
    };

    const updateUser = (userData) => {
        setUser((prev) => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{
            user, invoice, scope, token, isAuthenticated: !!token, isLoading,
            login, logout, register, updateUser, refresh,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);