import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, register, loadUser, updateUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  };
}