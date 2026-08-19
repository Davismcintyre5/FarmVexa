import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OperationsStackParamList } from '../types';
import Operations from '../screens/operations/Operations';
import AIChat from '../screens/chat/AIChat';
import { colors } from '../theme';

const Stack = createStackNavigator<OperationsStackParamList>();

export default function OperationsNavigator() {
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
        name="OperationsHome" 
        component={Operations} 
        options={{ title: 'Operations' }}
      />
      <Stack.Screen 
        name="AIChat" 
        component={AIChat} 
        options={{ title: 'AI Chat' }}
      />
    </Stack.Navigator>
  );
}