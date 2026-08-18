import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { validateLogin } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
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
    publicApi.getPublicSettings()
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
      if (user.approvalStatus === 'pending') {
        navigation.navigate('PendingApproval');
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size="lg" showTagline />
          <Text style={styles.subtitle}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="hdm@gmail.com"
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

          <Button
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
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
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  subtitle: {
    fontSize: 20,
    color: colors.gray[500],
  },
  form: {
    gap: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: colors.primary[500],
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
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