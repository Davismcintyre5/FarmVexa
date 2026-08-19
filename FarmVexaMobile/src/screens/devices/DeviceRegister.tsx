import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { deviceApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { colors, spacing } from '../../theme';
import { SENSOR_TYPES } from '../../utils/constants';

export default function DeviceRegister() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmId } = route.params;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'soil_moisture',
    serialNumber: '',
  });

  const handleSubmit = async () => {
    if (!form.name || !form.serialNumber) {
      Alert.alert('Error', 'Name and serial number are required');
      return;
    }

    setLoading(true);
    try {
      await deviceApi.registerDevice(farmId, form);
      Alert.alert('Success', 'Device registered successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to register device');
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
          <Text style={styles.title}>Register Device</Text>
          <Text style={styles.subtitle}>
            Register a new IoT device for your farm.
          </Text>

          <Input
            label="Device Name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="e.g., Field 1 Sensor"
          />

          <Select
            label="Device Type"
            value={form.type}
            onChange={(value) => setForm({ ...form, type: value })}
            options={SENSOR_TYPES}
            placeholder="Select Type"
          />

          <Input
            label="Serial Number"
            value={form.serialNumber}
            onChangeText={(text) => setForm({ ...form, serialNumber: text })}
            placeholder="e.g., SN-001"
          />

          <Button
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
            Register Device
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
  },
});