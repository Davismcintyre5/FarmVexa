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
import { fieldApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { colors, spacing } from '../../theme';
import { CROP_TYPES } from '../../utils/constants';

export default function FieldCreate() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmId } = route.params;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    crop: '',
    sizeValue: '',
    sizeUnit: 'acres',
  });

  const sizeUnits = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'square_meters', label: 'Square Meters' },
  ];

  const handleSubmit = async () => {
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Field name is required');
      return;
    }

    setLoading(true);
    try {
      await fieldApi.createField(farmId, {
        name: form.name.trim(),
        crop: form.crop || undefined,
        size: form.sizeValue ? {
          value: Number(form.sizeValue),
          unit: form.sizeUnit,
        } : undefined,
      });
      Alert.alert('Success', 'Field created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create field');
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
          <Text style={styles.sectionTitle}>Field Details</Text>

          <Input
            label="Field Name *"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="e.g., North Field"
            autoCapitalize="words"
          />

          <Select
            label="Crop"
            value={form.crop}
            onChange={(value) => setForm({ ...form, crop: value })}
            options={CROP_TYPES}
            placeholder="Select Crop"
          />

          <View style={styles.sizeRow}>
            <View style={styles.sizeValue}>
              <Input
                label="Size"
                value={form.sizeValue}
                onChangeText={(text) => setForm({ ...form, sizeValue: text })}
                placeholder="e.g., 5"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.sizeUnit}>
              <Select
                label="Unit"
                value={form.sizeUnit}
                onChange={(value) => setForm({ ...form, sizeUnit: value })}
                options={sizeUnits}
                placeholder="Unit"
              />
            </View>
          </View>

          <Button
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
            Create Field
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  sizeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sizeValue: {
    flex: 1,
  },
  sizeUnit: {
    flex: 1,
  },
});