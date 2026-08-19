import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { colors, spacing } from '../../theme';

export default function ChangePassword() {
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return;
    }
    if (!form.newPassword || form.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter your current password and choose a new one.
          </Text>

          <Input
            label="Current Password"
            value={form.currentPassword}
            onChangeText={(text) => handleChange('currentPassword', text)}
            placeholder="Enter current password"
            secureTextEntry
          />

          <Input
            label="New Password"
            value={form.newPassword}
            onChangeText={(text) => handleChange('newPassword', text)}
            placeholder="Min 6 characters"
            secureTextEntry
          />

          <Input
            label="Confirm New Password"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            placeholder="Repeat new password"
            secureTextEntry
          />

          <Button
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
            Change Password
          </Button>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  formCard: {
    gap: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
});