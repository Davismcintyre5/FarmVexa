import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthFrame from '../../components/layout/AuthFrame';
import { colors, spacing } from '../../theme';

export default function ResetPassword() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const tokenFromUrl = route.params?.token || '';

  const [form, setForm] = useState({
    token: tokenFromUrl,
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.token) {
      Alert.alert('Error', 'Please enter the reset token from your email');
      return;
    }
    if (!form.newPassword || form.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Token in URL, password in body
      await authApi.resetPassword(form.token, form.newPassword);
      setSuccess(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthFrame>
        <Text style={styles.successTitle}>Password Reset!</Text>
        <Text style={styles.successText}>
          Your password has been changed successfully.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} fullWidth size="lg">
          Go to Login
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>
        Enter the reset token from your email and choose a new password.
      </Text>

      <Input
        label="Reset Token"
        value={form.token}
        onChangeText={(text) => handleChange('token', text)}
        placeholder="Paste token from email"
        autoCapitalize="none"
        editable={!tokenFromUrl}
      />
      <Input
        label="New Password"
        value={form.newPassword}
        onChangeText={(text) => handleChange('newPassword', text)}
        placeholder="Min 6 characters"
        secureTextEntry
      />
      <Input
        label="Confirm New Password"
        value={form.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
        placeholder="Repeat new password"
        secureTextEntry
      />

      <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
        Reset Password
      </Button>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary[700],
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});