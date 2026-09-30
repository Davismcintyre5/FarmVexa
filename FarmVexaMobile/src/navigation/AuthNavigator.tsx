import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from '../types';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import Pricing from '../screens/auth/Pricing';
import GetAccess from '../screens/auth/GetAccess';
import Pending from '../screens/pending/Pending';
import Invoice from '../screens/auth/Invoice';
import Renewal from '../screens/auth/Renewal';
import ForgotPassword from '../screens/auth/ForgotPassword';
import ResetPassword from '../screens/auth/ResetPassword';
import { colors } from '../theme';

const Stack = createStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.gray[900],
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Pricing" component={Pricing} options={{ title: 'Plans & Pricing' }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Create Account' }} />
      <Stack.Screen name="GetAccess" component={GetAccess} options={{ title: 'Request Access' }} />
      <Stack.Screen
        name="Pending"
        component={Pending}
        options={{ title: 'Account Pending', headerShown: false }}
      />
      <Stack.Screen
        name="Invoice"
        component={Invoice}
        options={{ title: 'Invoice', headerShown: false }}
      />
      <Stack.Screen name="Renewal" component={Renewal} options={{ title: 'Renew Subscription' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Forgot Password', headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ title: 'Reset Password', headerShown: false }} />
    </Stack.Navigator>
  );
}