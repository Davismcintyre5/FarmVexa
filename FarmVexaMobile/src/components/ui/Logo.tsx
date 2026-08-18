import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { container: 40, emoji: 20, title: 16 },
    md: { container: 80, emoji: 40, title: 28 },
    lg: { container: 120, emoji: 64, title: 40 },
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.logoContainer,
          {
            width: sizes[size].container,
            height: sizes[size].container,
            borderRadius: sizes[size].container / 2,
          },
        ]}
      >
        <Text style={{ fontSize: sizes[size].emoji }}>🌾</Text>
      </View>
      <Text style={[styles.title, { fontSize: sizes[size].title }]}>
        FarmVexa
      </Text>
      {showTagline && (
        <Text style={styles.tagline}>See. Sense. Predict. Grow.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2d6a4f',
  },
  title: {
    fontWeight: 'bold',
    color: '#2d6a4f',
  },
  tagline: {
    fontSize: 14,
    color: '#3b82f6',
  },
});