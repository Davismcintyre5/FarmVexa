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
import { equipmentApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function EquipmentTab({ readOnly = false }: { readOnly?: boolean }) {
  const { user } = useAuth();
  const { farms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [maintModal, setMaintModal] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'tractor',
    purchaseDate: '',
    cost: '',
    condition: 'good',
    maintenanceFrequency: 'monthly',
  });
  const [maintForm, setMaintForm] = useState({
    cost: '',
    notes: '',
    condition: 'good',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) setFarmId(user.farm);
  }, [user]);

  useEffect(() => {
    if (farmId) loadData();
  }, [farmId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await equipmentApi.getEquipment(farmId);
      setItems(res.data.data?.items || []);
      setMaintenanceDue(res.data.data?.maintenanceDue || []);
    } catch (error) {
      setItems([]);
      setMaintenanceDue([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      category: 'tractor',
      purchaseDate: '',
      cost: '',
      condition: 'good',
      maintenanceFrequency: 'monthly',
    });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      purchaseDate: item.purchaseDate?.split('T')[0] || '',
      cost: item.cost ? String(item.cost) : '',
      condition: item.condition,
      maintenanceFrequency: item.maintenanceFrequency || 'monthly',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      Alert.alert('Error', 'Name required');
      return;
    }

    try {
      if (editing) {
        await equipmentApi.updateEquipment(editing._id, form);
      } else {
        await equipmentApi.addEquipment(farmId, { ...form, cost: Number(form.cost) });
      }
      Alert.alert('Success', editing ? 'Updated' : 'Added');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed');
    }
  };

  const handleMaintenance = async () => {
    if (!maintModal) return;
    try {
      await equipmentApi.updateEquipment(maintModal._id, maintForm);
      Alert.alert('Success', 'Maintenance recorded');
      setMaintModal(null);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to record maintenance');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Equipment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await equipmentApi.deleteEquipment(id);
            setItems((prev) => prev.filter((i) => i._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const conditionColors: Record<string, string> = {
    new: colors.primary[100],
    good: colors.blue[100],
    fair: colors.yellow[100],
    poor: colors.orange[100],
    broken: colors.red[100],
  };

  const conditionTextColors: Record<string, string> = {
    new: colors.primary[700],
    good: colors.blue[700],
    fair: colors.yellow[700],
    poor: colors.orange[700],
    broken: colors.red[700],
  };

  const categories = ['tractor', 'plough', 'sprayer', 'milking', 'incubator', 'feeder', 'waterer', 'tool', 'vehicle', 'other'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  const conditions = ['new', 'good', 'fair', 'poor', 'broken'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  const frequencies = ['weekly', 'monthly', 'quarterly', 'biannually', 'annually'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

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
            <Ionicons name="add" size={18} color={colors.white} /> Add Equipment
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
          {/* Maintenance Due */}
          {maintenanceDue.length > 0 && (
            <Card title="⚠️ Maintenance Due" style={styles.card}>
              {maintenanceDue.map((item) => (
                <Text key={item._id} style={styles.maintenanceText}>
                  {item.name}: {item.nextMaintenance ? formatDate(item.nextMaintenance, 'date') : 'Now'}
                </Text>
              ))}
            </Card>
          )}

          {/* Equipment List */}
          {items.length === 0 ? (
            <EmptyState icon="build-outline" title="No equipment" />
          ) : (
            <View style={styles.itemsList}>
              {items.map((item) => (
                <Card key={item._id} style={styles.itemCard}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemMeta}>
                    <View style={[styles.conditionBadge, { backgroundColor: conditionColors[item.condition] || colors.gray[100] }]}>
                      <Text style={[styles.conditionText, { color: conditionTextColors[item.condition] || colors.gray[600] }]}>
                        {item.condition}
                      </Text>
                    </View>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  {item.cost > 0 && (
                    <Text style={styles.itemCost}>KES {formatNumber(item.cost)}</Text>
                  )}
                  {item.nextMaintenance && (
                    <Text style={styles.itemMaintenance}>
                      Next: {formatDate(item.nextMaintenance, 'date')}
                    </Text>
                  )}

                  {!readOnly && (
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => { setMaintModal(item); setMaintForm({ cost: '', notes: '', condition: item.condition }); }}>
                        <Ionicons name="build" size={16} color={colors.primary[500]} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEdit(item)}>
                        <Ionicons name="pencil" size={16} color={colors.gray[400]} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteButton}>
                        <Ionicons name="trash" size={16} color={colors.red[500]} />
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      {!readOnly && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? 'Edit Equipment' : 'Add Equipment'}
          size="lg"
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input
              label="Name *"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="e.g., Massey Ferguson Tractor"
            />
            <Select
              label="Category"
              value={form.category}
              onChange={(value) => setForm({ ...form, category: value })}
              options={categories}
              placeholder="Select Category"
            />
            <Input
              label="Cost (KES)"
              value={form.cost}
              onChangeText={(text) => setForm({ ...form, cost: text })}
              placeholder="0"
              keyboardType="numeric"
            />
            <Input
              label="Purchase Date"
              value={form.purchaseDate}
              onChangeText={(text) => setForm({ ...form, purchaseDate: text })}
              placeholder="YYYY-MM-DD"
            />
            <Select
              label="Condition"
              value={form.condition}
              onChange={(value) => setForm({ ...form, condition: value })}
              options={conditions}
              placeholder="Select Condition"
            />
            <Select
              label="Maintenance Frequency"
              value={form.maintenanceFrequency}
              onChange={(value) => setForm({ ...form, maintenanceFrequency: value })}
              options={frequencies}
              placeholder="Select Frequency"
            />

            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setShowModal(false)} style={styles.flex1}>
                Cancel
              </Button>
              <Button onPress={handleSave} style={styles.flex1}>
                {editing ? 'Update' : 'Add'}
              </Button>
            </View>
          </ScrollView>
        </Modal>
      )}

      {/* Maintenance Modal */}
      <Modal
        open={!!maintModal}
        onClose={() => setMaintModal(null)}
        title="Record Maintenance"
        size="sm"
      >
        <View style={styles.modalContent}>
          <Input
            label="Cost (KES)"
            value={maintForm.cost}
            onChangeText={(text) => setMaintForm({ ...maintForm, cost: text })}
            placeholder="0"
            keyboardType="numeric"
          />
          <Select
            label="Condition After"
            value={maintForm.condition}
            onChange={(value) => setMaintForm({ ...maintForm, condition: value })}
            options={conditions}
            placeholder="Select Condition"
          />
          <Input
            label="Notes"
            value={maintForm.notes}
            onChangeText={(text) => setMaintForm({ ...maintForm, notes: text })}
            placeholder="Maintenance notes"
            multiline
          />
          <Button onPress={handleMaintenance} fullWidth>
            Record Maintenance
          </Button>
        </View>
      </Modal>
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
  card: {
    gap: spacing.sm,
  },
  maintenanceText: {
    fontSize: 13,
    color: colors.orange[600],
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemCard: {
    gap: spacing.xs,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  conditionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itemCategory: {
    fontSize: 13,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  itemCost: {
    fontSize: 13,
    color: colors.gray[500],
  },
  itemMaintenance: {
    fontSize: 11,
    color: colors.gray[400],
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  modalContent: {
    gap: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
});