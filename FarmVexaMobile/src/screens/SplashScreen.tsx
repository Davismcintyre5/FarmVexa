import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.emoji}>🌾</Text>
      </View>
      <Text style={styles.title}>FarmVexa</Text>
      <Text style={styles.tagline}>See. Sense. Predict. Grow.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d6a4f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.white,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  tagline: {
    fontSize: 16,
    color: '#3b82f6',
    marginTop: 8,
  },
});