import { create } from 'zustand';
import { authApi, storage } from '../api/axios';
import { User, Invoice, Scope } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  invoice: Invoice | null;
  scope: Scope | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refresh: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  setInvoice: (invoice: Invoice | null) => void;
  setScope: (scope: Scope | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  invoice: null,
  scope: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const data = res.data.data;
    const { user, token, invoice, scope } = data;

    await storage.setItem('token', token);
    await storage.setItem('user', JSON.stringify(user));
    if (invoice) await storage.setItem('invoice', JSON.stringify(invoice));
    if (scope) await storage.setItem('scope', scope);

    set({
      user,
      token,
      invoice: invoice || null,
      scope: scope || null,
      isAuthenticated: true,
      isLoading: false,
    });

    return user;
  },

  logout: async () => {
    await storage.removeItem('token');
    await storage.removeItem('user');
    await storage.removeItem('invoice');
    await storage.removeItem('scope');
    set({
      user: null,
      token: null,
      invoice: null,
      scope: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadUser: async () => {
    try {
      const token = await storage.getItem('token');
      if (!token) {
        set({ isLoading: false });
        return;
      }

      const userStr = await storage.getItem('user');
      const invoiceStr = await storage.getItem('invoice');
      const scopeStr = await storage.getItem('scope');

      set({
        token,
        user: userStr ? JSON.parse(userStr) : null,
        invoice: invoiceStr ? JSON.parse(invoiceStr) : null,
        scope: (scopeStr as Scope) || null,
        isAuthenticated: true,
        isLoading: false,
      });

      // Fetch fresh session in background
      try {
        const res = await authApi.me();
        const { user, invoice, scope } = res.data.data;
        await storage.setItem('user', JSON.stringify(user));
        if (invoice) await storage.setItem('invoice', JSON.stringify(invoice));
        if (scope) await storage.setItem('scope', scope);
        set({ user, invoice: invoice || null, scope: scope || null });
      } catch (error: any) {
        if (error.response?.status === 401) {
          await get().logout();
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  // Called every 60s + on foreground
  refresh: async () => {
    const token = get().token;
    if (!token) return;

    try {
      const res = await authApi.me();
      const { user, invoice, scope } = res.data.data;
      await storage.setItem('user', JSON.stringify(user));
      if (invoice) await storage.setItem('invoice', JSON.stringify(invoice));
      if (scope) await storage.setItem('scope', scope);
      set({ user, invoice: invoice || null, scope: scope || null });
    } catch (error: any) {
      if (error.response?.status === 401) {
        await get().logout();
      }
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...userData };
      set({ user: updated });
      storage.setItem('user', JSON.stringify(updated));
    }
  },

  setInvoice: (invoice: Invoice | null) => {
    set({ invoice });
    if (invoice) {
      storage.setItem('invoice', JSON.stringify(invoice));
    } else {
      storage.removeItem('invoice');
    }
  },

  setScope: (scope: Scope | null) => {
    set({ scope });
    if (scope) {
      storage.setItem('scope', scope);
    } else {
      storage.removeItem('scope');
    }
  },
}));