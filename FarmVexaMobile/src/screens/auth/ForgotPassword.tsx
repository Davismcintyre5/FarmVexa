import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthFrame from '../../components/layout/AuthFrame';
import { colors, spacing } from '../../theme';
import { isValidEmail } from '../../utils/validators';
import { Ionicons } from '@expo/vector-icons';

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
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthFrame>
        <View style={styles.iconBox}>
          <Ionicons name="mail" size={48} color={colors.primary[500]} />
        </View>
        <Text style={styles.successTitle}>Check Your Email</Text>
        <Text style={styles.successText}>
          We've sent password reset instructions to {email}
        </Text>
        <Text style={styles.successNote}>
          The link expires in 30 minutes.
        </Text>
        <Button onPress={() => navigation.navigate('Login')} fullWidth size="lg">
          Back to Login
        </Button>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your email and we'll send you reset instructions.
      </Text>

      <Input
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        placeholder="hdm@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
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
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  successNote: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});