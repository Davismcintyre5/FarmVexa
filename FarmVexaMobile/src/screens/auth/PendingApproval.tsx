import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Logo size="md" />
        
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={48} color={colors.yellow[500]} />
        </View>
        
        <Text style={styles.title}>Account Pending</Text>
        <Text style={styles.description}>
          Your account is being reviewed by our team. You'll receive an email at{' '}
          <Text style={styles.email}>{user?.email}</Text> once approved.
        </Text>
        <Text style={styles.note}>
          This usually takes less than 24 hours.
        </Text>
        <Button onPress={handleLogout} variant="outline" fullWidth>
          Back to Login
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.yellow[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  description: {
    fontSize: 16,
    color: colors.gray[500],
    textAlign: 'center',
  },
  email: {
    fontWeight: '600',
    color: colors.gray[700],
  },
  note: {
    fontSize: 14,
    color: colors.gray[400],
  },
});