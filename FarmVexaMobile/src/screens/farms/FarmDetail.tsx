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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { farmApi, fieldApi, alertApi, animalApi, inventoryApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '../../utils/formatters';
import { Farm, Field } from '../../types';

export default function FarmDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmId } = route.params;
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';

  const [farm, setFarm] = useState<Farm | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [animalCount, setAnimalCount] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFarmData();
  }, [farmId]);

  const loadFarmData = async () => {
    setLoading(true);
    try {
      const [farmRes, fieldsRes, alertsRes, animalsRes, stockRes] = await Promise.all([
        farmApi.getFarm(farmId),
        fieldApi.getFields(farmId),
        alertApi.getAlerts(farmId).catch(() => ({ data: { data: { alerts: [] } } })),
        animalApi.getAnimals(farmId).catch(() => ({ data: { data: { animals: [] } } })),
        inventoryApi.getInventory(farmId).catch(() => ({ data: { data: { items: [] } } })),
      ]);

      const farmData = farmRes.data?.data?.farm || farmRes.data?.farm || farmRes.data?.data || farmRes.data;
      setFarm(farmData);
      setFields(fieldsRes.data?.data?.fields || []);
      setAlerts(alertsRes.data?.data?.alerts || []);
      setAnimalCount((animalsRes.data?.data?.animals || []).length);

      const items = stockRes.data?.data?.items || [];
      const total = items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0) * (item.pricePerUnit || 0),
        0
      );
      setStockValue(total);
    } catch (error) {
      Alert.alert('Error', 'Failed to load farm data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFarmData();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Farm',
      `Are you sure you want to delete "${farm?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await farmApi.deleteFarm(farmId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete farm');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!farm) {
    return <EmptyState title="Farm not found" />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Farm Header */}
      <View style={styles.farmHeader}>
        <View style={styles.farmInfo}>
          <Text style={styles.farmName}>{farm.name}</Text>
          <View style={styles.farmMeta}>
            <Ionicons name="location" size={16} color={colors.gray[500]} />
            <Text style={styles.farmMetaText}>
              {farm.location?.county || 'N/A'}
              {farm.location?.subCounty ? `, ${farm.location.subCounty}` : ''}
            </Text>
          </View>
          {farm.size?.value && (
            <View style={styles.farmMeta}>
              <Ionicons name="resize" size={16} color={colors.gray[500]} />
              <Text style={styles.farmMetaText}>
                {farm.size.value} {farm.size.unit}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.farmActions}>
          <Badge status={farm.status || 'active'} />
          {isFarmer && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => navigation.navigate('FarmEdit', { farmId })}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={18} color={colors.blue[500]} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={18} color={colors.red[500]} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="layers" size={24} color={colors.primary[500]} />
          <Text style={styles.statValue}>{fields.length}</Text>
          <Text style={styles.statLabel}>Fields</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="paw" size={24} color={colors.yellow[500]} />
          <Text style={styles.statValue}>{animalCount}</Text>
          <Text style={styles.statLabel}>Animals</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="cube" size={24} color={colors.blue[500]} />
          <Text style={styles.statValueSmall}>KES {formatNumber(stockValue)}</Text>
          <Text style={styles.statLabel}>Stock</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="notifications" size={24} color={colors.red[500]} />
          <Text style={styles.statValue}>
            {alerts.filter((a) => !a.isRead).length}
          </Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </Card>
      </View>

      {/* Fields */}
      <Card
        title="Fields"
        style={styles.fieldsCard}
        footer={
          isFarmer ? (
            <Button
              size="sm"
              onPress={() => navigation.navigate('FieldCreate', { farmId })}
            >
              <Ionicons name="add" size={16} color={colors.white} /> Add Field
            </Button>
          ) : null
        }
      >
        {fields.length === 0 ? (
          <Text style={styles.emptyText}>No fields yet</Text>
        ) : (
          <View style={styles.fieldsList}>
            {fields.map((field) => (
              <TouchableOpacity
                key={field._id}
                style={styles.fieldItem}
                onPress={() => navigation.navigate('FieldDetail', { fieldId: field._id })}
              >
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldName}>{field.name}</Text>
                  <Text style={styles.fieldCrop}>{field.crop || 'No crop'}</Text>
                </View>
                <Badge status={field.status || 'active'} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmInfo: {
    flex: 1,
    gap: 4,
  },
  farmName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  farmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmMetaText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  farmActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  fieldsCard: {
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  fieldsList: {
    gap: spacing.xs,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
  },
  fieldInfo: {
    flex: 1,
    gap: 2,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[900],
  },
  fieldCrop: {
    fontSize: 14,
    color: colors.gray[500],
  },
});