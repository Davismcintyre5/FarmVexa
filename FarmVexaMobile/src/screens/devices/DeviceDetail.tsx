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
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTemperature } from '../../utils/formatters';

export default function DeviceDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { deviceId } = route.params;
  const { user } = useAuth();
  const canManage = ['farmer', 'manager'].includes(user?.role);

  const [device, setDevice] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [deviceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deviceRes, readingsRes] = await Promise.all([
        deviceApi.getDevice(deviceId),
        sensorApi.getDeviceReadings(deviceId, 5),
      ]);
      setDevice(deviceRes.data.data?.device || deviceRes.data?.device);
      setReadings(readingsRes.data.data?.readings || []);
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

  if (loading || !device) {
    return <Spinner size="lg" />;
  }

  const isVirtual = device.isVirtualDevice || device.isVirtual;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.card}>
        {/* Device Header */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.deviceName}>{device.deviceId || device.name}</Text>
              {isVirtual && (
                <View style={styles.virtualBadge}>
                  <Text style={styles.virtualText}>Virtual</Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="location" size={14} color={colors.gray[400]} />
              <Text style={styles.metaText}>
                {isVirtual
                  ? device.farm?.name || 'Farm'
                  : device.zone === 'storage'
                  ? 'Storage'
                  : device.field?.name || 'Unassigned'}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="hardware-chip" size={14} color={colors.gray[400]} />
              <Text style={styles.metaText}>{device.sensorType || 'dht'} sensor</Text>
            </View>
          </View>
          <Badge status={device.status} />
        </View>

        {/* Virtual Device Info */}
        {isVirtual ? (
          <View style={styles.virtualInfo}>
            <View style={styles.virtualInfoRow}>
              <Ionicons name="sparkles" size={16} color={colors.blue[600]} />
              <Text style={styles.virtualInfoText}>
                Auto-generated from weather + location
              </Text>
            </View>
            {device.lastReadingAt && (
              <Text style={styles.lastReadingText}>
                Last reading: {formatDate(device.lastReadingAt, 'relative')}
              </Text>
            )}
          </View>
        ) : (
          <>
            {/* Physical Device Info */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="battery-full" size={16} color={colors.primary[500]} />
                <Text style={styles.statText}>{device.batteryLevel || '?'}%</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="wifi" size={16} color={colors.blue[500]} />
                <Text style={styles.statText}>
                  {device.status === 'online' ? 'Connected' : 'Offline'}
                </Text>
              </View>
            </View>
            <Text style={styles.metaText}>Last seen: {formatDate(device.lastSeen)}</Text>
            <Text style={styles.metaText}>Firmware: {device.firmwareVersion || 'N/A'}</Text>
          </>
        )}

        {/* Actions */}
        {canManage && !isVirtual && (
          <View style={styles.actions}>
            <Button variant="outline" onPress={() => navigation.goBack()} style={styles.flex1}>
              Back
            </Button>
            <Button variant="ghost" onPress={handleDelete} style={styles.deleteButton}>
              <Ionicons name="trash" size={18} color={colors.red[500]} />
            </Button>
          </View>
        )}
        {isVirtual && (
          <Button variant="outline" onPress={() => navigation.goBack()} fullWidth>
            Back
          </Button>
        )}
      </Card>

      {/* Readings */}
      {readings.length > 0 ? (
        <Card title="Recent Readings" style={styles.card}>
          {readings.map((reading, index) => (
            <View key={index} style={styles.readingRow}>
              <Text style={styles.readingTime}>
                {formatDate(reading.timestamp, 'time')}
              </Text>
              <View style={styles.readingValues}>
                {reading.temperature !== undefined && (
                  <Text style={styles.readingValue}>{formatTemperature(reading.temperature)}</Text>
                )}
                {reading.humidity !== undefined && (
                  <Text style={styles.readingValue}>{reading.humidity}%</Text>
                )}
                {reading.soilMoisture !== undefined && (
                  <Text style={styles.readingValue}>{reading.soilMoisture}%</Text>
                )}
                {reading.co2 !== undefined && (
                  <Text style={styles.readingValue}>{reading.co2} ppm</Text>
                )}
                {reading.motion !== undefined && (
                  <Text style={styles.readingValue}>{reading.motion ? '🐀 Motion' : ''}</Text>
                )}
              </View>
            </View>
          ))}
        </Card>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.noReadingsText}>
            No readings yet. Scheduler will generate readings soon.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md },
  card: { gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  deviceName: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900] },
  virtualBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: borderRadius.full, backgroundColor: colors.blue[100],
  },
  virtualText: { fontSize: 10, fontWeight: '600', color: colors.blue[700] },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: colors.gray[500], textTransform: 'capitalize' },
  virtualInfo: { gap: 4, padding: spacing.sm, backgroundColor: colors.blue[50], borderRadius: borderRadius.md },
  virtualInfoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  virtualInfoText: { fontSize: 13, color: colors.blue[600], flex: 1 },
  lastReadingText: { fontSize: 12, color: colors.gray[400] },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, color: colors.gray[700] },
  actions: { flexDirection: 'row', gap: spacing.sm },
  flex1: { flex: 1 },
  deleteButton: { paddingHorizontal: spacing.md },
  readingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  readingTime: { fontSize: 12, color: colors.gray[400] },
  readingValues: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  readingValue: { fontSize: 13, color: colors.gray[700], fontWeight: '500' },
  noReadingsText: { fontSize: 13, color: colors.gray[400], textAlign: 'center', paddingVertical: spacing.md },
});