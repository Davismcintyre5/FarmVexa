import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FarmsStackParamList } from '../types';
import FarmList from '../screens/farms/FarmList';
import FarmDetail from '../screens/farms/FarmDetail';
import FarmCreate from '../screens/farms/FarmCreate';
import FarmEdit from '../screens/farms/FarmEdit';
import FieldList from '../screens/farms/FieldList';
import FieldDetail from '../screens/farms/FieldDetail';
import FieldCreate from '../screens/farms/FieldCreate';
import FieldEdit from '../screens/farms/FieldEdit';
import { colors } from '../theme';

const Stack = createStackNavigator<FarmsStackParamList>();

export default function FarmsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="FarmList" component={FarmList} options={{ title: 'Farms' }} />
      <Stack.Screen name="FarmDetail" component={FarmDetail} options={{ title: 'Farm Details' }} />
      <Stack.Screen name="FarmCreate" component={FarmCreate} options={{ title: 'Add Farm' }} />
      <Stack.Screen name="FarmEdit" component={FarmEdit} options={{ title: 'Edit Farm' }} />
      <Stack.Screen name="FieldList" component={FieldList} options={{ title: 'Fields' }} />
      <Stack.Screen name="FieldDetail" component={FieldDetail} options={{ title: 'Field Details' }} />
      <Stack.Screen name="FieldCreate" component={FieldCreate} options={{ title: 'Add Field' }} />
      <Stack.Screen name="FieldEdit" component={FieldEdit} options={{ title: 'Edit Field' }} />
    </Stack.Navigator>
  );
}