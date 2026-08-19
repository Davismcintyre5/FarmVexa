import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ScanStackParamList } from '../types';
import ScanHome from '../screens/scan/ScanHome';
import CropScan from '../screens/scan/CropScan';
import ScanResult from '../screens/scan/ScanResult';
import ScanHistory from '../screens/scan/ScanHistory';
import FieldScan from '../screens/scan/FieldScan';
import FieldScanResult from '../screens/scan/FieldScanResult';
import FieldScanHistory from '../screens/scan/FieldScanHistory';
import { colors } from '../theme';

const Stack = createStackNavigator<ScanStackParamList>();

export default function ScanNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="ScanHome" component={ScanHome} options={{ title: 'Scan' }} />
      <Stack.Screen name="CropScan" component={CropScan} options={{ title: 'Crop Scan' }} />
      <Stack.Screen name="ScanResult" component={ScanResult} options={{ title: 'Scan Result' }} />
      <Stack.Screen name="ScanHistory" component={ScanHistory} options={{ title: 'Crop Scan History' }} />
      <Stack.Screen name="FieldScan" component={FieldScan} options={{ title: 'Field Scan' }} />
      <Stack.Screen name="FieldScanResult" component={FieldScanResult} options={{ title: 'Field Scan Result' }} />
      <Stack.Screen name="FieldScanHistory" component={FieldScanHistory} options={{ title: 'Field Scan History' }} />
    </Stack.Navigator>
  );
}