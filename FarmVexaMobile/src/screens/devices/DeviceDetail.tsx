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
import { deviceApi, sensorApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function DeviceDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deviceId } = route.params;
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';

  const [device, setDevice] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [deviceId]);

  const loadData = async () => {
    try {
      const [deviceRes, readingsRes] = await Promise.all([
        deviceApi.getDevice(deviceId),
        sensorApi.getDeviceReadings(deviceId),
      ]);
      setDevice(deviceRes.data.data.device);
      setReadings(readingsRes.data.data.readings || []);
    } catch (error) {
      setDevice(null);
      setReadings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleDelete = () => {
    Alert.alert('Delete Device', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deviceApi.deleteDevice(deviceId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete device');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!device) {
    return <EmptyState title="Device not found" />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Device Header */}
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.deviceType}>{device.type}</Text>
          {device.serialNumber && (
            <Text style={styles.deviceSerial}>SN: {device.serialNumber}</Text>
          )}
        </View>
        <Badge status={device.status || 'offline'} />
      </View>

      {/* Device Stats */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Ionicons name="pulse" size={24} color={colors.primary[500]} />
          <Text style={styles.statValue}>{readings.length}</Text>
          <Text style={styles.statLabel}>Readings</Text>
        </Card>
        <Card style={styles.statCard}>
          <Ionicons name="time" size={24} color={colors.blue[500]} />
          <Text style={styles.statValueSmall}>
            {device.lastReading ? formatDate(device.lastReading, 'relative') : 'N/A'}
          </Text>
          <Text style={styles.statLabel}>Last Reading</Text>
        </Card>
      </View>

      {/* Actions */}
      {isFarmer && (
        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={() => navigation.navigate('DeviceEdit', { deviceId })}
            style={styles.actionButton}
          >
            <Ionicons name="pencil" size={16} color={colors.blue[500]} /> Edit
          </Button>
          <Button
            variant="outline"
            onPress={handleDelete}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={16} color={colors.red[500]} /> Delete
          </Button>
        </View>
      )}

      {/* Latest Readings */}
      <Card title="Latest Readings" style={styles.readingsCard}>
        {readings.length === 0 ? (
          <Text style={styles.emptyText}>No readings yet</Text>
        ) : (
          <View style={styles.readingsList}>
            {readings.slice(0, 10).map((reading, index) => (
              <View key={reading._id || index} style={styles.readingItem}>
                <View style={styles.readingInfo}>
                  <Text style={styles.readingType}>{reading.type}</Text>
                  <Text style={styles.readingTime}>
                    {formatDate(reading.timestamp, 'time')}
                  </Text>
                </View>
                <Text style={styles.readingValue}>
                  {reading.value} {reading.unit}
                </Text>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deviceInfo: {
    flex: 1,
    gap: 2,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  deviceType: {
    fontSize: 14,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  deviceSerial: {
    fontSize: 12,
    color: colors.gray[400],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  readingsCard: {
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray[400],
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  readingsList: {
    gap: spacing.xs,
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  readingInfo: {
    flex: 1,
    gap: 2,
  },
  readingType: {
    fontSize: 14,
    color: colors.gray[600],
    textTransform: 'capitalize',
  },
  readingTime: {
    fontSize: 12,
    color: colors.gray[400],
  },
  readingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
});