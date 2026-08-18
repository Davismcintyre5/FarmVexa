import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Logo from '../../components/ui/Logo';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing } from '../../theme';
import { getCountyOptions, getConstituencyOptions } from '../../utils/counties';
import { Plan } from '../../types';

interface Option {
  value: string;
  label: string;
}

export default function Register() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const planParam = route.params?.plan || '';
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [countyOptions, setCountyOptions] = useState<Option[]>([]);
  const [constituencyOptions, setConstituencyOptions] = useState<Option[]>([]);
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
    const counties = getCountyOptions();
    setCountyOptions(counties);

    publicApi.getPublicSettings()
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
          navigation.navigate('GetAccess');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [planParam]);

  const handleCountyChange = (countyName: string) => {
    setForm({ ...form, county: countyName, subCounty: '' });
    const constituencies = getConstituencyOptions(countyName);
    setConstituencyOptions(constituencies);
  };

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
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

    const registrationData = {
      ...form,
      confirmPassword: undefined,
      selectedPlan: {
        id: selectedPlan._id,
        name: selectedPlan.name,
        price: selectedPlan.price,
        interval: selectedPlan.interval,
      },
    };

    AsyncStorage.setItem('registrationData', JSON.stringify(registrationData));
    navigation.navigate('Checkout');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="lg" />
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
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Logo size="sm" />
        </View>

        <Text style={styles.title}>Register</Text>

        {selectedPlan && (
          <Card style={styles.planSummary}>
            <View style={styles.planSummaryRow}>
              <View style={styles.planSummaryInfo}>
                <Text style={styles.planSummaryLabel}>Selected Plan</Text>
                <Text style={styles.planSummaryName}>{selectedPlan.name}</Text>
              </View>
              <View style={styles.planSummaryPrice}>
                <Text style={styles.planSummaryAmount}>KES {selectedPlan.price}</Text>
                <Text style={styles.planSummaryInterval}>
                  {selectedPlan.interval === 'monthly' ? 'per month' : 'one-time'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Pricing')}>
              <Text style={styles.changePlanText}>Change plan</Text>
            </TouchableOpacity>
          </Card>
        )}

        {!selectedPlan && plans.length > 0 && (
          <Card style={styles.planSummary}>
            <Text style={styles.planSummaryLabel}>Select a Plan</Text>
            <View style={styles.planList}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan._id || plan.name}
                  style={[
                    styles.planOption,
                    selectedPlan?.name === plan.name && styles.planOptionSelected,
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                >
                  <View style={styles.planOptionInfo}>
                    <Text style={styles.planOptionName}>{plan.name}</Text>
                    <Text style={styles.planOptionFeatures}>
                      {plan.features?.length || 0} features · {plan.maxFarms} farm{plan.maxFarms !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.planOptionPriceBox}>
                    <Text style={styles.planOptionPrice}>KES {plan.price}</Text>
                    <Text style={styles.planOptionInterval}>
                      {plan.interval === 'monthly' ? '/month' : ' one-time'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Your Details</Text>
          
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
            autoCorrect={false}
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
            options={countyOptions}
            placeholder="Select County"
          />
          
          <Select
            label="Sub-County / Constituency *"
            value={form.subCounty}
            onChange={(value) => handleChange('subCounty', value)}
            options={constituencyOptions}
            placeholder={form.county ? 'Select Constituency' : 'Select County First'}
          />

          <Button
            onPress={handleSubmit}
            fullWidth
            size="lg"
          >
            Continue to Checkout →
          </Button>

          <Text style={styles.note}>
            Your account is not created yet. You'll complete registration at checkout.
          </Text>
        </Card>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  planSummary: {
    gap: spacing.sm,
  },
  planSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planSummaryInfo: {
    flex: 1,
  },
  planSummaryLabel: {
    fontSize: 14,
    color: colors.gray[500],
  },
  planSummaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  planSummaryPrice: {
    alignItems: 'flex-end',
  },
  planSummaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  planSummaryInterval: {
    fontSize: 12,
    color: colors.gray[400],
  },
  changePlanText: {
    fontSize: 14,
    color: colors.primary[500],
  },
  planList: {
    gap: spacing.sm,
  },
  planOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[200],
    gap: spacing.sm,
  },
  planOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  planOptionInfo: {
    flex: 1,
  },
  planOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  planOptionFeatures: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  planOptionPriceBox: {
    alignItems: 'flex-end',
  },
  planOptionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  planOptionInterval: {
    fontSize: 12,
    color: colors.gray[400],
  },
  formCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  note: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  loginLinkBold: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});