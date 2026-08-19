import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import DashboardNavigator from './DashboardNavigator';
import FarmsNavigator from './FarmsNavigator';
import ScanNavigator from './ScanNavigator';
import OperationsNavigator from './OperationsNavigator';
import DevicesNavigator from './DevicesNavigator';
import ProfileNavigator from './ProfileNavigator';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Farms':
              iconName = focused ? 'leaf' : 'leaf-outline';
              break;
            case 'Scan':
              iconName = focused ? 'camera' : 'camera-outline';
              break;
            case 'Devices':
              iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
              break;
            case 'Operations':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'Settings':
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardNavigator} />
      <Tab.Screen name="Farms" component={FarmsNavigator} />
      <Tab.Screen name="Scan" component={ScanNavigator} />
      <Tab.Screen name="Devices" component={DevicesNavigator} />
      <Tab.Screen name="Operations" component={OperationsNavigator} />
      <Tab.Screen name="Settings" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}