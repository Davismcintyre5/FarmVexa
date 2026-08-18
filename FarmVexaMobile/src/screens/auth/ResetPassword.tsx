import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { colors, spacing } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function ResetPassword() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({
    token: '',
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
      const response = await axios.post(
        `${API_URL}/farm/auth/reset-password`,
        {
          token: form.token,
          newPassword: form.newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data?.success) {
        setSuccess(true);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to reset password');
      }
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to reset password. Please check your token and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Logo size="md" />
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
        </View>
        <Text style={styles.successTitle}>Password Reset!</Text>
        <Text style={styles.successText}>
          Your password has been successfully changed. You can now login with your new password.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} fullWidth size="lg">
          Go to Login
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size="md" />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the reset token from your email and your new password.
        </Text>

        <View style={styles.form}>
          <Input
            label="Reset Token"
            value={form.token}
            onChangeText={(text) => handleChange('token', text)}
            placeholder="Enter reset token from email"
            autoCapitalize="none"
            autoCorrect={false}
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

          <Button
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            fullWidth
          >
            Back to Login
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  successText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
});