import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { planApi, publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Plan } from '../../types';

export default function Plans() {
  const navigation = useNavigation<any>();
  const { user, refresh } = useAuth();

  const [plansData, setPlansData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStkModal, setShowStkModal] = useState(false);
  const [upgradeInvoice, setUpgradeInvoice] = useState<any>(null);

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
    await refresh();
  };

  // When user taps "Upgrade", fetch a fresh invoice for that plan
  const handleUpgrade = async (plan: Plan) => {
    try {
      // Request an upgrade invoice — server creates invoice for prorated diff
      const res = await planApi.getPlans();
      const data = res.data.data || res.data;
      const target = data.plans?.find((p: Plan) => p.name === plan.name);

      if (!target) {
        // Fallback: use returned upgradeInvoice from plans response
        const invoice = data.upgradeInvoice || null;
        if (invoice) {
          setUpgradeInvoice(invoice);
          setShowStkModal(true);
        } else {
          setUpgradeInvoice({
            invoiceNumber: `UPG-${Date.now()}`,
            amountDue: target?.upgradeCost || plan.upgradeCost || 0,
            currency: 'KES',
          });
          setShowStkModal(true);
        }
        return;
      }

      // If server provides an invoice in the upgrade metadata, use it
      const invoice = data.upgradeInvoice || data.pendingUpgrade?.invoice || null;

      if (invoice) {
        setUpgradeInvoice(invoice);
        setShowStkModal(true);
      } else {
        // Server might not have created one yet — show message
        setUpgradeInvoice({
          invoiceNumber: data.pendingUpgrade?.invoiceNumber || `UPG-${Date.now()}`,
          amountDue: target.upgradeCost || 0,
          currency: 'KES',
        });
        setShowStkModal(true);
      }
    } catch (error) {
      // Silent fail
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
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
            Current:{' '}
            <Text style={styles.currentPlan}>{plansData.currentPlan}</Text>
          </Text>
        )}
      </View>

      {/* Pending upgrade banner */}
      {hasPendingUpgrade && (
        <Card style={styles.pendingCard}>
          <View style={styles.pendingHeader}>
            <Ionicons name="time" size={24} color={colors.yellow[600]} />
            <Text style={styles.pendingTitle}>Upgrade In Progress</Text>
          </View>
          <Text style={styles.pendingText}>
            {plansData.pendingUpgrade.oldPlan} →{' '}
            <Text style={styles.pendingBold}>
              {plansData.pendingUpgrade.newPlan}
            </Text>
          </Text>
          <Text style={styles.pendingDetail}>
            Amount: KES {plansData.pendingUpgrade.amount}
          </Text>
          <Text style={styles.pendingDetail}>
            Ref: {plansData.pendingUpgrade.paymentReference}
          </Text>
          <Text style={styles.pendingNote}>
            Admin is verifying your payment. You'll be notified when approved.
          </Text>
        </Card>
      )}

      {/* Plans list */}
      <View style={styles.plansList}>
        {plansData?.plans?.map((plan: Plan) => {
          const isPending =
            hasPendingUpgrade && plansData.pendingUpgrade.newPlan === plan.name;
          const allBlocked = hasPendingUpgrade;

          return (
            <Card
              key={plan.name}
              style={[
                styles.planCard,
                isPending && styles.pendingTargetCard,
                plan.status === 'current' && styles.currentCard,
                plan.status === 'upgrade_available' && styles.upgradeCard,
              ]}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.status === 'current' && (
                  <View style={[styles.badge, styles.badgeCurrent]}>
                    <Text style={styles.badgeCurrentText}>CURRENT</Text>
                  </View>
                )}
                {plan.status === 'upgrade_available' && !allBlocked && (
                  <View style={[styles.badge, styles.badgeUpgrade]}>
                    <Text style={styles.badgeUpgradeText}>UPGRADE</Text>
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

              {/* Upgrade cost */}
              {plan.status === 'upgrade_available' && !allBlocked && plan.upgradeCost && (
                <View style={styles.upgradeCostBox}>
                  <Text style={styles.upgradeCostLabel}>You pay today</Text>
                  <Text style={styles.upgradeCostValue}>
                    KES {plan.upgradeCost}
                  </Text>
                </View>
              )}

              {/* Features — from server */}
              {plan.features && plan.features.length > 0 && (
                <View style={styles.featuresList}>
                  {plan.features.map((feature: any, idx: number) => {
                    const label =
                      typeof feature === 'string'
                        ? feature.replace(/_/g, ' ')
                        : feature.label || feature.key?.replace(/_/g, ' ');
                    return (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons
                          name="checkmark-circle"
                          size={15}
                          color={colors.primary[500]}
                        />
                        <Text style={styles.featureText}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Action button */}
              <View style={styles.actionBox}>
                {isPending && (
                  <Button disabled fullWidth>
                    <Ionicons name="time" size={16} color={colors.yellow[700]} />
                    {'  '}In Progress
                  </Button>
                )}

                {!isPending &&
                  plan.status === 'current' &&
                  !allBlocked && (
                    <Button disabled variant="secondary" fullWidth>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.primary[600]}
                      />
                      {'  '}Current Plan
                    </Button>
                  )}

                {!isPending &&
                  plan.status === 'purchased' &&
                  !allBlocked && (
                    <Button disabled variant="secondary" fullWidth>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={colors.gray[500]}
                      />
                      {'  '}Purchased
                    </Button>
                  )}

                {!isPending &&
                  plan.status === 'upgrade_available' &&
                  !allBlocked && (
                    <Button
                      onPress={() => handleUpgrade(plan)}
                      fullWidth
                      size="lg"
                    >
                      <Ionicons
                        name="arrow-up-circle"
                        size={16}
                        color={colors.white}
                      />
                      {'  '}Upgrade — KES {plan.upgradeCost}
                    </Button>
                  )}

                {allBlocked && !isPending && plan.status === 'upgrade_available' && (
                  <Button disabled variant="secondary" fullWidth>
                    <Ionicons name="time" size={16} color={colors.gray[500]} />
                    {'  '}Blocked
                  </Button>
                )}

                {allBlocked && plan.status === 'current' && (
                  <Button disabled variant="secondary" fullWidth>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.primary[600]}
                    />
                    {'  '}Current
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

      {/* STK Modal for upgrade */}
      {upgradeInvoice && (
        <PayWithMpesaModal
          open={showStkModal}
          onClose={() => setShowStkModal(false)}
          invoiceNumber={upgradeInvoice.invoiceNumber}
          amount={upgradeInvoice.amountDue}
          currency={upgradeInvoice.currency || 'KES'}
          defaultPhone={user?.phone || ''}
          onSuccess={async () => {
            setShowStkModal(false);
            await loadPlans();
            await refresh();
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  centerContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  header: { alignItems: 'center', gap: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.gray[900] },
  subtitle: { fontSize: 14, color: colors.gray[500] },
  currentPlan: { fontWeight: 'bold', color: colors.primary[600] },
  pendingCard: {
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.yellow[300],
    backgroundColor: colors.yellow[50],
  },
  pendingHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pendingTitle: { fontSize: 16, fontWeight: 'bold', color: colors.yellow[700] },
  pendingText: { fontSize: 14, color: colors.yellow[700] },
  pendingBold: { fontWeight: 'bold' },
  pendingDetail: { fontSize: 12, color: colors.yellow[600] },
  pendingNote: { fontSize: 12, color: colors.yellow[600], marginTop: spacing.xs },
  plansList: { gap: spacing.md },
  planCard: { gap: spacing.md },
  pendingTargetCard: { borderWidth: 2, borderColor: colors.yellow[400] },
  currentCard: { borderWidth: 2, borderColor: colors.primary[500] },
  upgradeCard: { borderWidth: 2, borderColor: colors.blue[400] },
  planHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  planName: { fontSize: 18, fontWeight: 'bold', color: colors.gray[900] },
  badge: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  badgeCurrent: { backgroundColor: colors.primary[100] },
  badgeCurrentText: { fontSize: 10, fontWeight: 'bold', color: colors.primary[700] },
  badgeUpgrade: { backgroundColor: colors.blue[100] },
  badgeUpgradeText: { fontSize: 10, fontWeight: 'bold', color: colors.blue[700] },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  currency: { fontSize: 16, fontWeight: '500', color: colors.primary[600] },
  price: { fontSize: 32, fontWeight: 'bold', color: colors.primary[600] },
  interval: { fontSize: 13, color: colors.gray[500] },
  upgradeCostBox: {
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.blue[50],
    borderRadius: borderRadius.md,
  },
  upgradeCostLabel: { fontSize: 11, color: colors.gray[500], textTransform: 'uppercase' },
  upgradeCostValue: { fontSize: 20, fontWeight: 'bold', color: colors.blue[600] },
  featuresList: { gap: spacing.xs },
  featureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  featureText: {
    flex: 1, fontSize: 13, color: colors.gray[700], lineHeight: 18,
    textTransform: 'capitalize',
  },
  actionBox: { marginTop: spacing.xs },
});