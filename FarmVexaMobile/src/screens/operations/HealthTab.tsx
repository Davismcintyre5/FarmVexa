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
import { animalApi, healthApi } from '../../api/axios';
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

interface HealthTabProps {
  readOnly?: boolean;
}

export default function HealthTab({ readOnly = false }: HealthTabProps) {
  const { user } = useAuth();
  const { farms } = useFarms();
  const isFarmer = user?.role === 'farmer';
  const canAccess = ['farmer', 'vet', 'manager'].includes(user?.role);

  const [farmId, setFarmId] = useState('');
  const [animals, setAnimals] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    animal: '',
    recordType: 'vaccination',
    date: new Date().toISOString().split('T')[0],
    description: '',
    diagnosis: '',
    treatment: '',
    medication: '',
    dosage: '',
    cost: '',
    vetName: '',
    vetContact: '',
    nextCheckup: '',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    }
  }, [user]);

  useEffect(() => {
    if (farmId && canAccess) {
      loadData();
    }
  }, [farmId, canAccess]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [animalsRes, recordsRes, upcomingRes] = await Promise.all([
        animalApi.getAnimals(farmId),
        healthApi.getHealthRecords(farmId),
        healthApi.getHealthRecords(farmId), // Use same endpoint, will filter upcoming
      ]);
      setAnimals(animalsRes.data.data?.animals || []);
      setRecords(recordsRes.data.data?.records || []);
      setUpcoming((recordsRes.data.data?.records || []).filter(
        (r: any) => r.nextCheckup && new Date(r.nextCheckup) > new Date()
      ));
    } catch (error) {
      setAnimals([]);
      setRecords([]);
      setUpcoming([]);
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
      animal: '',
      recordType: 'vaccination',
      date: new Date().toISOString().split('T')[0],
      description: '',
      diagnosis: '',
      treatment: '',
      medication: '',
      dosage: '',
      cost: '',
      vetName: '',
      vetContact: '',
      nextCheckup: '',
    });
    setShowModal(true);
  };

  const openEdit = (record: any) => {
    setEditing(record);
    setForm({
      animal: record.animal?._id || record.animal || '',
      recordType: record.recordType || 'vaccination',
      date: record.date?.split('T')[0] || '',
      description: record.description || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      medication: record.medication || '',
      dosage: record.dosage || '',
      cost: record.cost ? String(record.cost) : '',
      vetName: record.vetName || '',
      vetContact: record.vetContact || '',
      nextCheckup: record.nextCheckup?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.animal || !form.date) {
      Alert.alert('Error', 'Animal and date required');
      return;
    }

    try {
      const data = {
        ...form,
        cost: form.cost ? Number(form.cost) : undefined,
      };

      if (editing) {
        await healthApi.updateHealthRecord(editing._id, data);
        Alert.alert('Success', 'Record updated');
      } else {
        await healthApi.addHealthRecord(farmId, data);
        Alert.alert('Success', 'Record added');
      }
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
            await healthApi.deleteHealthRecord(id);
            setRecords((prev) => prev.filter((r) => r._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const typeColors: Record<string, string> = {
    vaccination: colors.blue[100],
    treatment: colors.orange[100],
    checkup: colors.primary[100],
    disease: colors.red[100],
    deworming: '#f3e8ff',
  };

  const typeTextColors: Record<string, string> = {
    vaccination: colors.blue[700],
    treatment: colors.orange[700],
    checkup: colors.primary[700],
    disease: colors.red[700],
    deworming: '#6b21a8',
  };

  const recordTypes = ['vaccination', 'treatment', 'checkup', 'disease', 'deworming'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  if (!canAccess) {
    return (
      <EmptyState
        icon="shield-outline"
        title="Health Records"
        description="This section is accessible by farm owners, managers, and veterinarians only."
      />
    );
  }

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
            <Ionicons name="add" size={18} color={colors.white} /> Add Record
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Upcoming Vaccinations */}
          {upcoming.length > 0 && (
            <Card title="⚠️ Upcoming Vaccinations" style={styles.card}>
              {upcoming.map((record) => (
                <View key={record._id} style={styles.upcomingItem}>
                  <Text style={styles.upcomingText}>
                    {record.animal?.name || record.animal?.tagId || 'Unknown'} — {record.medication}
                  </Text>
                  <Text style={styles.upcomingDate}>
                    {formatDate(record.nextCheckup, 'date')}
                  </Text>
                </View>
              ))}
            </Card>
          )}

          {/* Records */}
          {records.length === 0 ? (
            <EmptyState icon="heart-outline" title="No health records" />
          ) : (
            <View style={styles.recordsList}>
              {records.map((record) => (
                <Card key={record._id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <View style={styles.recordInfo}>
                      <View style={styles.recordTypeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: typeColors[record.recordType] || colors.gray[100] }]}>
                          <Text style={[styles.typeText, { color: typeTextColors[record.recordType] || colors.gray[600] }]}>
                            {record.recordType}
                          </Text>
                        </View>
                        <Text style={styles.recordAnimal}>
                          {record.animal?.name || record.animal?.tagId || 'Unknown'}
                        </Text>
                      </View>
                      <Text style={styles.recordDescription} numberOfLines={2}>
                        {record.description || record.diagnosis}
                        {record.cost ? ` · KES ${record.cost}` : ''}
                      </Text>
                      <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                    </View>
                    {!readOnly && (
                      <View style={styles.recordActions}>
                        <TouchableOpacity onPress={() => openEdit(record)}>
                          <Ionicons name="pencil" size={16} color={colors.gray[400]} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(record._id)}>
                          <Ionicons name="trash" size={16} color={colors.red[500]} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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
          title={editing ? 'Edit Record' : 'Add Health Record'}
          size="lg"
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
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
              value={form.recordType}
              onChange={(value) => setForm({ ...form, recordType: value })}
              options={recordTypes}
              placeholder="Select Type"
            />
            <Input
              label="Date *"
              value={form.date}
              onChangeText={(text) => setForm({ ...form, date: text })}
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="Description"
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Description"
              multiline
            />
            <Input
              label="Diagnosis"
              value={form.diagnosis}
              onChangeText={(text) => setForm({ ...form, diagnosis: text })}
              placeholder="Diagnosis"
            />
            <Input
              label="Treatment"
              value={form.treatment}
              onChangeText={(text) => setForm({ ...form, treatment: text })}
              placeholder="Treatment"
            />
            <Input
              label="Medication"
              value={form.medication}
              onChangeText={(text) => setForm({ ...form, medication: text })}
              placeholder="Medication"
            />
            <Input
              label="Dosage"
              value={form.dosage}
              onChangeText={(text) => setForm({ ...form, dosage: text })}
              placeholder="Dosage"
            />
            <Input
              label="Cost (KES)"
              value={form.cost}
              onChangeText={(text) => setForm({ ...form, cost: text })}
              placeholder="0"
              keyboardType="numeric"
            />
            <Input
              label="Vet Name"
              value={form.vetName}
              onChangeText={(text) => setForm({ ...form, vetName: text })}
              placeholder="Vet name"
            />
            <Input
              label="Vet Contact"
              value={form.vetContact}
              onChangeText={(text) => setForm({ ...form, vetContact: text })}
              placeholder="Vet contact"
            />
            <Input
              label="Next Checkup"
              value={form.nextCheckup}
              onChangeText={(text) => setForm({ ...form, nextCheckup: text })}
              placeholder="YYYY-MM-DD"
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
  upcomingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  upcomingText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[700],
  },
  upcomingDate: {
    fontSize: 12,
    color: colors.orange[500],
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
    gap: 4,
  },
  recordTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recordAnimal: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  recordDescription: {
    fontSize: 13,
    color: colors.gray[500],
  },
  recordDate: {
    fontSize: 11,
    color: colors.gray[400],
  },
  recordActions: {
    flexDirection: 'row',
    gap: spacing.sm,
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