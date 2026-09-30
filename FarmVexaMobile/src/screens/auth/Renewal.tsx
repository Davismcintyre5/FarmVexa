import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { renewalApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function Renewal() {
  const navigation = useNavigation<any>();
  const { user, invoice, scope, refresh } = useAuth();

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStkModal, setShowStkModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await renewalApi.getSubscription();
      setSubscription(res.data.data || res.data);
    } catch (error) {
      setSubscription(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await refresh();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  // Pending renewal
  if (subscription?.pendingRenewal) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.centerContent}>
            <Ionicons name="time-outline" size={56} color={colors.yellow[500]} />
            <Text style={styles.stateTitle}>Renewal Under Review</Text>
            <Text style={styles.stateText}>
              Admin is verifying your payment. You'll be notified once approved.
            </Text>
          </View>
        </Card>
      </ScrollView>
    );
  }

  // Active subscription
  if (subscription?.subscriptionStatus === 'active' && !subscription?.isExpired) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.centerContent}>
            <Ionicons name="checkmark-circle" size={56} color={colors.primary[500]} />
            <Text style={styles.stateTitle}>Subscription Active</Text>
            <Text style={styles.stateText}>
              Plan: {subscription.plan}
            </Text>
            {subscription.subscriptionExpiry && (
              <Text style={styles.stateText}>
                Expires: {formatDate(subscription.subscriptionExpiry, 'date')}
              </Text>
            )}
            <Button onPress={() => navigation.navigate('Dashboard')} fullWidth>
              Go to Dashboard
            </Button>
          </View>
        </Card>
      </ScrollView>
    );
  }

  // Expired → show renewal with STK
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={24} color={colors.red[500]} />
          <Text style={styles.warningText}>Your subscription has expired</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Plan</Text>
          <Text style={styles.rowValue}>{subscription?.plan || '—'}</Text>
        </View>
        {subscription?.planPrice && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Amount</Text>
            <Text style={styles.rowValue}>
              KES {subscription.planPrice}
            </Text>
          </View>
        )}
      </Card>

      {invoice && (
        <Button onPress={() => setShowStkModal(true)} fullWidth size="lg">
          <Ionicons name="phone-portrait" size={20} color={colors.white} />
          {'  '}Pay with M-Pesa
        </Button>
      )}

      {invoice?.paymentInstructions && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Other Payment Methods</Text>
          <PaymentInstructions
            instructions={invoice.paymentInstructions}
            hideStk
          />
        </Card>
      )}

      {!invoice && (
        <Card style={styles.card}>
          <Text style={styles.stateText}>
            No active invoice. Please contact support to start your renewal.
          </Text>
        </Card>
      )}

      {invoice && (
        <PayWithMpesaModal
          open={showStkModal}
          onClose={() => setShowStkModal(false)}
          invoiceNumber={invoice.invoiceNumber}
          amount={invoice.amountDue}
          currency={invoice.currency}
          defaultPhone={user?.phone || ''}
          onSuccess={async () => {
            setShowStkModal(false);
            await refresh();
            await loadData();
          }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  card: { gap: spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray[900] },
  centerContent: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg },
  stateTitle: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900], textAlign: 'center' },
  stateText: { fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 20 },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.red[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red[600],
    flex: 1,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 13, color: colors.gray[500] },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
});