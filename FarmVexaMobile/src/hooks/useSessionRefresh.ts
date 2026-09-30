import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store/authStore';

const REFRESH_INTERVAL_MS = 60 * 1000; // 60 seconds

/**
 * Session freshness hook.
 * - Refreshes /me every 60 seconds while logged in.
 * - Refreshes /me when the app returns to foreground.
 * 
 * Call this once, in the top-level App component.
 */
export function useSessionRefresh() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const refresh = useAuthStore((s) => s.refresh);
  const appState = useRef(AppState.currentState);

  // 60s interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refresh();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  // Foreground refresh via AppState
  useEffect(() => {
    if (!isAuthenticated) return;

    const handler = (nextState: AppStateStatus) => {
      const prevState = appState.current;

      // App came to foreground
      if (
        (prevState === 'background' || prevState === 'inactive') &&
        nextState === 'active'
      ) {
        refresh();
      }

      appState.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handler);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, refresh]);
}