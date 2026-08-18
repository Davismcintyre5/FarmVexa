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
import { isValidEmail } from '../../utils/validators';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function ForgotPassword() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/farm/auth/forgot-password`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Check if response is successful
      if (response.data?.success === true) {
        setSent(true);
      } else {
        // Server returns success:false but might still send email
        // Check message
        const message = response.data?.message || '';
        if (message.includes('sent')) {
          setSent(true);
        } else {
          Alert.alert('Error', message || 'Failed to send reset email');
        }
      }
    } catch (err: any) {
      // Network error
      if (err.message === 'Network Error') {
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      } else {
        Alert.alert(
          'Error',
          err.response?.data?.message || 'Failed to send reset email. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Logo size="md" />
        <View style={styles.successIconContainer}>
          <Ionicons name="mail" size={64} color={colors.primary[500]} />
        </View>
        <Text style={styles.successTitle}>Check Your Email</Text>
        <Text style={styles.successText}>
          We've sent password reset instructions to{' '}
          <Text style={styles.successEmail}>{email}</Text>
        </Text>
        <Text style={styles.successNote}>
          The link will expire in 30 minutes. Didn't receive it? Check your spam folder.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} fullWidth size="lg">
          Back to Login
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
        
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        <View style={styles.form}>
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="hdm@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
            Send Reset Link
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
  },
  successEmail: {
    fontWeight: '600',
    color: colors.gray[900],
  },
  successNote: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});