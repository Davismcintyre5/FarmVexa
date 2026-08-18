import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '../../types';

const planIcons: Record<string, string> = {
  'Basic': '🌱',
  'Pro': '🚀',
  'Full Suite': '💎',
};

export default function Pricing() {
  const navigation = useNavigation<any>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allowRegister, setAllowRegister] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      const data = res.data?.data || res.data || {};
      setPlans(data.paymentModels || []);
      setAllowRegister(data.allowSelfRegistration ?? false);
    } catch (error) {
      setPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
  };

  const basicMonthly = plans.find((p) => p.name === 'Basic Monthly');
  const basicOneTime = plans.find((p) => p.name === 'Basic' && p.interval !== 'monthly');
  const otherPlans = plans.filter((p) => p.name === 'Pro' || p.name === 'Full Suite');
  const isPopular = (plan: Plan) => plan.name === 'Pro';

  const handlePlanSelect = (planName?: string) => {
    if (allowRegister) {
      navigation.navigate('Register', { plan: planName });
    } else {
      navigation.navigate('GetAccess');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Logo size="sm" />
        <Text style={styles.title}>🌾 FarmVexa Pricing</Text>
        <Text style={styles.subtitle}>Choose the plan that fits your farm</Text>
      </View>

      {/* BASIC CARD */}
      <Card style={styles.basicCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planIcon}>🌱</Text>
          <Text style={styles.planName}>Basic</Text>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceMonthly}>
            <Text style={styles.currency}>KES </Text>
            {basicMonthly?.price || 500}
          </Text>
          <Text style={styles.intervalText}>Monthly</Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Text style={styles.priceOneTime}>
            <Text style={styles.currency}>KES </Text>
            {basicOneTime?.price || 6000}
          </Text>
          <Text style={styles.intervalText}>one-time payment</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresList}>
          {(basicOneTime?.features || basicMonthly?.features || []).map((feature, i) => (
            <View key={i} style={styles.featureItem}>
              <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <Button
            onPress={() => handlePlanSelect('basic')}
            fullWidth
            size="lg"
          >
            Pay Once — KES {basicOneTime?.price || 6000}
          </Button>
          <Button
            onPress={() => handlePlanSelect('basic_monthly')}
            variant="outline"
            fullWidth
            size="lg"
          >
            Monthly — KES {basicMonthly?.price || 500}/mo
          </Button>
        </View>
      </Card>

      {/* PRO + FULL SUITE */}
      {otherPlans.map((plan) => (
        <Card
          key={plan._id || plan.name}
          style={[
            styles.planCard,
            isPopular(plan) && styles.popularCard,
          ]}
        >
          {isPopular(plan) && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
            </View>
          )}

          <View style={styles.planHeader}>
            <Text style={styles.planIcon}>{planIcons[plan.name] || '🌾'}</Text>
            <Text style={styles.planName}>{plan.name}</Text>
          </View>

          <View style={styles.priceSection}>
            <Text style={styles.priceOneTime}>
              <Text style={styles.currency}>KES </Text>
              {plan.price}
            </Text>
            <Text style={styles.intervalText}>one-time payment</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresList}>
            {(plan.features || []).map((feature, i) => (
              <View key={i} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <Button
            onPress={() => handlePlanSelect(plan.name.toLowerCase().replace(/\s+/g, '_'))}
            variant={isPopular(plan) ? 'primary' : 'secondary'}
            fullWidth
            size="lg"
          >
            {isPopular(plan) ? 'Get Pro' : `Get ${plan.name}`}
          </Button>
        </Card>
      ))}

      <Text style={styles.footerText}>
        All plans include free updates · No hidden fees · Cancel anytime
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[500],
  },
  basicCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  planCard: {
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  popularCard: {
    borderColor: colors.primary[500],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  planIcon: {
    fontSize: 48,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  priceSection: {
    alignItems: 'center',
    gap: 4,
  },
  priceMonthly: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  priceOneTime: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  currency: {
    fontSize: 16,
  },
  intervalText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[200],
  },
  dividerText: {
    fontSize: 12,
    color: colors.gray[400],
  },
  featuresList: {
    width: '100%',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  buttonGroup: {
    gap: spacing.sm,
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});