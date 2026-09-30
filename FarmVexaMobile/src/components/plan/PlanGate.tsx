import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Button from '../ui/Button';
import { colors, spacing, borderRadius } from '../../theme';

interface PlanGateProps {
  feature: string;
  planName: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
}

export default function PlanGate({
  feature,
  planName,
  title,
  description,
  ctaLabel,
}: PlanGateProps) {
  const navigation = useNavigation<any>();

  const defaultTitle = 'Feature Not Available';
  const defaultDescription = `Your plan (${planName}) does not include this feature. Upgrade to unlock it.`;
  const defaultCta = 'Upgrade Plan';

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name="lock-closed" size={40} color={colors.yellow[600]} />
      </View>

      <Text style={styles.title}>{title || defaultTitle}</Text>
      <Text style={styles.description}>{description || defaultDescription}</Text>

      <View style={styles.planBox}>
        <Text style={styles.planLabel}>Current Plan</Text>
        <Text style={styles.planName}>{planName}</Text>
      </View>

      <Button
        onPress={() => navigation.navigate('Settings', { screen: 'Plans' })}
        fullWidth
        size="lg"
      >
        {ctaLabel || defaultCta}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.yellow[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  planBox: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  planLabel: {
    fontSize: 10,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  planName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
});