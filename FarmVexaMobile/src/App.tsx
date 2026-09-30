import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { LogBox } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import { navigationRef } from './navigation/navigationRef';
import { StatusBar } from 'expo-status-bar';
import { colors } from './theme';
import { checkForUpdate } from './utils/updateChecker';
import { useSessionRefresh } from './hooks/useSessionRefresh';
import { useDeepLinks } from './hooks/useDeepLinks';

LogBox.ignoreLogs(['AsyncStorage', 'Native module']);

const queryClient = new QueryClient();

function AppInner() {
  // Session freshness — 60s interval + foreground
  useSessionRefresh();

  // Deep link listener — farmvexa://invoice/...
  useDeepLinks();

  useEffect(() => {
    // Silent update check
    const timer = setTimeout(() => {
      checkForUpdate(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="dark" backgroundColor={colors.white} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppInner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}