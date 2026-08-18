import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardStackParamList } from '../types';
import Dashboard from '../screens/dashboard/Dashboard';
import { colors } from '../theme';

const Stack = createStackNavigator<DashboardStackParamList>();

export default function DashboardNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="DashboardHome" 
        component={Dashboard} 
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}