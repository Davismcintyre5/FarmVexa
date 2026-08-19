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
import { animalApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface LivestockTabProps {
  readOnly?: boolean;
}

export default function LivestockTab({ readOnly = false }: LivestockTabProps) {
  const { user } = useAuth();
  const { farms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [showMortality, setShowMortality] = useState(false);
  const [mortalityAnimal, setMortalityAnimal] = useState<any>(null);
  const [mortalityCount, setMortalityCount] = useState('');
  const [form, setForm] = useState({
    tagId: '',
    type: 'cattle',
    breed: '',
    category: '',
    name: '',
    gender: '',
    weight: '',
    status: 'active',
    isBatch: false,
    batchName: '',
    batchQuantity: '',
  });

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    }
  }, [user]);

  useEffect(() => {
    if (farmId) {
      loadAnimals();
    }
  }, [farmId]);

  const loadAnimals = async () => {
    setLoading(true);
    try {
      const res = await animalApi.getAnimals(farmId);
      setAnimals(res.data.data?.animals || []);
    } catch (error) {
      setAnimals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimals();
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      tagId: '',
      type: 'cattle',
      breed: '',
      category: '',
      name: '',
      gender: '',
      weight: '',
      status: 'active',
      isBatch: false,
      batchName: '',
      batchQuantity: '',
    });
    setShowModal(true);
  };

  const openEdit = (animal: any) => {
    setEditing(animal);
    setForm({
      tagId: animal.tagId || animal.tag || '',
      type: animal.type,
      breed: animal.breed || '',
      category: animal.category || '',
      name: animal.name || '',
      gender: animal.gender || '',
      weight: animal.weight ? String(animal.weight) : '',
      status: animal.status,
      isBatch: animal.isBatch || false,
      batchName: animal.batchName || '',
      batchQuantity: animal.batchQuantity ? String(animal.batchQuantity) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.tagId) {
      Alert.alert('Error', 'Tag ID required');
      return;
    }

    try {
      const data = {
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
        batchQuantity: form.isBatch ? Number(form.batchQuantity) : undefined,
        batchCurrent: form.isBatch ? Number(form.batchQuantity) : undefined,
      };

      if (editing) {
        await animalApi.updateAnimal(editing._id, data);
        Alert.alert('Success', 'Animal updated');
      } else {
        await animalApi.addAnimal(farmId, data);
        Alert.alert('Success', 'Animal added');
      }
      setShowModal(false);
      await loadAnimals();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Animal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await animalApi.deleteAnimal(id);
            setAnimals((prev) => prev.filter((a) => a._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleMortality = (animal: any) => {
    setMortalityAnimal(animal);
    setMortalityCount('');
    setShowMortality(true);
  };

  const handleMortalitySave = async () => {
    const count = Number(mortalityCount);
    if (!count || count <= 0) {
      Alert.alert('Error', 'Enter valid number of deaths');
      return;
    }

    try {
      await animalApi.updateAnimal(mortalityAnimal._id, {
        mortality: count,
        batchCurrent: Math.max(0, (mortalityAnimal.batchCurrent || 0) - count),
      });
      setShowMortality(false);
      setMortalityAnimal(null);
      setMortalityCount('');
      await loadAnimals();
      Alert.alert('Success', 'Mortality recorded');
    } catch (error) {
      Alert.alert('Error', 'Failed to record mortality');
    }
  };

  const animalTypes = ['cattle', 'goat', 'sheep', 'pig', 'poultry', 'other'].map((v) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
  }));

  const genderOptions = [
    { value: '', label: 'Select' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  return (
    <View style={styles.container}>
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

      {!readOnly && farmId && (
        <View style={styles.addButton}>
          <Button onPress={openAdd} size="sm">
            <Ionicons name="add" size={18} color={colors.white} /> Add Animal
          </Button>
        </View>
      )}

      {!farmId ? (
        <EmptyState title="Select a farm" />
      ) : loading ? (
        <Spinner size="lg" />
      ) : animals.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title="No animals"
          actionLabel={!readOnly ? 'Add Animal' : undefined}
          onAction={!readOnly ? openAdd : undefined}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.animalsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {animals.map((animal) => (
            <Card key={animal._id} style={styles.animalCard}>
              <View style={styles.animalHeader}>
                <View style={styles.animalInfo}>
                  <Text style={styles.animalName}>
                    {animal.isBatch ? animal.batchName || animal.tagId : animal.name || animal.tagId}
                  </Text>
                  <Text style={styles.animalType}>
                    {animal.type} {animal.breed && `· ${animal.breed}`}
                  </Text>
                  {animal.isBatch ? (
                    <Text style={styles.animalDetail}>
                      {animal.batchCurrent}/{animal.batchQuantity} birds
                    </Text>
                  ) : (
                    <Text style={styles.animalDetail}>{animal.weight}kg</Text>
                  )}
                </View>
                <Badge status={animal.status} />
              </View>

              {!readOnly && (
                <View style={styles.animalActions}>
                  <TouchableOpacity onPress={() => openEdit(animal)}>
                    <Ionicons name="pencil" size={16} color={colors.gray[400]} />
                  </TouchableOpacity>
                  {animal.isBatch && (
                    <TouchableOpacity onPress={() => handleMortality(animal)}>
                      <Ionicons name="skull" size={16} color={colors.red[500]} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => handleDelete(animal._id)} style={styles.deleteButton}>
                    <Ionicons name="trash" size={16} color={colors.red[500]} />
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      {!readOnly && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? 'Edit Animal' : 'Add Animal'}
          size="lg"
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Input
              label="Tag ID *"
              value={form.tagId}
              onChangeText={(text) => setForm({ ...form, tagId: text })}
              placeholder="e.g., TAG-001"
            />
            <Select
              label="Type"
              value={form.type}
              onChange={(value) => setForm({ ...form, type: value })}
              options={animalTypes}
              placeholder="Select Type"
            />
            <Input
              label="Breed"
              value={form.breed}
              onChangeText={(text) => setForm({ ...form, breed: text })}
              placeholder="e.g., Friesian"
            />
            <Input
              label="Category"
              value={form.category}
              onChangeText={(text) => setForm({ ...form, category: text })}
              placeholder="e.g., Dairy"
            />

            {!form.isBatch && (
              <>
                <Input
                  label="Name"
                  value={form.name}
                  onChangeText={(text) => setForm({ ...form, name: text })}
                  placeholder="e.g., Daisy"
                />
                <Select
                  label="Gender"
                  value={form.gender}
                  onChange={(value) => setForm({ ...form, gender: value })}
                  options={genderOptions}
                  placeholder="Select Gender"
                />
                <Input
                  label="Weight (kg)"
                  value={form.weight}
                  onChangeText={(text) => setForm({ ...form, weight: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </>
            )}

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setForm({ ...form, isBatch: !form.isBatch })}
            >
              <Ionicons
                name={form.isBatch ? 'checkbox' : 'square-outline'}
                size={20}
                color={form.isBatch ? colors.primary[500] : colors.gray[400]}
              />
              <Text style={styles.checkboxText}>Poultry Batch</Text>
            </TouchableOpacity>

            {form.isBatch && (
              <>
                <Input
                  label="Batch Name"
                  value={form.batchName}
                  onChangeText={(text) => setForm({ ...form, batchName: text })}
                  placeholder="e.g., Batch A"
                />
                <Input
                  label="Initial Quantity"
                  value={form.batchQuantity}
                  onChangeText={(text) => setForm({ ...form, batchQuantity: text })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </>
            )}

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

      {/* Mortality Modal */}
      <Modal
        open={showMortality}
        onClose={() => setShowMortality(false)}
        title="Record Mortality"
        size="sm"
      >
        <View style={styles.modalContent}>
          <Text style={styles.mortalityAnimal}>
            {mortalityAnimal?.isBatch
              ? mortalityAnimal?.batchName || mortalityAnimal?.tagId
              : mortalityAnimal?.name || mortalityAnimal?.tagId}
          </Text>
          <Text style={styles.mortalityCurrent}>
            Current: {mortalityAnimal?.batchCurrent || mortalityAnimal?.batchQuantity || 'N/A'} birds
          </Text>
          <Input
            label="Number of Deaths"
            value={mortalityCount}
            onChangeText={setMortalityCount}
            placeholder="0"
            keyboardType="numeric"
          />
          <View style={styles.modalActions}>
            <Button variant="outline" onPress={() => setShowMortality(false)} style={styles.flex1}>
              Cancel
            </Button>
            <Button onPress={handleMortalitySave} style={styles.flex1}>
              Record
            </Button>
          </View>
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
  animalsList: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  animalCard: {
    gap: spacing.sm,
  },
  animalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  animalInfo: {
    flex: 1,
    gap: 2,
  },
  animalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  animalType: {
    fontSize: 13,
    color: colors.gray[500],
  },
  animalDetail: {
    fontSize: 13,
    color: colors.gray[600],
  },
  animalActions: {
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  mortalityAnimal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  mortalityCurrent: {
    fontSize: 14,
    color: colors.gray[500],
  },
});