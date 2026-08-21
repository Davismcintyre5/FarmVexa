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
import { deviceApi, publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function DeviceList() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const isFarmer = user?.role === 'farmer';
  const canManage = ['farmer', 'manager'].includes(user?.role);

  const [devices, setDevices] = useState<any[]>([]);
  const [virtualDevices, setVirtualDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [virtualEnabled, setVirtualEnabled] = useState(false);

  const hasIotAccess = ['Pro', 'Full Suite'].includes(user?.selectedPlan || '');

  useEffect(() => {
    if (!hasIotAccess) {
      setLoading(false);
      return;
    }

    loadSettings();
    loadPhysicalDevices();
    loadVirtualDevices();
  }, [user, hasIotAccess]);

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      // Check admin settings for virtual devices
      setVirtualEnabled(res.data.data?.virtualDevicesEnabled !== false);
    } catch (error) {
      setVirtualEnabled(false);
    }
  };

  const loadPhysicalDevices = async () => {
    try {
      if (isFarmer) {
        const allDevices: any[] = [];
        for (const farm of farms) {
          try {
            const res = await deviceApi.getDevices(farm._id);
            allDevices.push(...(res.data.data?.devices || []));
          } catch (error) {
            // Skip failed farm
          }
        }
        setDevices(allDevices);
      } else if (user?.farm) {
        const res = await deviceApi.getDevices(user.farm);
        setDevices(res.data.data?.devices || []);
      } else {
        setDevices([]);
      }
    } catch (error) {
      setDevices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadVirtualDevices = async () => {
    if (!virtualEnabled) {
      setVirtualDevices([]);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/farm/devices/virtual`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVirtualDevices(res.data.data?.devices || []);
    } catch (error) {
      setVirtualDevices([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPhysicalDevices();
    await loadVirtualDevices();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Device', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deviceApi.deleteDevice(id);
            setDevices((prev) => prev.filter((d) => d._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete device');
          }
        },
      },
    ]);
  };

  const getZoneColor = (zone: string) => {
    const zoneColors: Record<string, string> = {
      field: '#dcfce7',
      storage: '#fef9c3',
      greenhouse: '#dbeafe',
      livestock: '#f3e8ff',
    };
    return zoneColors[zone] || '#dcfce7';
  };

  const getZoneTextColor = (zone: string) => {
    const zoneTextColors: Record<string, string> = {
      field: '#166534',
      storage: '#854d0e',
      greenhouse: '#1e40af',
      livestock: '#6b21a8',
    };
    return zoneTextColors[zone] || '#166534';
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!hasIotAccess) {
    return (
      <View style={styles.noAccessContainer}>
        <Ionicons name="warning" size={64} color={colors.yellow[500]} />
        <Text style={styles.noAccessTitle}>Feature Not Available</Text>
        <Text style={styles.noAccessText}>
          Your plan ({user?.selectedPlan || 'Basic'}) does not include IoT Devices.
        </Text>
        <Button onPress={() => navigation.navigate('Settings', { screen: 'Plans' })}>
          Upgrade Plan
        </Button>
      </View>
    );
  }

  const allDevices = [
    ...devices,
    ...virtualDevices.map((v) => ({
      ...v,
      deviceId: v.name,
      isVirtualDevice: true,
    })),
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Devices</Text>
          <Text style={styles.subtitle}>
            {allDevices.length} device{allDevices.length !== 1 ? 's' : ''}
            {virtualDevices.length > 0 && ` (${virtualDevices.length} virtual)`}
          </Text>
        </View>
        {canManage && (
          <Button
            onPress={() => navigation.navigate('DeviceRegister', { farmId: activeFarm?._id || farms[0]?._id })}
            size="sm"
          >
            <Ionicons name="add" size={18} color={colors.white} /> Register
          </Button>
        )}
      </View>

      {/* Devices List */}
      {allDevices.length === 0 ? (
        <EmptyState
          icon="hardware-chip-outline"
          title="No devices"
          description={canManage ? 'Register an ESP32 sensor node.' : 'No devices registered.'}
        />
      ) : (
        <View style={styles.devicesList}>
          {allDevices.map((device) => (
            <TouchableOpacity
              key={device._id}
              onPress={() => navigation.navigate('DeviceDetail', { deviceId: device._id })}
            >
              <Card style={styles.deviceCard}>
                <View style={styles.deviceHeader}>
                  <View style={styles.deviceInfo}>
                    <View style={styles.deviceIdRow}>
                      <Text style={styles.deviceId}>{device.deviceId || device.name}</Text>
                      {device.isVirtualDevice ? (
                        <View style={styles.virtualBadge}>
                          <Text style={styles.virtualBadgeText}>Virtual</Text>
                        </View>
                      ) : (
                        device.zone && (
                          <View style={[styles.zoneBadge, { backgroundColor: getZoneColor(device.zone) }]}>
                            <Text style={[styles.zoneText, { color: getZoneTextColor(device.zone) }]}>
                              {device.zone}
                            </Text>
                          </View>
                        )
                      )}
                      {device.sensorType && (
                        <View style={styles.sensorBadge}>
                          <Text style={styles.sensorText}>{device.sensorType}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.lastSeen}>
                      {device.isVirtualDevice
                        ? 'Auto-generated from weather + location'
                        : `Last seen: ${formatDate(device.lastSeen, 'relative')}`}
                    </Text>
                  </View>
                  <View style={styles.deviceActions}>
                    <Badge status={device.status} />
                    {!device.isVirtualDevice && (
                      <Text style={styles.batteryText}>{device.batteryLevel || '?'}%</Text>
                    )}
                    {device.isVirtualDevice && (
                      <Ionicons name="wifi" size={16} color={colors.blue[500]} />
                    )}
                    {canManage && !device.isVirtualDevice && (
                      <TouchableOpacity onPress={() => handleDelete(device._id)}>
                        <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.gray[900] },
  subtitle: { fontSize: 14, color: colors.gray[500] },
  devicesList: { gap: spacing.sm },
  deviceCard: { gap: spacing.sm },
  deviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  deviceInfo: { flex: 1, gap: 4 },
  deviceIdRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  deviceId: { fontSize: 16, fontWeight: '600', color: colors.gray[900] },
  virtualBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: borderRadius.full, backgroundColor: colors.blue[100],
  },
  virtualBadgeText: { fontSize: 10, fontWeight: '600', color: colors.blue[700] },
  zoneBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full,
  },
  zoneText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  sensorBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: borderRadius.full, backgroundColor: colors.gray[100],
  },
  sensorText: { fontSize: 10, color: colors.gray[600] },
  lastSeen: { fontSize: 12, color: colors.gray[400] },
  deviceActions: { alignItems: 'flex-end', gap: spacing.xs },
  batteryText: { fontSize: 12, color: colors.primary[600] },
  noAccessContainer: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  noAccessTitle: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900], textAlign: 'center' },
  noAccessText: { fontSize: 14, color: colors.gray[500], textAlign: 'center' },
});