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
import { alertApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function AlertList() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'All Alerts' },
    { value: 'unread', label: 'Unread' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  useEffect(() => {
    if (!isFarmer && user?.farm) {
      setFarmId(user.farm);
    } else if (isFarmer && farms.length > 0) {
      setFarmId(activeFarm?._id || farms[0]._id);
    }
  }, [user, farms, activeFarm]);

  useEffect(() => {
    if (farmId) {
      loadAlerts();
    }
  }, [farmId]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertApi.getAlerts(farmId);
      setAlerts(res.data.data?.alerts || []);
    } catch (error) {
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
  };

  const handleMarkRead = async (id: string) => {
    try {
      await alertApi.markRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark alert as read');
    }
  };

  const handleMarkAllRead = async () => {
    const unreadAlerts = alerts.filter((a) => !a.isRead);
    if (unreadAlerts.length === 0) return;

    Alert.alert(
      'Mark All Read',
      `Mark ${unreadAlerts.length} alerts as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            try {
              for (const alert of unreadAlerts) {
                await alertApi.markRead(alert._id);
              }
              await loadAlerts();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark alerts as read');
            }
          },
        },
      ]
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.isRead;
    if (filter === 'low') return alert.severity === 'low';
    if (filter === 'medium') return alert.severity === 'medium';
    if (filter === 'high') return alert.severity === 'high';
    if (filter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  if (loading) {
    return <Spinner size="lg" />;
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
        <View>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Farm Selector */}
      {isFarmer && (
        <Select
          label="Farm"
          value={farmId}
          onChange={setFarmId}
          options={farms.map((f) => ({ value: f._id, label: f.name }))}
          placeholder="Select Farm"
        />
      )}

      {/* Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterButton, filter === f.value && styles.filterButtonActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title="No alerts"
          description="You're all caught up!"
        />
      ) : (
        <View style={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <Card
              key={alert._id}
              style={[
                styles.alertCard,
                !alert.isRead && styles.alertUnread,
              ]}
            >
              <View style={styles.alertHeader}>
                <Badge status={alert.severity} />
                {!alert.isRead && (
                  <TouchableOpacity onPress={() => handleMarkRead(alert._id)}>
                    <Text style={styles.markReadText}>Mark Read</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <View style={styles.alertFooter}>
                <Ionicons name="time" size={14} color={colors.gray[400]} />
                <Text style={styles.alertDate}>
                  {formatDate(alert.createdAt, 'relative')}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  markAllText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '600',
  },
  filterBar: {
    flexGrow: 0,
  },
  filterBarContent: {
    gap: spacing.xs,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  filterText: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  alertsList: {
    gap: spacing.sm,
  },
  alertCard: {
    gap: spacing.sm,
  },
  alertUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.red[500],
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  markReadText: {
    fontSize: 12,
    color: colors.primary[500],
  },
  alertMessage: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  alertDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
});