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
import AuthFrame from '../../components/layout/AuthFrame';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '../../types';

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

  if (plans.length === 0) {
    return <EmptyState icon="pricetag-outline" title="No Plans Available" />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>
        All plans include AI crop scanning and farm management.
      </Text>

      <View style={styles.plansList}>
        {plans.map((plan) => (
          <Card key={plan._id || plan.name} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              {plan.interval === 'one_time' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>POPULAR</Text>
                </View>
              )}
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.currency}>KES </Text>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.interval}>
                {plan.interval === 'monthly' ? '/mo' : ' one-time'}
              </Text>
            </View>

            {/* Features from SERVER */}
            {plan.features && plan.features.length > 0 && (
              <View style={styles.featuresList}>
                {plan.features.map((feature: any, idx: number) => {
                  // Server may return string or {key, label}
                  const label = typeof feature === 'string'
                    ? feature.replace(/_/g, ' ')
                    : feature.label || feature.key?.replace(/_/g, ' ');
                  return (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} />
                      <Text style={styles.featureText}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <Button
              onPress={() => handlePlanSelect(plan.name.toLowerCase().replace(/\s+/g, '_'))}
              fullWidth
              size="lg"
            >
              {allowRegister ? 'Get Started' : 'Request Access'}
            </Button>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
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
  plansList: { gap: spacing.md },
  planCard: { gap: spacing.md },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: { fontSize: 18, fontWeight: 'bold', color: colors.gray[900] },
  popularBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
  },
  popularText: { fontSize: 10, fontWeight: 'bold', color: colors.primary[700] },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currency: { fontSize: 16, fontWeight: '500', color: colors.primary[600] },
  price: { fontSize: 32, fontWeight: 'bold', color: colors.primary[600] },
  interval: { fontSize: 13, color: colors.gray[500] },
  featuresList: { gap: spacing.xs },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 18,
    textTransform: 'capitalize',
  },
});