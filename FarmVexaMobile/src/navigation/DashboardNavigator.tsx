import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardStackParamList } from '../types';
import Dashboard from '../screens/dashboard/Dashboard';
import AlertList from '../screens/alerts/AlertList';
import AIChat from '../screens/chat/AIChat';
import Weather from '../screens/weather/Weather';
import SensorReadings from '../screens/sensors/SensorReadings';
import { colors } from '../theme';

const Stack = createStackNavigator<DashboardStackParamList>();

export default function DashboardNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen 
        name="DashboardHome" 
        component={Dashboard} 
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={AlertList} 
        options={{ title: 'Alerts' }}
      />
      <Stack.Screen 
        name="Weather" 
        component={Weather} 
        options={{ title: 'Weather' }}
      />
      <Stack.Screen 
        name="SensorReadings" 
        component={SensorReadings} 
        options={{ title: 'Sensor Readings' }}
      />
      <Stack.Screen 
        name="AIChat" 
        component={AIChat} 
        options={{ title: 'AI Chat' }}
      />
    </Stack.Navigator>
  );
}