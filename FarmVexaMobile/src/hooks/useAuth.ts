import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const {
    user,
    token,
    invoice,
    scope,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loadUser,
    refresh,
    updateUser,
    setInvoice,
    setScope,
  } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return {
    user,
    token,
    invoice,
    scope,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refresh,
    updateUser,
    setInvoice,
    setScope,
  };
}