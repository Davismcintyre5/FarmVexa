import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../ui/Button';
import { colors, spacing, borderRadius } from '../../theme';
import { payWithStk, checkMpesaStatus } from '../../api/invoices';

interface PayWithMpesaModalProps {
  open: boolean;
  onClose: () => void;
  invoiceNumber: string;
  amount?: number;
  currency?: string;
  defaultPhone?: string;
  onSuccess?: () => void;
}

const POLL_INTERVAL_MS = 3000;      // 3 seconds
const TIMEOUT_MS = 5 * 60 * 1000;   // 5 minutes

type Status = 'input' | 'pending' | 'success' | 'failed' | 'cancelled';

export default function PayWithMpesaModal({
  open,
  onClose,
  invoiceNumber,
  amount,
  currency = 'KES',
  defaultPhone = '',
  onSuccess,
}: PayWithMpesaModalProps) {
  const [phone, setPhone] = useState(defaultPhone);
  const [status, setStatus] = useState<Status>('input');
  const [message, setMessage] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_MS);

  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(0);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStatus('input');
      setMessage('');
      setReceipt(null);
      setCheckoutRequestId(null);
      setTimeLeft(TIMEOUT_MS);
      if (defaultPhone) setPhone(defaultPhone);
    } else {
      stopPolling();
    }
  }, [open]);

  // Cleanup
  useEffect(() => {
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  };

  const validatePhone = (value: string): boolean => {
    // Accept 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
    const cleaned = value.replace(/\s+/g, '');
    return /^(\+?254|0)[17]\d{8}$/.test(cleaned);
  };

  const normalizePhone = (value: string): string => {
    let cleaned = value.replace(/\s+/g, '').replace(/^\+/, '');
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    return cleaned;
  };

const handleStartStk = async () => {
  if (!phone.trim()) {
    Alert.alert('Error', 'Please enter your M-Pesa phone number');
    return;
  }
  if (!validatePhone(phone)) {
    Alert.alert('Error', 'Enter a valid Kenyan phone number (07XX or 01XX)');
    return;
  }

  const normalized = normalizePhone(phone);
  setStatus('pending');
  setMessage('Sending payment request to your phone...');

  try {
    const res = await payWithStk(invoiceNumber, normalized);
    setCheckoutRequestId(res.checkoutRequestId);
    setMessage(res.message || 'Check your phone and enter your M-Pesa PIN.');
    startedAt.current = Date.now();
    startCountdown();
    schedulePoll(res.checkoutRequestId);  // ← Fixed
  } catch (err: any) {
    setStatus('failed');
    setMessage(err.response?.data?.message || 'Failed to send STK push');
  }
};

  const startCountdown = () => {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    countdownTimer.current = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const remaining = TIMEOUT_MS - elapsed;
      if (remaining <= 0) {
        stopPolling();
        setStatus('failed');
        setMessage('Payment request timed out. Please try again.');
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
  };

  const schedulePoll = (id: string) => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    pollTimer.current = setTimeout(() => pollStatus(id), POLL_INTERVAL_MS);
  };

  const pollStatus = async (id: string) => {
    try {
      const res = await checkMpesaStatus(id);

      if (res.status === 'success') {
        stopPolling();
        setStatus('success');
        setReceipt(res.receipt || null);
        setMessage(`Payment received. ${currency} ${res.amountPaid || amount || ''} paid.`);
        if (onSuccess) onSuccess();
        return;
      }

      if (res.status === 'failed' || res.status === 'cancelled') {
        stopPolling();
        setStatus(res.status === 'cancelled' ? 'cancelled' : 'failed');
        setMessage('Payment was not completed. Please try again.');
        return;
      }

      // Still pending → check timeout
      const elapsed = Date.now() - startedAt.current;
      if (elapsed >= TIMEOUT_MS) {
        stopPolling();
        setStatus('failed');
        setMessage('Payment request timed out. Please try again.');
        return;
      }

      // Continue polling
      schedulePoll(id);
    } catch (err: any) {
      // Network error — retry
      if (startedAt.current && Date.now() - startedAt.current < TIMEOUT_MS) {
        schedulePoll(id);
      } else {
        stopPolling();
        setStatus('failed');
        setMessage('Failed to verify payment. Please check your invoice status.');
      }
    }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  const handleRetry = () => {
    setStatus('input');
    setMessage('');
    setReceipt(null);
    setCheckoutRequestId(null);
    setTimeLeft(TIMEOUT_MS);
  };

  const formatTime = (ms: number) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <RNModal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="phone-portrait" size={22} color={colors.primary[600]} />
              <Text style={styles.headerTitle}>Pay with M-Pesa</Text>
            </View>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.gray[500]} />
            </Pressable>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {/* Amount display */}
            {amount !== undefined && (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Amount to pay</Text>
                <Text style={styles.amountValue}>
                  {currency} {Number(amount).toLocaleString()}
                </Text>
                <Text style={styles.invoiceNumber}>Invoice: {invoiceNumber}</Text>
              </View>
            )}

            {/* INPUT state */}
            {status === 'input' && (
              <>
                <Text style={styles.label}>M-Pesa Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="07XX XXX XXX"
                  keyboardType="phone-pad"
                  maxLength={13}
                  editable
                />
                <Text style={styles.hint}>
                  You will receive a prompt on this number to enter your M-Pesa PIN.
                </Text>
                <Button onPress={handleStartStk} fullWidth size="lg">
                  Send Payment Request
                </Button>
              </>
            )}

            {/* PENDING state */}
            {status === 'pending' && (
              <View style={styles.pendingBox}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.pendingMessage}>{message}</Text>
                <View style={styles.timerBox}>
                  <Ionicons name="time" size={16} color={colors.gray[500]} />
                  <Text style={styles.timerText}>
                    Expires in {formatTime(timeLeft)}
                  </Text>
                </View>
                <Text style={styles.pendingHint}>
                  Keep this screen open. Do not close the app.
                </Text>
              </View>
            )}

            {/* SUCCESS state */}
            {status === 'success' && (
              <View style={styles.resultBox}>
                <Ionicons name="checkmark-circle" size={64} color={colors.primary[500]} />
                <Text style={styles.resultTitle}>Payment Successful</Text>
                <Text style={styles.resultMessage}>{message}</Text>
                {receipt && (
                  <View style={styles.receiptBox}>
                    <Text style={styles.receiptLabel}>M-Pesa Receipt</Text>
                    <Text style={styles.receiptValue}>{receipt}</Text>
                  </View>
                )}
                <Button onPress={handleClose} fullWidth size="lg">
                  Done
                </Button>
              </View>
            )}

            {/* FAILED state */}
            {status === 'failed' && (
              <View style={styles.resultBox}>
                <Ionicons name="alert-circle" size={64} color={colors.red[500]} />
                <Text style={[styles.resultTitle, { color: colors.red[600] }]}>
                  Payment Failed
                </Text>
                <Text style={styles.resultMessage}>{message || 'The payment was not completed.'}</Text>
                <View style={styles.actions}>
                  <Button variant="outline" onPress={handleClose} style={styles.flex1}>
                    Cancel
                  </Button>
                  <Button onPress={handleRetry} style={styles.flex1}>
                    Send Again
                  </Button>
                </View>
              </View>
            )}

            {/* CANCELLED state */}
            {status === 'cancelled' && (
              <View style={styles.resultBox}>
                <Ionicons name="close-circle" size={64} color={colors.orange[500]} />
                <Text style={[styles.resultTitle, { color: colors.orange[600] }]}>
                  Payment Cancelled
                </Text>
                <Text style={styles.resultMessage}>
                  You cancelled the payment request on your phone.
                </Text>
                <View style={styles.actions}>
                  <Button variant="outline" onPress={handleClose} style={styles.flex1}>
                    Close
                  </Button>
                  <Button onPress={handleRetry} style={styles.flex1}>
                    Try Again
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  amountBox: {
    alignItems: 'center',
    gap: 2,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  hint: {
    fontSize: 12,
    color: colors.gray[500],
    lineHeight: 18,
  },
  pendingBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  pendingMessage: {
    fontSize: 15,
    color: colors.gray[700],
    textAlign: 'center',
    lineHeight: 22,
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  timerText: {
    fontSize: 13,
    color: colors.gray[700],
    fontWeight: '500',
  },
  pendingHint: {
    fontSize: 12,
    color: colors.orange[600],
    fontWeight: '600',
    textAlign: 'center',
  },
  resultBox: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary[700],
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  receiptBox: {
    alignItems: 'center',
    gap: 2,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    alignSelf: 'stretch',
  },
  receiptLabel: {
    fontSize: 11,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  flex1: {
    flex: 1,
  },
});