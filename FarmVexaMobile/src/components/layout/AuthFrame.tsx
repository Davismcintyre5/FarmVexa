import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import Logo from '../ui/Logo';

interface AuthFrameProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * AuthFrame — Rectangular card layout for all auth screens.
 * Used by Login, Register, Forgot, Reset.
 */
export default function AuthFrame({ children, title, subtitle }: AuthFrameProps) {
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Logo size="md" showTagline />
        </View>

        {/* Card */}
        <View style={styles.card}>
          {title && <Text style={styles.cardTitle}>{title}</Text>}
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
          <View style={styles.cardContent}>{children}</View>
        </View>

        {/* Copyright */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} FarmVexa — See. Sense. Predict. Grow.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  brandHeader: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: spacing.md,
    width: '100%',
    maxWidth: 448, // ~28rem
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: -spacing.sm,
  },
  cardContent: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  footer: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
  },
});