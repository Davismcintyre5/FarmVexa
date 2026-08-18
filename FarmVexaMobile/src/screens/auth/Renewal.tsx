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
import { useNavigation } from '@react-navigation/native';
import { renewalApi, publicApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod, Subscription } from '../../types';

export default function Renewal() {
  const navigation = useNavigation<any>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [finalConfirm, setFinalConfirm] = useState(false);

  useEffect(() => {
    loadSubscription();
    loadPaymentMethods();
  }, []);

  const loadSubscription = async () => {
    try {
      const res = await renewalApi.getSubscription();
      setSubscription(res.data.data || res.data);
    } catch (err: any) {
      console.error('Subscription fetch error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      setPaymentMethods(res.data.data?.paymentMethods || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

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

  const renderInstructions = (method: PaymentMethod) => {
    const amount = subscription?.planPrice || 500;
    const details = method.details || {};

    switch (method.type) {
      case 'mpesa_send_money':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to M-PESA on your Safaricom line</Text>
            <Text style={styles.instructionText}>2. Select Send Money</Text>
            <Text style={styles.instructionText}>3. Enter number: {details.phoneNumber}</Text>
            <Text style={styles.instructionText}>4. Enter amount: KES {amount}</Text>
            <Text style={styles.instructionText}>5. Enter your M-PESA PIN</Text>
            <Text style={styles.instructionText}>6. Come back and confirm you have paid</Text>
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
            <Text style={styles.instructionText}>7. Come back and confirm</Text>
          </View>
        );
      case 'mpesa_paybill':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to M-PESA</Text>
            <Text style={styles.instructionText}>2. Select Lipa na M-PESA</Text>
            <Text style={styles.instructionText}>3. Select Pay Bill</Text>
            <Text style={styles.instructionText}>4. Enter Business Number: {details.paybill}</Text>
            <Text style={styles.instructionText}>5. Enter Account Number: {details.accountNumber}</Text>
            <Text style={styles.instructionText}>6. Enter amount: KES {amount}</Text>
            <Text style={styles.instructionText}>7. Enter your M-PESA PIN</Text>
            <Text style={styles.instructionText}>8. Come back and confirm</Text>
          </View>
        );
      case 'bank':
        return (
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>1. Go to your bank app or branch</Text>
            <Text style={styles.instructionText}>2. Transfer to: {details.bankName}</Text>
            <Text style={styles.instructionText}>3. Account: {details.accountNumber}</Text>
            <Text style={styles.instructionText}>4. Amount: KES {amount}</Text>
            <Text style={styles.instructionText}>5. Note the reference</Text>
            <Text style={styles.instructionText}>6. Come back and confirm</Text>
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
      await renewalApi.submitRenewal({
        paymentMethod: selectedMethod.type,
        paymentReference,
        amount: subscription?.planPrice || 500,
      });
      Alert.alert('Success', 'Renewal submitted! Awaiting approval.', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Renewal failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading subscription...</Text>
      </View>
    );
  }

  // State 1: Pending Renewal
  if (subscription?.pendingRenewal) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.centerContent}>
            <Ionicons name="time-outline" size={64} color={colors.yellow[500]} />
            <Text style={styles.stateTitle}>Renewal Under Review</Text>
            <Text style={styles.stateText}>Admin is verifying your payment.</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>
                Submitted: {new Date(subscription.pendingRenewal.submittedAt).toLocaleString('en-KE')}
              </Text>
              <Text style={styles.detailText}>
                Reference: {subscription.pendingRenewal.reference}
              </Text>
              <Text style={styles.detailText}>
                Amount: KES {subscription.pendingRenewal.amount}
              </Text>
              <Text style={styles.detailText}>
                Method: {methodLabels[subscription.pendingRenewal.paymentMethod] || 'N/A'}
              </Text>
            </View>
            <Text style={styles.noteText}>You'll receive an email when approved.</Text>
          </View>
        </Card>
      </View>
    );
  }

  // State 2: Active
  if (subscription?.subscriptionStatus === 'active' && !subscription?.isExpired) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.centerContent}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
            <Text style={styles.stateTitle}>You're All Set!</Text>
            <Text style={styles.stateText}>Your subscription is active.</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>Plan: {subscription.plan}</Text>
              {subscription.subscriptionExpiry && (
                <Text style={styles.detailText}>
                  Expires: {new Date(subscription.subscriptionExpiry).toLocaleDateString('en-KE')}
                </Text>
              )}
            </View>
            <Button onPress={() => navigation.navigate('Dashboard')} fullWidth>
              Go to Dashboard
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  // State 3: Lifetime
  if (!subscription?.subscriptionExpiry && subscription?.planInterval === 'one_time') {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.centerContent}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
            <Text style={styles.stateTitle}>Lifetime Plan</Text>
            <Text style={styles.stateText}>Your {subscription.plan} plan is lifetime.</Text>
            <Button onPress={() => navigation.navigate('Dashboard')} fullWidth>
              Go to Dashboard
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  // State 4: Expired - Show renewal form
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Renew Subscription</Text>

        <Card style={styles.card}>
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color={colors.red[500]} />
            <Text style={styles.warningText}>Your subscription has expired</Text>
          </View>
          <View style={styles.detailBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Plan</Text>
              <Text style={styles.value}>{subscription?.plan || 'Monthly'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.price}>KES {subscription?.planPrice || 500}/month</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Expired</Text>
              <Text style={styles.expiredText}>
                {subscription?.subscriptionExpiry
                  ? new Date(subscription.subscriptionExpiry).toLocaleDateString('en-KE')
                  : 'Today'}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.length === 0 ? (
            <Text style={styles.emptyText}>No payment methods available.</Text>
          ) : (
            <View style={styles.methodList}>
              {paymentMethods.map((method) => {
                const isSelected = selectedMethod?.id === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.methodButton,
                      isSelected && styles.methodButtonSelected,
                    ]}
                    onPress={() => setSelectedMethod(method)}
                  >
                    <Ionicons
                      name={methodIcons[method.type] || 'wallet-outline'}
                      size={20}
                      color={isSelected ? colors.primary[500] : colors.gray[400]}
                    />
                    <Text
                      style={[
                        styles.methodText,
                        isSelected && styles.methodTextSelected,
                      ]}
                    >
                      {methodLabels[method.type] || method.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>

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
                <Ionicons name="warning-outline" size={20} color={colors.yellow[600]} />
                <Text style={styles.warningText}>
                  Renewal requests without payment are auto-rejected within 3 hours.
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
                  I confirm I have paid KES {subscription?.planPrice || 500} via{' '}
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
                Confirm Payment & Renew
              </Button>
            </View>
          </Card>
        )}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  card: {
    marginBottom: spacing.sm,
  },
  centerContent: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  stateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  stateText: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
  detailBox: {
    width: '100%',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  noteText: {
    fontSize: 12,
    color: colors.gray[400],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 14,
    color: colors.gray[500],
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  expiredText: {
    fontSize: 14,
    color: colors.red[500],
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.red[50],
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 14,
    color: colors.red[600],
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.md,
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
    fontSize: 16,
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
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: 14,
    color: colors.gray[600],
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
});