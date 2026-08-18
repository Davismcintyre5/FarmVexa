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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod, Plan } from '../../types';

export default function Checkout() {
  const navigation = useNavigation<any>();
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [stkPhone, setStkPhone] = useState('');
  const [stkStatus, setStkStatus] = useState<string | null>(null);
  const [finalConfirm, setFinalConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    loadRegistrationData();
    loadPaymentMethods();
  }, []);

  const loadRegistrationData = async () => {
    try {
      const data = await AsyncStorage.getItem('registrationData');
      if (!data) {
        navigation.navigate('Register');
        return;
      }
      setRegistrationData(JSON.parse(data));
    } catch (error) {
      navigation.navigate('Register');
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      setPaymentMethods(res.data.data?.paymentMethods || []);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    } finally {
      setLoading(false);
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

  const isStk = selectedMethod?.type === 'mpesa_stk';

  const handleStkPush = async () => {
    if (!stkPhone) {
      Alert.alert('Error', 'Enter your M-Pesa phone number');
      return;
    }

    setSubmitting(true);
    setStkStatus('pending');

    try {
      const res = await publicApi.sendInquiry('stk-push', {
        phone: stkPhone,
        amount: registrationData?.selectedPlan?.price,
        plan: registrationData?.selectedPlan?.name,
        registrationData,
      });

      if (res.data?.success) {
        setStkStatus('success');
        Alert.alert('Success', 'Payment request sent! Check your phone.');
      } else {
        setStkStatus('failed');
        Alert.alert('Error', res.data?.message || 'Payment failed');
      }
    } catch (err: any) {
      setStkStatus('failed');
      Alert.alert('Error', err.response?.data?.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!finalConfirm) {
      Alert.alert('Error', 'Please confirm you have paid');
      return;
    }
    if (!paymentReference) {
      Alert.alert('Error', 'Enter payment reference or transaction ID');
      return;
    }

    setSubmitting(true);
    try {
      // Use axios directly for payment registration
      const { default: api } = await import('../../api/axios');
      await api.post('/public/payment/register', {
        ...registrationData,
        password: registrationData.password,
        plan: registrationData.selectedPlan.name,
        paymentMethod: selectedMethod?.type,
        paymentReference,
        amount: registrationData.selectedPlan.price,
        interval: registrationData.selectedPlan.interval,
      });

      await AsyncStorage.removeItem('registrationData');
      setShowSuccess(true);

      let seconds = 5;
      setCountdown(seconds);
      const interval = setInterval(() => {
        seconds -= 1;
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(interval);
          navigation.navigate('Login');
        }
      }, 1000);

    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInstructions = (method: PaymentMethod) => {
    const amount = registrationData?.selectedPlan?.price;
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
            <Text style={styles.instructionText}>1. Go to your bank app or visit any branch</Text>
            <Text style={styles.instructionText}>2. Transfer to Bank: {details.bankName}</Text>
            <Text style={styles.instructionText}>3. Account Name: {details.accountName}</Text>
            <Text style={styles.instructionText}>4. Account Number: {details.accountNumber}</Text>
            <Text style={styles.instructionText}>5. Amount: KES {amount}</Text>
            <Text style={styles.instructionText}>6. Note the transaction reference</Text>
            <Text style={styles.instructionText}>7. Come back and confirm</Text>
          </View>
        );
      default:
        return <Text style={styles.instructionText}>Follow the payment instructions provided.</Text>;
    }
  };

  if (loading || !registrationData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading checkout...</Text>
      </View>
    );
  }

  const { selectedPlan, name, email, phone, county, subCounty } = registrationData;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Checkout</Text>

        {/* Plan Summary */}
        <Card style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>Plan</Text>
              <Text style={styles.value}>{selectedPlan?.name}</Text>
            </View>
            <View style={styles.rightAlign}>
              <Text style={styles.price}>KES {selectedPlan?.price}</Text>
              <Text style={styles.label}>
                {selectedPlan?.interval === 'monthly' ? 'per month' : 'one-time'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.detailText}>👤 {name}</Text>
          <Text style={styles.detailText}>📧 {email}</Text>
          <Text style={styles.detailText}>📱 {phone}</Text>
          <Text style={styles.detailText}>📍 {county}, {subCounty}</Text>
        </Card>

        {/* Payment Methods */}
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

        {/* Method Instructions */}
        {selectedMethod && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>
              {methodLabels[selectedMethod.type]} Instructions
            </Text>

            {isStk ? (
              <View style={styles.stkContainer}>
                <Text style={styles.stkText}>
                  Enter your M-Pesa phone number. You'll receive a prompt to authorize payment.
                </Text>
                <Input
                  label="M-Pesa Phone Number"
                  value={stkPhone}
                  onChangeText={setStkPhone}
                  placeholder="+254 700 000 000"
                  keyboardType="phone-pad"
                />
                <Button
                  onPress={handleStkPush}
                  loading={submitting}
                  fullWidth
                  size="lg"
                >
                  {stkStatus === 'pending' ? 'Sending request...' : `Pay KES ${selectedPlan?.price}`}
                </Button>
                {stkStatus === 'success' && (
                  <Text style={styles.successText}>
                    ✅ Check your phone and enter your M-PESA PIN to complete payment.
                  </Text>
                )}
                {stkStatus === 'failed' && (
                  <Text style={styles.errorText}>Payment failed. Try again.</Text>
                )}
              </View>
            ) : (
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
                    Registrations without verified payment are auto-rejected within 3 hours.
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
                    I confirm I have paid KES {selectedPlan?.price} via{' '}
                    {methodLabels[selectedMethod.type]}
                  </Text>
                </TouchableOpacity>

                <Button
                  onPress={handleManualSubmit}
                  loading={submitting}
                  fullWidth
                  size="lg"
                  disabled={!finalConfirm || !paymentReference}
                >
                  Confirm Payment & Submit
                </Button>
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Success Overlay */}
      {showSuccess && (
        <View style={styles.overlay}>
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
            <Text style={styles.successTitle}>Registration Submitted!</Text>
            <Text style={styles.successMessage}>
              Your account is now under review. Admin will verify your payment and approve within 24 hours.
            </Text>
            <Text style={styles.countdownText}>
              Redirecting to login in {countdown} seconds...
            </Text>
            <Button onPress={() => navigation.navigate('Login')} fullWidth>
              Go to Login Now
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rightAlign: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 14,
    color: colors.gray[500],
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.md,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 4,
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
  stkContainer: {
    gap: spacing.md,
  },
  stkText: {
    fontSize: 14,
    color: colors.gray[500],
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
  successText: {
    fontSize: 14,
    color: colors.primary[600],
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.red[500],
    textAlign: 'center',
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
    width: '100%',
    maxWidth: 400,
    gap: spacing.md,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  successMessage: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: colors.blue[600],
    fontWeight: '600',
  },
});