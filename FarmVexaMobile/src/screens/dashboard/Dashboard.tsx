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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { alertApi, animalApi, inventoryApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatNumber } from '../../utils/formatters';
import { Farm } from '../../types';

export default function Dashboard() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loading: farmsLoading, loadFarms, setActiveFarm } = useFarms();
  
  const [alerts, setAlerts] = useState<any[]>([]);
  const [animalCount, setAnimalCount] = useState(0);
  const [stockValue, setStockValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFarmPicker, setShowFarmPicker] = useState(false);

  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (activeFarm) {
      loadDashboardData();
    }
  }, [activeFarm?._id]);

  const loadDashboardData = async () => {
    if (!activeFarm?._id) return;

    setLoading(true);
    try {
      const [alertsRes, animalsRes, stockRes] = await Promise.all([
        alertApi.getAlerts(activeFarm._id).catch(() => ({ data: { data: { alerts: [] } } })),
        animalApi.getAnimals(activeFarm._id).catch(() => ({ data: { data: { animals: [] } } })),
        inventoryApi.getInventory(activeFarm._id).catch(() => ({ data: { data: { items: [] } } })),
      ]);

      const unreadAlerts = (alertsRes.data?.data?.alerts || []).filter((a: any) => !a.isRead);
      setAlerts(unreadAlerts);

      const animals = animalsRes.data?.data?.animals || [];
      setAnimalCount(animals.length);

      const items = stockRes.data?.data?.items || [];
      const totalValue = items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 0) * (item.pricePerUnit || 0),
        0
      );
      setStockValue(totalValue);
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFarms();
    if (activeFarm) {
      await loadDashboardData();
    }
    setRefreshing(false);
  };

  const handleFarmSelect = (farm: Farm) => {
    setActiveFarm(farm);
    setShowFarmPicker(false);
  };

  if (farmsLoading && farms.length === 0) {
    return <Spinner size="lg" />;
  }

  if (isFarmer && farms.length === 0) {
    return (
      <EmptyState
        icon="leaf-outline"
        title="Welcome to FarmVexa!"
        description="Create your first farm to start monitoring your crops with AI."
        actionLabel="Create Farm"
        onAction={() => navigation.navigate('Farms', { screen: 'FarmCreate' })}
      />
    );
  }

  if (!isFarmer && !activeFarm) {
    return (
      <EmptyState
        icon="leaf-outline"
        title="No farm assigned"
        description="Contact your farm administrator to be assigned to a farm."
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcomeText}>
            Welcome, {user?.name?.split(' ')[0]}!
          </Text>
          <Text style={styles.roleText}>
            {user?.role || 'Farmer'} Dashboard
          </Text>
        </View>
        {isFarmer && farms.length > 1 && (
          <TouchableOpacity
            style={styles.farmSelector}
            onPress={() => setShowFarmPicker(true)}
          >
            <Text style={styles.farmSelectorText} numberOfLines={1}>
              {activeFarm?.name || 'Select Farm'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
        {!isFarmer && activeFarm && (
          <View style={styles.assignedFarm}>
            <Ionicons name="location" size={16} color={colors.gray[500]} />
            <Text style={styles.assignedFarmText} numberOfLines={1}>
              {activeFarm.name}
            </Text>
          </View>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="leaf" size={32} color={colors.primary[500]} />
          <Text style={styles.statValue}>{isFarmer ? farms.length : 1}</Text>
          <Text style={styles.statLabel}>{isFarmer ? 'Farms' : 'Farm'}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="notifications" size={32} color={colors.red[500]} />
          <Text style={styles.statValue}>{alerts.length}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="paw" size={32} color={colors.yellow[500]} />
          <Text style={styles.statValue}>{animalCount}</Text>
          <Text style={styles.statLabel}>Animals</Text>
        </Card>

        <Card style={styles.statCard}>
          <Ionicons name="cube" size={32} color={colors.blue[500]} />
          <Text style={styles.statValueSmall}>KES {formatNumber(stockValue)}</Text>
          <Text style={styles.statLabel}>Stock Value</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={styles.card}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Scan')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="camera" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.quickActionText}>Scan Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Operations')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="chatbubble" size={24} color={colors.blue[500]} />
            </View>
            <Text style={styles.quickActionText}>AI Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Operations')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="cube" size={24} color={colors.primary[600]} />
            </View>
            <Text style={styles.quickActionText}>Production</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Operations')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.orange[100] }]}>
              <Ionicons name="warning" size={24} color={colors.orange[500]} />
            </View>
            <Text style={styles.quickActionText}>Alerts</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Recent Alerts */}
      <Card title="Recent Alerts" style={styles.card}>
        {alerts.length === 0 ? (
          <Text style={styles.emptyText}>No unread alerts</Text>
        ) : (
          <View style={styles.alertsList}>
            {alerts.slice(0, 4).map((alert) => (
              <View key={alert._id} style={styles.alertItem}>
                <Badge status={alert.severity} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {alert.message}
                  </Text>
                  <Text style={styles.alertDate}>
                    {formatDate(alert.createdAt, 'relative')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Active Farm */}
      {activeFarm && (
        <Card title="Active Farm" style={styles.card}>
          <View style={styles.farmSummary}>
            <View style={styles.farmInfo}>
              <Text style={styles.farmName}>{activeFarm.name}</Text>
              {activeFarm.location?.county && (
                <Text style={styles.farmLocation}>
                  📍 {activeFarm.location.county}
                  {activeFarm.location.subCounty ? `, ${activeFarm.location.subCounty}` : ''}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Farms', {
                  screen: 'FarmDetail',
                  params: { farmId: activeFarm._id },
                })
              }
            >
              <Ionicons name="arrow-forward" size={24} color={colors.gray[400]} />
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Farm Picker Modal */}
      <Modal
        open={showFarmPicker}
        onClose={() => setShowFarmPicker(false)}
        title="Select Farm"
        size="sm"
      >
        <View style={styles.farmList}>
          {farms.map((farm) => (
            <TouchableOpacity
              key={farm._id}
              style={[
                styles.farmOption,
                activeFarm?._id === farm._id && styles.farmOptionSelected,
              ]}
              onPress={() => handleFarmSelect(farm)}
            >
              <Text
                style={[
                  styles.farmOptionText,
                  activeFarm?._id === farm._id && styles.farmOptionTextSelected,
                ]}
              >
                {farm.name}
              </Text>
              {activeFarm?._id === farm._id && (
                <Ionicons name="checkmark" size={20} color={colors.primary[500]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  roleText: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 2,
    textTransform: 'capitalize',
  },
  farmSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    maxWidth: 150,
  },
  farmSelectorText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
    flex: 1,
  },
  assignedFarm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: 150,
  },
  assignedFarmText: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
    flex: 1,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  statValueSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  card: {
    marginBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    gap: spacing.xs,
    width: '22%',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  alertContent: {
    flex: 1,
    gap: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.gray[700],
  },
  alertDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
  farmSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  farmInfo: {
    flex: 1,
    gap: 4,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  farmLocation: {
    fontSize: 14,
    color: colors.gray[500],
  },
  farmList: {
    gap: spacing.sm,
  },
  farmOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  farmOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  farmOptionText: {
    fontSize: 16,
    color: colors.gray[700],
  },
  farmOptionTextSelected: {
    color: colors.primary[500],
    fontWeight: '600',
  },
});