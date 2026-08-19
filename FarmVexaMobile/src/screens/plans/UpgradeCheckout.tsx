import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { planApi, publicApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const methodIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  mpesa_stk: 'phone-portrait-outline',
  mpesa_send_money: 'paper-plane-outline',
  mpesa_till: 'storefront-outline',
  mpesa_paybill: 'receipt-outline',
  bank: 'business-outline',
  card: 'card-outline',
};

const methodLabels: Record<string, string> = {
  mpesa_stk: 'M-Pesa STK Push',
  mpesa_send_money: 'M-Pesa Send Money',
  mpesa_till: 'M-Pesa Till Number',
  mpesa_paybill: 'M-Pesa Paybill',
  bank: 'Bank Transfer',
  card: 'Card Payment',
};

export default function UpgradeCheckout() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { planName } = route.params;

  const [plansData, setPlansData] = useState<any>(null);
  const [targetPlan, setTargetPlan] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [finalConfirm, setFinalConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadData();
  }, [planName]);

  const loadData = async () => {
    try {
      const [plansRes, settingsRes] = await Promise.all([
        planApi.getPlans(),
        publicApi.getPublicSettings(),
      ]);

      const data = plansRes.data.data || plansRes.data;
      setPlansData(data);
      const plan = data.plans?.find(
        (p: any) => p.name.toLowerCase().replace(/\s+/g, '_') === planName
      );
      setTargetPlan(plan);
      setPaymentMethods(settingsRes.data.data?.paymentMethods || []);
    } catch (error) {
      setPlansData(null);
      setTargetPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const renderInstructions = (method: any) => {
    const amount = targetPlan?.upgradeCost || 0;
    const details = method.details || {};

    switch (method.type) {
      case 'mpesa_send_money':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to M-PESA</Text>
            <Text style={styles.instructionText}>2. Select Send Money</Text>
            <Text style={styles.instructionText}>3. Enter number: {details.phoneNumber}</Text>
            <Text style={styles.instructionText}>4. Enter amount: KES {amount}</Text>
            <Text style={styles.instructionText}>5. Enter your M-PESA PIN</Text>
            <Text style={styles.instructionText}>6. Come back and confirm</Text>
          </View>
        );
      case 'mpesa_till':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to M-PESA</Text>
            <Text style={styles.instructionText}>2. Select Lipa na M-PESA</Text>
            <Text style={styles.instructionText}>3. Select Buy Goods and Services</Text>
            <Text style={styles.instructionText}>4. Enter Till Number: {details.tillNumber}</Text>
            <Text style={styles.instructionText}>5. Enter amount: KES {amount}</Text>
            <Text style={styles.instructionText}>6. Enter your M-PESA PIN</Text>
          </View>
        );
      case 'mpesa_paybill':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to M-PESA</Text>
            <Text style={styles.instructionText}>2. Select Lipa na M-PESA</Text>
            <Text style={styles.instructionText}>3. Select Pay Bill</Text>
            <Text style={styles.instructionText}>4. Business Number: {details.paybill}</Text>
            <Text style={styles.instructionText}>5. Account Number: {details.accountNumber}</Text>
            <Text style={styles.instructionText}>6. Enter amount: KES {amount}</Text>
          </View>
        );
      case 'bank':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to your bank app or branch</Text>
            <Text style={styles.instructionText}>2. Transfer to: {details.bankName}</Text>
            <Text style={styles.instructionText}>3. Account: {details.accountNumber}</Text>
            <Text style={styles.instructionText}>4. Amount: KES {amount}</Text>
          </View>
        );
      default:
        return <Text style={styles.instructionText}>Follow the payment instructions.</Text>;
    }
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Select a payment method');
      return;
    }
    if (!finalConfirm) {
      Alert.alert('Error', 'Please confirm you have paid');
      return;
    }
    if (!paymentReference) {
      Alert.alert('Error', 'Enter payment reference');
      return;
    }

    setSubmitting(true);
    try {
      await planApi.submitUpgrade({
        newPlan: targetPlan.name,
        paymentMethod: selectedMethod.type,
        paymentReference,
        amount: targetPlan.upgradeCost,
      });

      setShowSuccess(true);
      let seconds = 5;
      setCountdown(seconds);
      const interval = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(interval);
          navigation.navigate('Plans');
        }
      }, 1000);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Upgrade failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!targetPlan || targetPlan.status !== 'upgrade_available') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="warning" size={64} color={colors.yellow[500]} />
        <Text style={styles.notAvailableTitle}>Upgrade Not Available</Text>
        <Text style={styles.notAvailableText}>
          This plan is not available for upgrade.
        </Text>
        <Button onPress={() => navigation.goBack()} variant="outline">
          Back to Plans
        </Button>
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
      >
        <Text style={styles.title}>⬆️ Upgrade Checkout</Text>

        {/* Upgrade Summary */}
        <Card style={styles.card}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Current Plan</Text>
              <Text style={styles.summaryValue}>{plansData?.currentPlan}</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color={colors.gray[400]} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>New Plan</Text>
              <Text style={styles.summaryValueNew}>{targetPlan.name}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Full Price</Text>
              <Text style={styles.priceOld}>KES {targetPlan.price}</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>You Pay</Text>
              <Text style={styles.priceNew}>KES {targetPlan.upgradeCost}</Text>
            </View>
          </View>
          <Text style={styles.priceNote}>Difference from current plan price</Text>
        </Card>

        {/* Payment Methods */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.length === 0 ? (
            <Text style={styles.emptyText}>No payment methods available.</Text>
          ) : (
            <View style={styles.methodList}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodButton,
                    selectedMethod?.id === method.id && styles.methodButtonSelected,
                  ]}
                  onPress={() => setSelectedMethod(method)}
                >
                  <Ionicons
                    name={methodIcons[method.type] || 'wallet-outline'}
                    size={20}
                    color={selectedMethod?.id === method.id ? colors.primary[500] : colors.gray[400]}
                  />
                  <Text
                    style={[
                      styles.methodText,
                      selectedMethod?.id === method.id && styles.methodTextSelected,
                    ]}
                  >
                    {methodLabels[method.type] || method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Instructions & Payment */}
        {selectedMethod && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>
              {methodLabels[selectedMethod.type]} Instructions
            </Text>
            <View style={styles.manualContainer}>
              {renderInstructions(selectedMethod)}

              <Input
                label="Payment Reference / Transaction ID"
                value={paymentReference}
                onChangeText={setPaymentReference}
                placeholder="e.g., QWERTY123"
              />

              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color={colors.yellow[600]} />
                <Text style={styles.warningText}>
                  Upgrade requests without payment are auto-rejected within 3 hours.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFinalConfirm(!finalConfirm)}
              >
                <Ionicons
                  name={finalConfirm ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={finalConfirm ? colors.primary[500] : colors.gray[400]}
                />
                <Text style={styles.checkboxText}>
                  I confirm I have paid KES {targetPlan.upgradeCost} via{' '}
                  {methodLabels[selectedMethod.type]}
                </Text>
              </TouchableOpacity>

              <Button
                onPress={handleSubmit}
                loading={submitting}
                fullWidth
                size="lg"
                disabled={!finalConfirm || !paymentReference}
              >
                Confirm Payment & Upgrade
              </Button>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Success Overlay */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
            <Text style={styles.successTitle}>Upgrade Submitted!</Text>
            <Text style={styles.successText}>
              Admin will verify your payment and approve within 24 hours.
            </Text>
            <Text style={styles.countdownText}>
              Redirecting to Plans in {countdown} seconds...
            </Text>
            <Button onPress={() => navigation.navigate('Plans')} fullWidth>
              Go to Plans Now
            </Button>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  card: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  summaryValueNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  priceOld: {
    fontSize: 14,
    color: colors.gray[400],
    textDecorationLine: 'line-through',
  },
  priceNew: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  priceNote: {
    fontSize: 11,
    color: colors.gray[400],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  methodList: {
    gap: spacing.sm,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  methodButtonSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  methodText: {
    fontSize: 14,
    color: colors.gray[700],
  },
  methodTextSelected: {
    color: colors.primary[500],
    fontWeight: '600',
  },
  manualContainer: {
    gap: spacing.md,
  },
  instructions: {
    gap: spacing.xs,
  },
  instructionText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.yellow[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.yellow[100],
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.yellow[700],
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[600],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 400,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  successText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: colors.blue[600],
    fontWeight: '600',
  },
  notAvailableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  notAvailableText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});