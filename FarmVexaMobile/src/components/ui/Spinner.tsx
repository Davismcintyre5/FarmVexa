import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size={sizes[size]} color={colors.primary[500]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
});