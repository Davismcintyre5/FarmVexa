import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { authApi, publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PayWithMpesaModal from '../../components/payment/PayWithMpesaModal';
import PaymentInstructions from '../../components/payment/PaymentInstructions';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds

export default function Pending() {
  const navigation = useNavigation<any>();
  const { user, invoice, scope, refresh, logout } = useAuth();

  const [showStkModal, setShowStkModal] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [refreshing, setRefreshing] = useState(false);

  // Load support contacts
  useEffect(() => {
    publicApi
      .getPublicSettings()
      .then((res) => setSettings(res.data?.data || {}))
      .catch(() => setSettings({}));
  }, []);

  // 30s poll — refresh /me
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  // Auto-navigate when scope changes
  useEffect(() => {
    if (scope === 'active') {
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    }
    // If not authenticated, RootNavigator will handle redirect to Login
  }, [scope]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCall = () => {
    if (settings.supportPhone) Linking.openURL(`tel:${settings.supportPhone}`);
  };
  const handleEmail = () => {
    if (settings.supportEmail) Linking.openURL(`mailto:${settings.supportEmail}`);
  };
  const handleWhatsApp = () => {
    if (settings.whatsappNumber) {
      const num = settings.whatsappNumber.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/${num}`);
    }
  };

  // ------------------- RENDER STATES -------------------

  const isPaid = invoice?.status === 'paid';
  const hasInvoice = !!invoice;
  const amountDue = invoice?.amountDue ?? 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name={isPaid ? 'checkmark-circle' : 'time-outline'}
            size={36}
            color={isPaid ? colors.primary[500] : colors.yellow[500]}
          />
        </View>
        <Text style={styles.title}>
          {isPaid ? 'Payment Received' : 'Account Pending Approval'}
        </Text>
        <Text style={styles.subtitle}>
          {user?.name ? `Hi ${user.name.split(' ')[0]}, ` : ''}
          {isPaid
            ? 'we are reviewing your account.'
            : 'complete your payment to speed up approval.'}
        </Text>
      </View>

      {/* ---------- STATE 1: UNPAID ---------- */}
      {hasInvoice && !isPaid && amountDue > 0 && (
        <>
          <Card style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Invoice Summary</Text>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>UNPAID</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Invoice #</Text>
              <Text style={styles.rowValue}>{invoice.invoiceNumber}</Text>
            </View>

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
              <Text style={styles.totalLabel}>Amount Due</Text>
              <Text style={styles.totalValue}>
                {invoice.currency} {Number(amountDue).toLocaleString()}
              </Text>
            </View>

            {invoice.dueDate && (
              <Text style={styles.dueDate}>
                Due: {formatDate(invoice.dueDate, 'date')}
              </Text>
            )}
          </Card>

          {/* Pay with M-Pesa CTA */}
          {hasStkInstruction(invoice) && (
            <Button
              onPress={() => setShowStkModal(true)}
              fullWidth
              size="lg"
            >
              <Ionicons name="phone-portrait" size={20} color={colors.white} />
              {'  '}Pay with M-Pesa
            </Button>
          )}

          {/* Manual instructions */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Other Payment Methods</Text>
            <PaymentInstructions
              instructions={invoice.paymentInstructions}
              hideStk
            />
          </Card>
        </>
      )}

      {/* ---------- STATE 2: PAID ---------- */}
      {hasInvoice && isPaid && (
        <>
          <Card style={[styles.card, styles.paidCard]}>
            <View style={styles.paidHeader}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.primary[500]}
              />
              <Text style={styles.paidTitle}>Payment Confirmed</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Invoice #</Text>
              <Text style={styles.rowValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Amount Paid</Text>
              <Text style={[styles.rowValue, { color: colors.primary[700] }]}>
                {invoice.currency}{' '}
                {Number(invoice.amountPaid || invoice.total).toLocaleString()}
              </Text>
            </View>
            {invoice.paymentMethod && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Method</Text>
                <Text style={styles.rowValue}>{invoice.paymentMethod}</Text>
              </View>
            )}
            {invoice.paymentRef && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Reference</Text>
                <Text style={styles.rowValue} selectable>
                  {invoice.paymentRef}
                </Text>
              </View>
            )}
            {invoice.paidAt && (
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Paid At</Text>
                <Text style={styles.rowValue}>
                  {formatDate(invoice.paidAt)}
                </Text>
              </View>
            )}
          </Card>

          {/* What happens next */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>What happens next</Text>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Admin verifies your payment (usually under 24 hours).
              </Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                You'll receive an email once your account is approved.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                This page will automatically redirect to your dashboard.
              </Text>
            </View>
          </Card>
        </>
      )}

      {/* ---------- STATE 3: NO INVOICE ---------- */}
      {!hasInvoice && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Waiting for setup</Text>
          <Text style={styles.noInvoiceText}>
            Your account has been created. An invoice will appear here shortly.
            If you do not see one after a few minutes, contact support.
          </Text>
        </Card>
      )}

      {/* Support Contacts */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Need help?</Text>
        <View style={styles.contactList}>
          {settings.supportPhone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <View style={[styles.contactIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="call" size={18} color={colors.primary[600]} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Call</Text>
                <Text style={styles.contactValue}>{settings.supportPhone}</Text>
              </View>
            </TouchableOpacity>
          )}

          {settings.supportEmail && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <View style={[styles.contactIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="mail" size={18} color={colors.blue[600]} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{settings.supportEmail}</Text>
              </View>
            </TouchableOpacity>
          )}

          {settings.showWhatsapp && settings.whatsappNumber && (
            <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
              <View style={[styles.contactIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>{settings.whatsappNumber}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <Button variant="outline" onPress={onRefresh} style={styles.flex1}>
          <Ionicons name="refresh" size={16} color={colors.primary[500]} />
          {'  '}Check Status
        </Button>
        <Button variant="ghost" onPress={handleLogout} style={styles.flex1}>
          Logout
        </Button>
      </View>

      {/* STK Modal */}
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
          }}
        />
      )}
    </ScrollView>
  );
}

// Helper — check if invoice has an STK instruction
function hasStkInstruction(invoice: any): boolean {
  if (!invoice?.paymentInstructions) return false;
  return invoice.paymentInstructions.some(
    (i: any) => i.code === 'mpesa_stk' || i.action?.type === 'stk'
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.gray[900], textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.gray[500], textAlign: 'center', paddingHorizontal: spacing.lg },
  card: { gap: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray[900] },
  pendingBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    backgroundColor: colors.yellow[100], borderRadius: borderRadius.full,
  },
  pendingBadgeText: { fontSize: 10, fontWeight: 'bold', color: colors.yellow[700] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
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
  paidHeader: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  paidTitle: { fontSize: 18, fontWeight: 'bold', color: colors.primary[700] },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: 6 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.primary[100], alignItems: 'center', justifyContent: 'center',
  },
  stepDotText: { fontSize: 12, fontWeight: 'bold', color: colors.primary[700] },
  stepText: { flex: 1, fontSize: 13, color: colors.gray[700], lineHeight: 19 },
  noInvoiceText: { fontSize: 14, color: colors.gray[500], lineHeight: 20 },
  contactList: { gap: spacing.sm },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.sm, backgroundColor: colors.gray[50], borderRadius: borderRadius.md,
  },
  contactIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  contactInfo: { flex: 1, gap: 1 },
  contactLabel: { fontSize: 11, color: colors.gray[500], textTransform: 'uppercase' },
  contactValue: { fontSize: 14, fontWeight: '600', color: colors.gray[900] },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
});