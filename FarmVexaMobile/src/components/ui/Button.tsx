import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onPress,
  style,
  fullWidth = false,
}: ButtonProps) {
  
  const variants: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary[500],
    },
    secondary: {
      backgroundColor: colors.gray[200],
    },
    outline: {
      borderWidth: 1,
      borderColor: colors.primary[500],
      backgroundColor: colors.transparent,
    },
    danger: {
      backgroundColor: colors.red[500],
    },
    ghost: {
      backgroundColor: colors.transparent,
    },
  };

  const variantText: Record<string, TextStyle> = {
    primary: { color: colors.white },
    secondary: { color: colors.gray[800] },
    outline: { color: colors.primary[500] },
    danger: { color: colors.white },
    ghost: { color: colors.gray[700] },
  };

  const sizes: Record<string, ViewStyle> = {
    sm: { paddingVertical: 8, paddingHorizontal: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24 },
  };

  const sizeText: Record<string, TextStyle> = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 18 },
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variants[variant],
        sizes[size],
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantText[variant].color} />
      ) : (
        <Text style={[styles.text, variantText[variant], sizeText[size]]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
});