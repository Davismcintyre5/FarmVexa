import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { animalApi, fieldApi, productionApi, priceApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatNumber } from '../../utils/formatters';

interface ProductionTabProps {
  readOnly?: boolean;
}

export default function ProductionTab({ readOnly = false }: ProductionTabProps) {
  const { user } = useAuth();
  const { farms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [animals, setAnimals] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [prodMode, setProdMode] = useState<'animal' | 'crop'>('animal');
  const [calculatedValue, setCalculatedValue] = useState<number | null>(null);
  const [form, setForm] = useState({
    animal: '',
    field: '',
    type: 'milk',
    cropType: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'litre',
    quality: 'grade_a',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    }
  }, [user]);

  useEffect(() => {
    if (farmId) {
      loadData();
    }
  }, [farmId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [animalsRes, fieldsRes, recordsRes, pricesRes] = await Promise.all([
        animalApi.getAnimals(farmId).catch(() => ({ data: { data: { animals: [] } } })),
        fieldApi.getFields(farmId).catch(() => ({ data: { data: { fields: [] } } })),
        productionApi.getProduction(farmId).catch(() => ({ data: { data: { records: [], summary: null } } })),
        priceApi.getPrices(farmId).catch(() => ({ data: { data: { prices: [] } } })),
      ]);
      setAnimals(animalsRes.data.data?.animals || []);
      setFields(fieldsRes.data.data?.fields || []);
      setRecords(recordsRes.data.data?.records || []);
      setSummary(recordsRes.data.data?.summary || null);
      setPrices(pricesRes.data.data?.prices || []);
    } catch (error) {
      setAnimals([]);
      setFields([]);
      setRecords([]);
      setSummary(null);
      setPrices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const getProductName = (type: string): string => {
    if (prodMode === 'crop' && form.cropType) return form.cropType.toLowerCase();
    if (type === 'milk') return 'milk';
    if (type === 'eggs') return 'eggs';
    if (type === 'meat') return 'chicken';
    return type;
  };

  const calculateValue = (type: string, unit: string, quality: string, quantity: string): number | null => {
    const productName = getProductName(type);
    const price = prices.find(
      (p) => p.product === productName && p.unit === unit && (p.quality || 'grade_a') === quality
    );
    return price && quantity ? Number(quantity) * price.pricePerUnit : null;
  };

  useEffect(() => {
    setCalculatedValue(calculateValue(form.type, form.unit, form.quality, form.quantity));
  }, [form.type, form.unit, form.quality, form.quantity, form.cropType, prices, prodMode]);

  const openAdd = () => {
    setProdMode('animal');
    setForm({
      animal: '',
      field: '',
      type: 'milk',
      cropType: '',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      unit: 'litre',
      quality: 'grade_a',
    });
    setCalculatedValue(null);
    setShowModal(true);
  };

  const handleModeChange = (mode: 'animal' | 'crop') => {
    setProdMode(mode);
    if (mode === 'animal') {
      setForm({ ...form, type: 'milk', field: '', cropType: '', unit: 'litre' });
    } else {
      setForm({ ...form, type: 'harvest', animal: '', unit: 'kg' });
    }
  };

  const handleFieldChange = (fieldId: string) => {
    const field = fields.find((f) => f._id === fieldId);
    if (field) {
      setForm({ ...form, field: fieldId, cropType: field.crop || '' });
    }
  };

  const handleTypeChange = (type: string) => {
    const units: Record<string, string> = {
      milk: 'litre',
      eggs: 'tray',
      meat: 'kg',
      harvest: 'kg',
      breeding: 'head',
      other: 'kg',
    };
    setForm({ ...form, type, unit: units[type] || 'kg' });
  };

  const handleSave = async () => {
    if (prodMode === 'animal' && !form.animal) {
      Alert.alert('Error', 'Select an animal');
      return;
    }
    if (prodMode === 'crop' && !form.field) {
      Alert.alert('Error', 'Select a field');
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      Alert.alert('Error', 'Enter valid quantity');
      return;
    }

    try {
      const data: any = {
        type: prodMode === 'crop' ? form.cropType || 'harvest' : form.type,
        date: form.date,
        quantity: Number(form.quantity),
        unit: form.unit,
        quality: form.quality,
        totalValue: calculatedValue || undefined,
      };

      if (prodMode === 'animal') {
        data.animal = form.animal;
      } else {
        data.field = form.field;
      }

      await productionApi.addProduction(farmId, data);
      Alert.alert('Success', 'Production recorded');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await productionApi.deleteProduction(id);
            setRecords((prev) => prev.filter((r) => r._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const unitOptions = [
    { value: 'litre', label: 'Litre' },
    { value: 'tray', label: 'Tray' },
    { value: 'piece', label: 'Piece' },
    { value: 'kg', label: 'Kg' },
    { value: 'bird', label: 'Bird' },
    { value: 'head', label: 'Head' },
  ];

  const qualityOptions = [
    { value: 'grade_a', label: 'Grade A' },
    { value: 'grade_b', label: 'Grade B' },
    { value: 'grade_c', label: 'Grade C' },
  ];

  return (
    <View style={styles.container}>
      {/* Farm Selector */}
      {isFarmer && (
        <View style={styles.farmSelector}>
          <Select
            label="Farm"
            value={farmId}
            onChange={setFarmId}
            options={farms.map((f) => ({ value: f._id, label: f.name }))}
            placeholder="Select Farm"
          />
        </View>
      )}

      {/* Add Button */}
      {!readOnly && farmId && (
        <View style={styles.addButton}>
          <Button onPress={openAdd} size="sm">
            <Ionicons name="add" size={18} color={colors.white} /> Record Production
          </Button>
        </View>
      )}

      {!farmId ? (
        <EmptyState title="Select a farm" />
      ) : loading ? (
        <Spinner size="lg" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Summary */}
          {summary && (
            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{summary.count || 0}</Text>
                <Text style={styles.summaryLabel}>Records</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryValueSmall}>
                  KES {formatNumber(summary.totalValue)}
                </Text>
                <Text style={styles.summaryLabel}>Total Value</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.summaryValue}>
                  {Object.keys(summary.byType || {}).length}
                </Text>
                <Text style={styles.summaryLabel}>Products</Text>
              </Card>
            </View>
          )}

          {/* Records */}
          {records.length === 0 ? (
            <EmptyState icon="cube-outline" title="No production records" />
          ) : (
            <View style={styles.recordsList}>
              {records.map((record) => (
                <Card key={record._id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordType} numberOfLines={1}>
                        {record.type} — {record.animal?.name || record.animal?.tagId || record.field?.name || '—'}
                      </Text>
                      <Text style={styles.recordDetail}>
                        {record.quantity} {record.unit} · {record.quality}
                        {record.totalValue ? ` · KES ${record.totalValue}` : ''}
                      </Text>
                      <Text style={styles.recordDate}>
                        {formatDate(record.date, 'date')}
                      </Text>
                    </View>
                    {!readOnly && (
                      <TouchableOpacity onPress={() => handleDelete(record._id)}>
                        <Ionicons name="trash" size={16} color={colors.red[500]} />
                      </TouchableOpacity>
                    )}
                  </View>
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Modal */}
      {!readOnly && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title="Record Production"
          size="lg"
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[styles.modeButton, prodMode === 'animal' && styles.modeButtonActive]}
                onPress={() => handleModeChange('animal')}
              >
                <Ionicons
                  name="git-branch"
                  size={16}
                  color={prodMode === 'animal' ? colors.primary[600] : colors.gray[500]}
                />
                <Text style={[styles.modeText, prodMode === 'animal' && styles.modeTextActive]}>
                  Animal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, prodMode === 'crop' && styles.modeButtonActive]}
                onPress={() => handleModeChange('crop')}
              >
                <Ionicons
                  name="leaf"
                  size={16}
                  color={prodMode === 'crop' ? colors.primary[600] : colors.gray[500]}
                />
                <Text style={[styles.modeText, prodMode === 'crop' && styles.modeTextActive]}>
                  Crop
                </Text>
              </TouchableOpacity>
            </View>

            {/* Animal Mode */}
            {prodMode === 'animal' && (
              <>
                <Select
                  label="Animal *"
                  value={form.animal}
                  onChange={(value) => setForm({ ...form, animal: value })}
                  options={animals.map((a) => ({
                    value: a._id,
                    label: a.name || a.tagId || a.type,
                  }))}
                  placeholder="Select Animal"
                />
                <Select
                  label="Type"
                  value={form.type}
                  onChange={handleTypeChange}
                  options={['milk', 'eggs', 'meat', 'breeding', 'other'].map((v) => ({
                    value: v,
                    label: v.charAt(0).toUpperCase() + v.slice(1),
                  }))}
                  placeholder="Select Type"
                />
              </>
            )}

            {/* Crop Mode */}
            {prodMode === 'crop' && (
              <>
                <Select
                  label="Field *"
                  value={form.field}
                  onChange={handleFieldChange}
                  options={fields
                    .filter((f) => f.crop)
                    .map((f) => ({
                      value: f._id,
                      label: `${f.name} (${f.crop})`,
                    }))}
                  placeholder="Select Field"
                />
                {form.cropType && (
                  <Text style={styles.cropText}>
                    Crop: <Text style={styles.cropName}>{form.cropType}</Text>
                  </Text>
                )}
              </>
            )}

            <Input
              label="Date"
              value={form.date}
              onChangeText={(text) => setForm({ ...form, date: text })}
              placeholder="YYYY-MM-DD"
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Input
                  label="Quantity *"
                  value={form.quantity}
                  onChangeText={(text) => setForm({ ...form, quantity: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.flex1}>
                <Select
                  label="Unit"
                  value={form.unit}
                  onChange={(value) => setForm({ ...form, unit: value })}
                  options={unitOptions}
                  placeholder="Unit"
                />
              </View>
            </View>

            <Select
              label="Quality"
              value={form.quality}
              onChange={(value) => setForm({ ...form, quality: value })}
              options={qualityOptions}
              placeholder="Quality"
            />

            {calculatedValue !== null && (
              <View style={styles.valueBox}>
                <Text style={styles.valueLabel}>Estimated Value</Text>
                <Text style={styles.valueAmount}>
                  KES {Number(calculatedValue).toLocaleString()}
                </Text>
              </View>
            )}
            {calculatedValue === null && form.quantity && (
              <Text style={styles.noPriceText}>
                No price set for this product. Set price in Finance tab.
              </Text>
            )}

            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setShowModal(false)} style={styles.flex1}>
                Cancel
              </Button>
              <Button onPress={handleSave} style={styles.flex1}>
                Save
              </Button>
            </View>
          </ScrollView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  farmSelector: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  addButton: {
    paddingHorizontal: spacing.md,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  summaryValueSmall: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },
  recordsList: {
    gap: spacing.sm,
  },
  recordCard: {
    gap: spacing.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
    gap: 2,
  },
  recordType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    textTransform: 'capitalize',
  },
  recordDetail: {
    fontSize: 13,
    color: colors.gray[500],
  },
  recordDate: {
    fontSize: 11,
    color: colors.gray[400],
  },
  modalContent: {
    gap: spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: 4,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  modeTextActive: {
    color: colors.primary[600],
  },
  cropText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  cropName: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  valueBox: {
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  valueAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  noPriceText: {
    fontSize: 13,
    color: colors.orange[500],
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});