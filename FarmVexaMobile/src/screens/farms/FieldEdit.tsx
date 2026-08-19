import React, { useState, useEffect } from 'react';
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
import Spinner from '../../components/ui/Spinner';
import { colors, spacing } from '../../theme';
import { CROP_TYPES } from '../../utils/constants';

export default function FieldEdit() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fieldId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadField();
  }, [fieldId]);

  const loadField = async () => {
    try {
      const res = await fieldApi.getField(fieldId);
      const field = res.data.data.field;
      setForm({
        name: field.name || '',
        crop: field.crop || '',
        sizeValue: field.size?.value ? String(field.size.value) : '',
        sizeUnit: field.size?.unit || 'acres',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load field');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Field name is required');
      return;
    }

    setSaving(true);
    try {
      await fieldApi.updateField(fieldId, {
        name: form.name.trim(),
        crop: form.crop || undefined,
        size: form.sizeValue ? {
          value: Number(form.sizeValue),
          unit: form.sizeUnit,
        } : undefined,
      });
      Alert.alert('Success', 'Field updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update field');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

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
          <Text style={styles.sectionTitle}>Edit Field</Text>

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
            loading={saving}
            fullWidth
            size="lg"
          >
            Update Field
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