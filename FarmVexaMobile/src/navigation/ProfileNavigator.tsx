import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../types';
import Profile from '../screens/profile/Profile';
import Settings from '../screens/profile/Settings';
import ChangePassword from '../screens/profile/ChangePassword';
import DocumentsTab from '../screens/profile/DocumentsTab';
import DownloadsTab from '../screens/profile/DownloadsTab';
import SupportTab from '../screens/profile/SupportTab';
import Plans from '../screens/plans/Plans';
import UpgradeCheckout from '../screens/plans/UpgradeCheckout';
import { colors } from '../theme';

const Stack = createStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
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
        name="ProfileHome" 
        component={Profile} 
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={Settings} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePassword} 
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen 
        name="DocumentsTab" 
        component={DocumentsTab} 
        options={{ title: 'Documents' }}
      />
      <Stack.Screen 
        name="DownloadsTab" 
        component={DownloadsTab} 
        options={{ title: 'Downloads' }}
      />
      <Stack.Screen 
        name="SupportTab" 
        component={SupportTab} 
        options={{ title: 'Support' }}
      />
      <Stack.Screen 
        name="Plans" 
        component={Plans} 
        options={{ title: 'Plans & Upgrades' }}
      />
      <Stack.Screen 
        name="UpgradeCheckout" 
        component={UpgradeCheckout} 
        options={{ title: 'Upgrade Checkout' }}
      />
    </Stack.Navigator>
  );
}