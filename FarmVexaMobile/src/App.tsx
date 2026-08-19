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

LogBox.ignoreLogs(['AsyncStorage', 'Native module']);

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // Silent check - only shows alert if UPDATE FOUND
    const timer = setTimeout(() => {
      checkForUpdate(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="dark" backgroundColor={colors.white} />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}