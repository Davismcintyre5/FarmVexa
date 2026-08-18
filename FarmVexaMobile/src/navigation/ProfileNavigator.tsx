import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import { colors } from '../theme';

const Stack = createStackNavigator<ProfileStackParamList>();

// Placeholder
function ComingSoon() {
  return null;
}

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="ProfileHome" 
        component={ComingSoon} 
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}