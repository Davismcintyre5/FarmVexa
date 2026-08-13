import React from 'react';
import { Stack } from 'expo-router';

export default function OperationsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="equipment" />
            <Stack.Screen name="finance" />
            <Stack.Screen name="health" />
            <Stack.Screen name="inventory" />
            <Stack.Screen name="livestock" />
            <Stack.Screen name="production" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="tasks" />
            <Stack.Screen name="team" />
        </Stack>
    );
}
