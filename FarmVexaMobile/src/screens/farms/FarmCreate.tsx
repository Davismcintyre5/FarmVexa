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
import { useNavigation } from '@react-navigation/native';
import { useFarms } from '../../hooks/useFarms';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import { colors, spacing } from '../../theme';
import { getCountyOptions, getConstituencyOptions } from '../../utils/counties';

export default function FarmCreate() {
  const navigation = useNavigation<any>();
  const { createFarm } = useFarms();
  const [loading, setLoading] = useState(false);
  const [constituencyOptions, setConstituencyOptions] = useState<{value: string, label: string}[]>([]);
  const [form, setForm] = useState({
    name: '',
    county: '',
    subCounty: '',
    sizeValue: '',
    sizeUnit: 'acres',
  });

  const sizeUnits = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'square_meters', label: 'Square Meters' },
  ];

  const handleCountyChange = (county: string) => {
    setForm({ ...form, county, subCounty: '' });
    setConstituencyOptions(getConstituencyOptions(county));
  };

  const handleSubmit = async () => {
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Farm name is required');
      return;
    }

    setLoading(true);
    try {
      await createFarm({
        name: form.name.trim(),
        location: {
          county: form.county,
          subCounty: form.subCounty,
        },
        size: form.sizeValue ? {
          value: Number(form.sizeValue),
          unit: form.sizeUnit,
        } : undefined,
      });
      Alert.alert('Success', 'Farm created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create farm');
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
          <Text style={styles.sectionTitle}>Farm Details</Text>

          <Input
            label="Farm Name *"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="e.g., Green Valley Farm"
            autoCapitalize="words"
          />

          <Select
            label="County"
            value={form.county}
            onChange={handleCountyChange}
            options={getCountyOptions()}
            placeholder="Select County"
          />

          <Select
            label="Sub-County"
            value={form.subCounty}
            onChange={(value) => setForm({ ...form, subCounty: value })}
            options={constituencyOptions}
            placeholder={form.county ? 'Select Sub-County' : 'Select County First'}
          />

          <View style={styles.sizeRow}>
            <View style={styles.sizeValue}>
              <Input
                label="Size"
                value={form.sizeValue}
                onChangeText={(text) => setForm({ ...form, sizeValue: text })}
                placeholder="e.g., 10"
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
            Create Farm
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