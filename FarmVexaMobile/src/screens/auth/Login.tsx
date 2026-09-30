import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { validateLogin } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import AuthFrame from '../../components/layout/AuthFrame';
import { colors, spacing } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { publicApi } from '../../api/axios';

export default function Login() {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [allowRegister, setAllowRegister] = useState(true);

  React.useEffect(() => {
    publicApi
      .getPublicSettings()
      .then((res) => setAllowRegister(res.data.data?.allowSelfRegistration ?? true))
      .catch(() => setAllowRegister(true));
  }, []);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async () => {
    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email, form.password);

      // Route by scope
      const scope = (user as any).scope || 'active';

      if (scope === 'pending' || scope === 'rejected') {
        navigation.reset({ index: 0, routes: [{ name: 'Pending' }] });
      } else if (scope === 'expired') {
        navigation.reset({ index: 0, routes: [{ name: 'Renewal' }] });
      } else {
        // RootNavigator will handle transition to Main on auth success
      }
    } catch (err: any) {
      if (err.response?.status === 402) {
        navigation.navigate('Renewal');
        return;
      }
      Alert.alert('Error', err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <Input
        label="Email"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <Input
        label="Password"
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
        placeholder="••••••••"
        secureTextEntry
        error={errors.password}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={styles.forgotPassword}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <Button onPress={handleSubmit} loading={loading} fullWidth size="lg">
        Sign In
      </Button>

      {allowRegister ? (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Pricing')}>
            <Text style={styles.footerLink}>Create one</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Access is by invitation. </Text>
          <TouchableOpacity onPress={() => navigation.navigate('GetAccess')}>
            <Text style={styles.footerLink}>Request access</Text>
          </TouchableOpacity>
        </View>
      )}
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    color: colors.primary[500],
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    color: colors.gray[500],
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary[500],
    fontSize: 14,
    fontWeight: '600',
  },
});