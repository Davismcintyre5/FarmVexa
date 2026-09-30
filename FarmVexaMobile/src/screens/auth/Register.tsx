import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authApi, publicApi } from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import AuthFrame from '../../components/layout/AuthFrame';
import { colors, spacing } from '../../theme';
import { getCountyOptions, getConstituencyOptions } from '../../utils/counties';
import { Plan } from '../../types';

export default function Register() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const planParam = route.params?.plan || '';

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [constituencyOptions, setConstituencyOptions] = useState<{value: string, label: string}[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    county: '',
    subCounty: '',
  });

  useEffect(() => {
    publicApi
      .getPublicSettings()
      .then((res) => {
        const data = res.data.data || {};
        setPlans(data.paymentModels || []);

        if (planParam) {
          const found = data.paymentModels?.find(
            (p: Plan) => p.name.toLowerCase().replace(/\s+/g, '_') === planParam
          );
          if (found) setSelectedPlan(found);
        }

        if (data.allowSelfRegistration === false) {
          navigation.replace('GetAccess');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [planParam]);

  const handleCountyChange = (county: string) => {
    setForm({ ...form, county, subCounty: '' });
    setConstituencyOptions(getConstituencyOptions(county));
  };

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      Alert.alert('Error', 'Valid email is required');
      return;
    }
    if (!form.phone || !/^(\+254|0)[17]\d{8}$/.test(form.phone)) {
      Alert.alert('Error', 'Valid Kenyan phone number is required');
      return;
    }
    if (!form.password || form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a plan');
      return;
    }
    if (!form.county) {
      Alert.alert('Error', 'Please select your county');
      return;
    }
    if (!form.subCounty) {
      Alert.alert('Error', 'Please select your sub-county/constituency');
      return;
    }

    setSubmitting(true);
    try {
      // Direct register call — server creates user + invoice + emails
      const res = await authApi.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
        county: form.county,
        subCounty: form.subCounty,
        plan: selectedPlan.name,
      });

      const data = res.data.data;
      const { user, token, invoice, scope } = data;

      // Store session
      const { login: _ } = useAuthStore.getState();
      // Use store directly to set state
      useAuthStore.setState({
        user,
        token,
        invoice: invoice || null,
        scope: scope || 'pending',
        isAuthenticated: true,
        isLoading: false,
      });

      // Persist
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      if (invoice) await AsyncStorage.setItem('invoice', JSON.stringify(invoice));
      if (scope) await AsyncStorage.setItem('scope', scope);

      // Navigate to Pending
      navigation.reset({ index: 0, routes: [{ name: 'Pending' }] });
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthFrame>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Select a plan and fill in your details</Text>

      {/* Plan selector */}
      {plans.length > 0 && (
        <View style={styles.planList}>
          <Text style={styles.sectionLabel}>Select a Plan</Text>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan._id || plan.name}
              style={[
                styles.planOption,
                selectedPlan?.name === plan.name && styles.planOptionSelected,
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planFeatures}>
                  {plan.features?.length || 0} features
                </Text>
              </View>
              <View style={styles.planPriceBox}>
                <Text style={styles.planPrice}>KES {plan.price}</Text>
                <Text style={styles.planInterval}>
                  {plan.interval === 'monthly' ? '/month' : ' one-time'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Form */}
      <Input
        label="Full Name *"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="Davix HDM"
        autoCapitalize="words"
      />
      <Input
        label="Email *"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
        placeholder="hdm@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Phone *"
        value={form.phone}
        onChangeText={(text) => handleChange('phone', text)}
        placeholder="+254 700 000 000"
        keyboardType="phone-pad"
      />
      <Input
        label="Password *"
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
        placeholder="Min 6 characters"
        secureTextEntry
      />
      <Input
        label="Confirm Password *"
        value={form.confirmPassword}
        onChangeText={(text) => handleChange('confirmPassword', text)}
        placeholder="Repeat password"
        secureTextEntry
      />
      <Select
        label="County *"
        value={form.county}
        onChange={handleCountyChange}
        options={getCountyOptions()}
        placeholder="Select County"
      />
      <Select
        label="Sub-County / Constituency *"
        value={form.subCounty}
        onChange={(value) => handleChange('subCounty', value)}
        options={constituencyOptions}
        placeholder={form.county ? 'Select Constituency' : 'Select County First'}
      />

      <Button onPress={handleSubmit} loading={submitting} fullWidth size="lg">
        Create Account
      </Button>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: colors.gray[500] },
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  planList: { gap: spacing.sm, marginBottom: spacing.md },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  planOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  planInfo: { flex: 1, gap: 2 },
  planName: { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  planFeatures: { fontSize: 11, color: colors.gray[500] },
  planPriceBox: { alignItems: 'flex-end' },
  planPrice: { fontSize: 14, fontWeight: 'bold', color: colors.primary[600] },
  planInterval: { fontSize: 10, color: colors.gray[400] },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  footerText: { color: colors.gray[500], fontSize: 14 },
  footerLink: { color: colors.primary[500], fontSize: 14, fontWeight: '600' },
});