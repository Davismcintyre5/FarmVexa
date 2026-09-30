import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getInvoice, Invoice as InvoiceType } from '../../api/invoices';
import { publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import Logo from '../../components/ui/Logo';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function Invoice() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const invoiceNumber = route.params?.invoiceNumber;

  const [invoice, setInvoice] = useState<InvoiceType | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStkModal, setShowStkModal] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (!invoiceNumber) {
      setError('No invoice number provided');
      setLoading(false);
      return;
    }
    loadInvoice();
    publicApi
      .getPublicSettings()
      .then((res) => setSettings(res.data?.data || {}))
      .catch(() => setSettings({}));
  }, [invoiceNumber]);

  const loadInvoice = async () => {
    try {
      setError(null);
      const data = await getInvoice(invoiceNumber);
      setInvoice(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invoice not found');
      setInvoice(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvoice();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={styles.loadingText}>Loading invoice...</Text>
      </View>
    );
  }

  if (error || !invoice) {
    return (
      <View style={styles.centerContainer}>
        <Logo size="md" />
        <Ionicons name="document-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.errorTitle}>Invoice Not Found</Text>
        <Text style={styles.errorText}>
          {error || 'We could not find the requested invoice.'}
        </Text>
        <Button onPress={() => navigation.navigate('Login')} variant="outline">
          Back to Login
        </Button>
      </View>
    );
  }

  const isPaid = invoice.status === 'paid';
  const hasStk = hasStkInstruction(invoice);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.brandHeader}>
        <Logo size="sm" showTagline />
      </View>

      {/* Invoice Card */}
      <Card style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Invoice</Text>
          <View
            style={[
              styles.statusBadge,
              isPaid ? styles.statusPaid : styles.statusUnpaid,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPaid ? styles.statusTextPaid : styles.statusTextUnpaid,
              ]}
            >
              {invoice.status?.toUpperCase() || 'UNPAID'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Invoice #</Text>
          <Text style={styles.rowValue} selectable>
            {invoice.invoiceNumber}
          </Text>
        </View>

        {/* Line items */}
        {invoice.lineItems?.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text style={styles.rowLabel}>
              {item.description} × {item.quantity}
            </Text>
            <Text style={styles.rowValue}>
              {invoice.currency} {Number(item.amount).toLocaleString()}
            </Text>
          </View>
        ))}

        {typeof invoice.subtotal === 'number' && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Subtotal</Text>
            <Text style={styles.rowValue}>
              {invoice.currency} {Number(invoice.subtotal).toLocaleString()}
            </Text>
          </View>
        )}
        {invoice.discount ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Discount</Text>
            <Text style={[styles.rowValue, { color: colors.primary[600] }]}>
              - {invoice.currency} {Number(invoice.discount).toLocaleString()}
            </Text>
          </View>
        ) : null}
        {invoice.tax ? (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Tax</Text>
            <Text style={styles.rowValue}>
              {invoice.currency} {Number(invoice.tax).toLocaleString()}
            </Text>
          </View>
        ) : null}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {isPaid ? 'Total Paid' : 'Amount Due'}
          </Text>
          <Text style={styles.totalValue}>
            {invoice.currency}{' '}
            {Number(
              isPaid ? invoice.amountPaid || invoice.total : invoice.amountDue
            ).toLocaleString()}
          </Text>
        </View>

        {invoice.dueDate && !isPaid && (
          <Text style={styles.dueDate}>
            Due: {formatDate(invoice.dueDate, 'date')}
          </Text>
        )}
        {isPaid && invoice.paidAt && (
          <Text style={[styles.dueDate, { color: colors.primary[600] }]}>
            Paid: {formatDate(invoice.paidAt)}
          </Text>
        )}
      </Card>

      {/* Pay CTA */}
      {!isPaid && hasStk && (
        <Button
          onPress={() => setShowStkModal(true)}
          fullWidth
          size="lg"
        >
          <Ionicons name="phone-portrait" size={20} color={colors.white} />
          {'  '}Pay with M-Pesa
        </Button>
      )}

      {isPaid && (
        <Card style={[styles.card, styles.paidCard]}>
          <View style={styles.paidRow}>
            <Ionicons name="checkmark-circle" size={28} color={colors.primary[600]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.paidTitle}>Payment Confirmed</Text>
              {invoice.paymentRef && (
                <Text style={styles.paidRef}>
                  Ref: {invoice.paymentRef}
                </Text>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Manual Instructions */}
      {!isPaid && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Other Payment Methods</Text>
          <PaymentInstructions
            instructions={invoice.paymentInstructions}
            hideStk={hasStk}
          />
        </Card>
      )}

      {/* Support Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Questions? Contact support
        </Text>
        {settings.supportEmail && (
          <Text style={styles.footerLink}>{settings.supportEmail}</Text>
        )}
        {settings.supportPhone && (
          <Text style={styles.footerLink}>{settings.supportPhone}</Text>
        )}
      </View>

      {/* STK Modal */}
      <PayWithMpesaModal
        open={showStkModal}
        onClose={() => setShowStkModal(false)}
        invoiceNumber={invoice.invoiceNumber}
        amount={invoice.amountDue}
        currency={invoice.currency}
        onSuccess={async () => {
          setShowStkModal(false);
          await loadInvoice();
        }}
      />
    </ScrollView>
  );
}

function hasStkInstruction(invoice: any): boolean {
  if (!invoice?.paymentInstructions) return false;
  return invoice.paymentInstructions.some(
    (i: any) => i.code === 'mpesa_stk' || i.action?.type === 'stk'
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  centerContainer: {
    flex: 1, backgroundColor: colors.gray[50],
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, padding: spacing.xl,
  },
  loadingText: { fontSize: 14, color: colors.gray[500] },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900] },
  errorText: { fontSize: 14, color: colors.gray[500], textAlign: 'center' },
  brandHeader: { alignItems: 'center', paddingVertical: spacing.md },
  card: { gap: spacing.sm },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray[900] },
  statusBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusPaid: { backgroundColor: colors.primary[100] },
  statusUnpaid: { backgroundColor: colors.yellow[100] },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  statusTextPaid: { color: colors.primary[700] },
  statusTextUnpaid: { color: colors.yellow[700] },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 4,
  },
  rowLabel: { fontSize: 13, color: colors.gray[500], flex: 1 },
  rowValue: { fontSize: 14, color: colors.gray[900], fontWeight: '500' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: spacing.sm, marginTop: spacing.sm,
    borderTopWidth: 2, borderTopColor: colors.gray[200],
  },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: colors.gray[900] },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: colors.primary[600] },
  dueDate: { fontSize: 12, color: colors.gray[400], textAlign: 'right', marginTop: 4 },
  paidCard: { borderColor: colors.primary[200], backgroundColor: colors.primary[50] },
  paidRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  paidTitle: { fontSize: 15, fontWeight: 'bold', color: colors.primary[700] },
  paidRef: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  footer: { alignItems: 'center', paddingVertical: spacing.lg, gap: 4 },
  footerText: { fontSize: 12, color: colors.gray[400] },
  footerLink: { fontSize: 13, fontWeight: '600', color: colors.primary[500] },
});