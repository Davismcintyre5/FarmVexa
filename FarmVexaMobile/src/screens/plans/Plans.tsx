import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { planApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';
import { Plan } from '../../types';

const planIcons: Record<string, string> = {
  'Basic Monthly': '🌱',
  'Basic': '🌱',
  'Pro': '🚀',
  'Full Suite': '💎',
};

export default function Plans() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [plansData, setPlansData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await planApi.getPlans();
      setPlansData(res.data.data || res.data);
    } catch (error) {
      setPlansData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
  };

  const handleUpgrade = (plan: Plan) => {
    navigation.navigate('UpgradeCheckout', {
      planName: plan.name.toLowerCase().replace(/\s+/g, '_'),
    });
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  const hasPendingUpgrade = !!plansData?.pendingUpgrade;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Plans & Upgrades</Text>
        {plansData?.currentPlan && (
          <Text style={styles.subtitle}>
            Current Plan:{' '}
            <Text style={styles.currentPlan}>{plansData.currentPlan}</Text>
          </Text>
        )}
      </View>

      {/* Pending Upgrade Banner */}
      {hasPendingUpgrade && (
        <Card style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Ionicons name="time" size={24} color={colors.yellow[600]} />
            <Text style={styles.pendingTitle}>⏳ Upgrade In Progress</Text>
          </View>
          <Text style={styles.pendingText}>
            {plansData.pendingUpgrade.oldPlan} →{' '}
            <Text style={styles.pendingBold}>{plansData.pendingUpgrade.newPlan}</Text>
          </Text>
          <View style={styles.pendingDetails}>
            <Text style={styles.pendingDetail}>
              Amount: KES {plansData.pendingUpgrade.amount}
            </Text>
            <Text style={styles.pendingDetail}>
              Reference: {plansData.pendingUpgrade.paymentReference}
            </Text>
            <Text style={styles.pendingDetail}>
              Submitted: {formatDate(plansData.pendingUpgrade.submittedAt)}
            </Text>
          </View>
          <Text style={styles.pendingNote}>
            Admin is verifying your payment. You'll receive an email when approved.
          </Text>
        </Card>
      )}

      {/* Plans Grid */}
      <View style={styles.plansGrid}>
        {plansData?.plans?.map((plan: Plan) => {
          const isPendingTarget =
            hasPendingUpgrade && plansData.pendingUpgrade.newPlan === plan.name;
          const allBlocked = hasPendingUpgrade;

          return (
            <Card
              key={plan.name}
              style={[
                styles.planCard,
                isPendingTarget && styles.pendingTargetCard,
                plan.status === 'current' && styles.currentCard,
                plan.status === 'upgrade_available' && styles.upgradeCard,
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planIcon}>
                  {planIcons[plan.name] || '🌾'}
                </Text>
                <Text style={styles.planName}>{plan.name}</Text>
              </View>

              <View style={styles.planPriceBox}>
                <Text style={styles.planPrice}>
                  <Text style={styles.currency}>KES </Text>
                  {plan.price}
                </Text>
                <Text style={styles.planInterval}>
                  {plan.interval === 'monthly' ? 'per month' : 'one-time'}
                </Text>
              </View>

              {/* Upgrade Cost */}
              {plan.status === 'upgrade_available' && !allBlocked && (
                <View style={styles.upgradeCostBox}>
                  <Text style={styles.upgradeCostLabel}>You pay</Text>
                  <Text style={styles.upgradeCostValue}>
                    KES {plan.upgradeCost}
                  </Text>
                </View>
              )}

              {/* Features */}
              <View style={styles.featuresList}>
                {plan.features?.slice(0, 6).map((feature: string, i: number) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark" size={14} color={colors.primary[600]} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <View style={styles.actionBox}>
                {isPendingTarget && (
                  <Button disabled fullWidth>
                    <Ionicons name="time" size={16} color={colors.yellow[700]} /> In Progress
                  </Button>
                )}

                {!isPendingTarget && plan.status === 'current' && !allBlocked && (
                  <Button disabled fullWidth variant="secondary">
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary[600]} /> Current
                  </Button>
                )}

                {!isPendingTarget && plan.status === 'purchased' && !allBlocked && (
                  <Button disabled fullWidth variant="secondary">
                    <Ionicons name="checkmark-circle" size={16} color={colors.gray[500]} /> Purchased
                  </Button>
                )}

                {!isPendingTarget && plan.status === 'upgrade_available' && !allBlocked && (
                  <Button
                    onPress={() => handleUpgrade(plan)}
                    fullWidth
                    size="lg"
                  >
                    <Ionicons name="arrow-up-circle" size={16} color={colors.white} /> Upgrade — KES {plan.upgradeCost}
                  </Button>
                )}

                {allBlocked && !isPendingTarget && plan.status === 'upgrade_available' && (
                  <Button disabled fullWidth variant="secondary">
                    <Ionicons name="time" size={16} color={colors.gray[500]} /> Blocked
                  </Button>
                )}

                {allBlocked && plan.status === 'current' && (
                  <Button disabled fullWidth variant="secondary">
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary[600]} /> Current
                  </Button>
                )}

                {plan.status === 'available' && !allBlocked && (
                  <Button
                    onPress={() => navigation.navigate('GetAccess')}
                    fullWidth
                    size="lg"
                  >
                    Get Started
                  </Button>
                )}
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  currentPlan: {
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  pendingCard: {
    borderWidth: 2,
    borderColor: colors.yellow[300],
    backgroundColor: colors.yellow[50],
    gap: spacing.sm,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.yellow[700],
  },
  pendingText: {
    fontSize: 14,
    color: colors.yellow[700],
  },
  pendingBold: {
    fontWeight: 'bold',
  },
  pendingDetails: {
    gap: 2,
  },
  pendingDetail: {
    fontSize: 12,
    color: colors.yellow[600],
  },
  pendingNote: {
    fontSize: 12,
    color: colors.yellow[600],
  },
  plansGrid: {
    gap: spacing.md,
  },
  planCard: {
    gap: spacing.md,
  },
  pendingTargetCard: {
    borderWidth: 2,
    borderColor: colors.yellow[400],
  },
  currentCard: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  upgradeCard: {
    borderWidth: 2,
    borderColor: colors.blue[400],
  },
  planHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  planIcon: {
    fontSize: 48,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  planPriceBox: {
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  currency: {
    fontSize: 14,
  },
  planInterval: {
    fontSize: 12,
    color: colors.gray[400],
  },
  upgradeCostBox: {
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.blue[50],
    borderRadius: borderRadius.md,
  },
  upgradeCostLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  upgradeCostValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.blue[600],
  },
  featuresList: {
    gap: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  featureText: {
    flex: 1,
    fontSize: 12,
    color: colors.gray[600],
    lineHeight: 16,
  },
  actionBox: {
    marginTop: 'auto',
  },
});