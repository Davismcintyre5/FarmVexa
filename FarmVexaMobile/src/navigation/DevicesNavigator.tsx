import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { DevicesStackParamList } from '../types';
import DevicesHome from '../screens/devices/DevicesHome';
import DeviceList from '../screens/devices/DeviceList';
import DeviceDetail from '../screens/devices/DeviceDetail';
import DeviceRegister from '../screens/devices/DeviceRegister';
import SensorReadings from '../screens/sensors/SensorReadings';
import Weather from '../screens/weather/Weather';
import { colors } from '../theme';

const Stack = createStackNavigator<DevicesStackParamList>();

export default function DevicesNavigator() {
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
        name="DevicesHome" 
        component={DevicesHome} 
        options={{ title: 'Devices & Sensors' }}
      />
      <Stack.Screen 
        name="DeviceList" 
        component={DeviceList} 
        options={{ title: 'Devices' }}
      />
      <Stack.Screen 
        name="DeviceDetail" 
        component={DeviceDetail} 
        options={{ title: 'Device Details' }}
      />
      <Stack.Screen 
        name="DeviceRegister" 
        component={DeviceRegister} 
        options={{ title: 'Register Device' }}
      />
      <Stack.Screen 
        name="SensorReadings" 
        component={SensorReadings} 
        options={{ title: 'Sensor Readings' }}
      />
      <Stack.Screen 
        name="Weather" 
        component={Weather} 
        options={{ title: 'Weather' }}
      />
    </Stack.Navigator>
  );
}