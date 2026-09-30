import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { PaymentInstruction } from '../../types';

interface PaymentInstructionsProps {
  instructions?: PaymentInstruction[];
  hideStk?: boolean;
}

const CODE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  mpesa_stk: 'phone-portrait-outline',
  mpesa_send_money: 'paper-plane-outline',
  mpesa_till: 'storefront-outline',
  mpesa_paybill: 'receipt-outline',
  bank: 'business-outline',
  cash: 'cash-outline',
  stripe: 'card-outline',
};

function RecipientRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={styles.recipientRow}>
      <Text style={styles.recipientLabel}>{label}</Text>
      <Text style={styles.recipientValue} selectable>{value}</Text>
    </View>
  );
}

function InstructionCard({ instruction }: { instruction: PaymentInstruction }) {
  const icon = CODE_ICONS[instruction.code] || 'wallet-outline';
  const recipient = instruction.recipient || {};

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={colors.primary[600]} />
        </View>
        <View style={styles.cardTitleBox}>
          <Text style={styles.cardTitle}>{instruction.title}</Text>
          {instruction.description ? (
            <Text style={styles.cardDescription}>{instruction.description}</Text>
          ) : null}
        </View>
      </View>

      {/* Recipient fields — rendered flat, no label parsing */}
      <View style={styles.recipientBox}>
        <RecipientRow label="Phone" value={recipient.phone} />
        <RecipientRow label="Till Number" value={recipient.tillNumber} />
        <RecipientRow label="Paybill Number" value={recipient.paybillNumber} />
        <RecipientRow label="Account Number" value={recipient.accountNumber} />
        <RecipientRow label="Bank" value={recipient.bankName} />
        <RecipientRow label="Account Name" value={recipient.accountName} />
        <RecipientRow label="Branch" value={recipient.branch} />
        <RecipientRow label="SWIFT" value={recipient.swift} />
      </View>

      {/* Steps — rendered as-is from server */}
      {instruction.steps && instruction.steps.length > 0 && (
        <View style={styles.stepsBox}>
          {instruction.steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function PaymentInstructions({
  instructions,
  hideStk = false,
}: PaymentInstructionsProps) {
  const filtered = (instructions || []).filter((inst) => {
    if (hideStk && inst.code === 'mpesa_stk') return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Ionicons name="information-circle-outline" size={24} color={colors.gray[400]} />
        <Text style={styles.emptyText}>No payment instructions available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filtered.map((instruction, index) => (
        <InstructionCard key={`${instruction.code}-${index}`} instruction={instruction} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleBox: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  cardDescription: {
    fontSize: 13,
    color: colors.gray[500],
    lineHeight: 18,
  },
  recipientBox: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: 6,
  },
  recipientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recipientLabel: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
  },
  recipientValue: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  stepsBox: {
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary[700],
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 19,
  },
  emptyBox: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
  },
  emptyText: {
    fontSize: 13,
    color: colors.gray[500],
  },
});