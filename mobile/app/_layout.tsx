import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <SocketProvider>
                    <StatusBar style="auto" />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </SocketProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
