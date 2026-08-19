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
import { useFarms } from '../../hooks/useFarms';
import { farmApi } from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing } from '../../theme';
import { getCountyOptions, getConstituencyOptions } from '../../utils/counties';

export default function FarmEdit() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmId } = route.params;
  const { updateFarm } = useFarms();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadFarm();
  }, [farmId]);

  const loadFarm = async () => {
    try {
      const res = await farmApi.getFarm(farmId);
      const farm = res.data.data.farm;
      setForm({
        name: farm.name || '',
        county: farm.location?.county || '',
        subCounty: farm.location?.subCounty || '',
        sizeValue: farm.size?.value ? String(farm.size.value) : '',
        sizeUnit: farm.size?.unit || 'acres',
      });
      if (farm.location?.county) {
        setConstituencyOptions(getConstituencyOptions(farm.location.county));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load farm');
    } finally {
      setLoading(false);
    }
  };

  const handleCountyChange = (county: string) => {
    setForm({ ...form, county, subCounty: '' });
    setConstituencyOptions(getConstituencyOptions(county));
  };

  const handleSubmit = async () => {
    if (!form.name || form.name.trim().length < 2) {
      Alert.alert('Error', 'Farm name is required');
      return;
    }

    setSaving(true);
    try {
      await updateFarm(farmId, {
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
      Alert.alert('Success', 'Farm updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update farm');
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
          <Text style={styles.sectionTitle}>Edit Farm</Text>

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
            loading={saving}
            fullWidth
            size="lg"
          >
            Update Farm
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