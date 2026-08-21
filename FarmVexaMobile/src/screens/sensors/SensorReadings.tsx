import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { fieldApi, sensorApi, deviceApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTemperature } from '../../utils/formatters';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function SensorReadings() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [activeTab, setActiveTab] = useState<'field' | 'storage' | 'virtual'>('field');
  const [farmId, setFarmId] = useState('');
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [storageDevices, setStorageDevices] = useState<any[]>([]);
  const [storageDeviceId, setStorageDeviceId] = useState('');
  const [storageReadings, setStorageReadings] = useState<any[]>([]);

  const [virtualDevices, setVirtualDevices] = useState<any[]>([]);
  const [virtualDeviceId, setVirtualDeviceId] = useState('');
  const [virtualReadings, setVirtualReadings] = useState<any[]>([]);
  const [showVirtualTab, setShowVirtualTab] = useState(false);

  const hasIotAccess = ['Pro', 'Full Suite'].includes(user?.selectedPlan || '');
  const hasStorageAccess = user?.selectedPlan === 'Full Suite';

  useEffect(() => {
    if (!hasIotAccess) return;
    
    if (isFarmer) {
      loadFarms();
    } else if (user?.farm) {
      setFarmId(user.farm);
      loadFields(user.farm);
      fetchStorageDevices(user.farm);
    }
    fetchVirtualDevices();
  }, [user, hasIotAccess]);

  useEffect(() => {
    if (selectedFieldId && activeTab === 'field' && hasIotAccess) {
      loadFieldReadings();
    }
  }, [selectedFieldId, activeTab, hasIotAccess]);

  useEffect(() => {
    if (storageDeviceId && activeTab === 'storage' && hasStorageAccess) {
      loadStorageReadings();
    }
  }, [storageDeviceId, activeTab, hasStorageAccess]);

  useEffect(() => {
    if (virtualDeviceId && activeTab === 'virtual') {
      loadVirtualReadings();
    }
  }, [virtualDeviceId, activeTab]);

  const loadFields = async (farmId: string) => {
    try {
      const res = await fieldApi.getFields(farmId);
      setFields(res.data.data?.fields || []);
    } catch (error) {
      setFields([]);
    }
  };

  const fetchStorageDevices = async (farmId: string) => {
    try {
      const res = await deviceApi.getDevices(farmId);
      const devices = res.data.data?.devices || [];
      setStorageDevices(devices.filter((d: any) => d.zone === 'storage'));
    } catch (error) {
      setStorageDevices([]);
    }
  };

  const fetchVirtualDevices = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/farm/devices/virtual`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const devices = res.data.data?.devices || [];
      setVirtualDevices(devices);
      setShowVirtualTab(devices.length > 0);

      if (devices.length > 0) {
        setVirtualDeviceId(devices[0]._id);
        const readingsRes = await axios.get(`${API_URL}/farm/sensors/device/${devices[0]._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVirtualReadings(readingsRes.data.data?.readings || []);
      }
    } catch (error) {
      setVirtualDevices([]);
      setShowVirtualTab(false);
    }
  };

  const loadFieldReadings = async () => {
    setLoading(true);
    try {
      const res = await sensorApi.getFieldReadings(selectedFieldId, 50);
      setReadings(res.data.data?.readings || []);
    } catch (error) {
      setReadings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStorageReadings = async () => {
    setLoading(true);
    try {
      const res = await sensorApi.getDeviceReadings(storageDeviceId, 50);
      setStorageReadings(res.data.data?.readings || []);
    } catch (error) {
      setStorageReadings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadVirtualReadings = async () => {
    setLoading(true);
    try {
      const res = await sensorApi.getDeviceReadings(virtualDeviceId, 50);
      setVirtualReadings(res.data.data?.readings || []);
    } catch (error) {
      setVirtualReadings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'field' && selectedFieldId) {
      await loadFieldReadings();
    } else if (activeTab === 'storage' && storageDeviceId) {
      await loadStorageReadings();
    } else if (activeTab === 'virtual' && virtualDeviceId) {
      await loadVirtualReadings();
    } else {
      setRefreshing(false);
    }
  };

  const handleFarmChange = (farmId: string) => {
    setFarmId(farmId);
    setSelectedFieldId('');
    setReadings([]);
    setStorageDevices([]);
    setStorageDeviceId('');
    setStorageReadings([]);
    loadFields(farmId);
    fetchStorageDevices(farmId);
  };

  const latest = readings[0];
  const prev = readings[1];
  const storageLatest = storageReadings[0];
  const virtualLatest = virtualReadings[0];

  if (!hasIotAccess) {
    return (
      <View style={styles.noAccessContainer}>
        <Ionicons name="warning" size={64} color={colors.yellow[500]} />
        <Text style={styles.noAccessTitle}>Feature Not Available</Text>
        <Text style={styles.noAccessText}>
          Your plan ({user?.selectedPlan || 'Basic'}) does not include IoT Sensors.
          Upgrade to Pro or Full Suite to monitor field conditions.
        </Text>
        <Button onPress={() => navigation.navigate('Settings', { screen: 'Plans' })}>
          Upgrade Plan
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Sensor Readings</Text>
      <Text style={styles.subtitle}>Monitor field and storage conditions in real-time</Text>

      {/* Tab Switch */}
      <View style={styles.tabSwitch}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'field' && styles.tabButtonActive]}
          onPress={() => setActiveTab('field')}
        >
          <Ionicons name="pulse" size={18} color={activeTab === 'field' ? colors.white : colors.gray[600]} />
          <Text style={[styles.tabText, activeTab === 'field' && styles.tabTextActive]}>Field</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'storage' && styles.tabButtonActive]}
          onPress={() => setActiveTab('storage')}
        >
          <Ionicons name="cube" size={18} color={activeTab === 'storage' ? colors.white : colors.gray[600]} />
          <Text style={[styles.tabText, activeTab === 'storage' && styles.tabTextActive]}>Storage</Text>
        </TouchableOpacity>

        {showVirtualTab && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'virtual' && styles.tabButtonActive]}
            onPress={() => setActiveTab('virtual')}
          >
            <Ionicons name="sparkles" size={18} color={activeTab === 'virtual' ? colors.white : colors.gray[600]} />
            <Text style={[styles.tabText, activeTab === 'virtual' && styles.tabTextActive]}>Virtual</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* VIRTUAL TAB */}
      {activeTab === 'virtual' && (
        <>
          <Card style={styles.card}>
            <Select
              label="Virtual Device"
              value={virtualDeviceId}
              onChange={setVirtualDeviceId}
              options={virtualDevices.map((d) => ({
                value: d._id,
                label: d.farm?.name ? `${d.farm.name} — ${d.name}` : d.name,
              }))}
              placeholder="Select Virtual Device"
            />
          </Card>

          {loading ? (
            <Spinner size="lg" />
          ) : !virtualDeviceId ? (
            <EmptyState icon="sparkles-outline" title="Select a virtual device" />
          ) : virtualReadings.length === 0 ? (
            <EmptyState icon="sparkles-outline" title="No readings yet" description="The scheduler will generate readings soon." />
          ) : (
            <>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                  <Text style={styles.statValue}>{formatTemperature(virtualLatest?.temperature)}</Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="water" size={20} color={colors.blue[500]} />
                  <Text style={styles.statValue}>{virtualLatest?.humidity ? `${virtualLatest.humidity}%` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="leaf" size={20} color={colors.primary[500]} />
                  <Text style={styles.statValue}>{virtualLatest?.soilMoisture ? `${virtualLatest.soilMoisture}%` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Soil Moisture</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="sunny" size={20} color={colors.yellow[500]} />
                  <Text style={styles.statValue}>{virtualLatest?.lightLevel || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Light Level</Text>
                </Card>
              </View>

              <Card title="Virtual Reading History" style={styles.card}>
                {virtualReadings.map((r, i) => (
                  <View key={i} style={styles.readingRow}>
                    <Text style={styles.readingTime}>{formatDate(r.timestamp, 'time')}</Text>
                    <Text style={styles.readingValue}>
                      {formatTemperature(r.temperature)} | {r.humidity || 'N/A'}% | {r.soilMoisture || 'N/A'}% | {r.lightLevel || 'N/A'}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}

      {/* FIELD TAB */}
      {activeTab === 'field' && (
        <>
          <Card style={styles.card}>
            {isFarmer ? (
              <>
                <Select
                  label="Farm"
                  value={farmId}
                  onChange={handleFarmChange}
                  options={farms.map((f) => ({ value: f._id, label: f.name }))}
                  placeholder="Select Farm"
                />
                <Select
                  label="Field"
                  value={selectedFieldId}
                  onChange={setSelectedFieldId}
                  options={fields.map((f) => ({ value: f._id, label: f.name }))}
                  placeholder="Select Field"
                />
              </>
            ) : (
              <>
                <Text style={styles.assignedFarm}>📍 {activeFarm?.name || 'Assigned Farm'}</Text>
                <Select
                  label="Field"
                  value={selectedFieldId}
                  onChange={setSelectedFieldId}
                  options={fields.map((f) => ({ value: f._id, label: f.name }))}
                  placeholder="Select Field"
                />
              </>
            )}
          </Card>

          {loading ? (
            <Spinner size="lg" />
          ) : !selectedFieldId ? (
            <EmptyState icon="pulse-outline" title="Select a field" />
          ) : readings.length === 0 ? (
            <EmptyState icon="pulse-outline" title="No readings yet" />
          ) : (
            <>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                  <Text style={styles.statValue}>{formatTemperature(latest?.temperature)}</Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="water" size={20} color={colors.blue[500]} />
                  <Text style={styles.statValue}>{latest?.humidity ? `${latest.humidity}%` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="leaf" size={20} color={colors.primary[500]} />
                  <Text style={styles.statValue}>{latest?.soilMoisture ? `${latest.soilMoisture}%` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Soil Moisture</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="sunny" size={20} color={colors.yellow[500]} />
                  <Text style={styles.statValue}>{latest?.lightLevel || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Light Level</Text>
                </Card>
              </View>

              <Card title="Reading History" style={styles.card}>
                {readings.map((r, i) => (
                  <View key={i} style={styles.readingRow}>
                    <Text style={styles.readingTime}>{formatDate(r.timestamp, 'time')}</Text>
                    <Text style={styles.readingValue}>
                      {formatTemperature(r.temperature)} | {r.humidity || 'N/A'}% | {r.soilMoisture || 'N/A'}% | {r.lightLevel || 'N/A'}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}

      {/* STORAGE TAB */}
      {activeTab === 'storage' && !hasStorageAccess && (
        <View style={styles.noAccessContainer}>
          <Ionicons name="warning" size={64} color={colors.yellow[500]} />
          <Text style={styles.noAccessTitle}>Storage Monitoring Not Available</Text>
          <Text style={styles.noAccessText}>
            Your plan ({user?.selectedPlan}) does not include Storage Monitoring.
          </Text>
          <Button onPress={() => navigation.navigate('Settings', { screen: 'Plans' })}>
            Upgrade Plan
          </Button>
        </View>
      )}

      {activeTab === 'storage' && hasStorageAccess && (
        <>
          <Card style={styles.card}>
            <Select
              label="Storage Device"
              value={storageDeviceId}
              onChange={setStorageDeviceId}
              options={storageDevices.map((d) => ({
                value: d._id,
                label: `${d.deviceId || d.name} (${d.sensorType || 'dht'})`,
              }))}
              placeholder="Select Storage Device"
            />
          </Card>

          {loading ? (
            <Spinner size="lg" />
          ) : !storageDeviceId ? (
            <EmptyState icon="cube-outline" title="Select a storage device" />
          ) : storageReadings.length === 0 ? (
            <EmptyState icon="cube-outline" title="No readings yet" />
          ) : (
            <>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                  <Text style={styles.statValue}>{formatTemperature(storageLatest?.temperature)}</Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="water" size={20} color={colors.blue[500]} />
                  <Text style={styles.statValue}>{storageLatest?.humidity ? `${storageLatest.humidity}%` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="bug" size={20} color="#9333ea" />
                  <Text style={styles.statValue}>{storageLatest?.co2 ? `${storageLatest.co2} ppm` : 'N/A'}</Text>
                  <Text style={styles.statLabel}>CO2 Level</Text>
                </Card>
                <Card style={styles.statCard}>
                  <Ionicons name="paw" size={20} color={colors.orange[500]} />
                  <Text style={styles.statValue}>{storageLatest?.motion ? 'Detected' : 'None'}</Text>
                  <Text style={styles.statLabel}>Motion (Rats)</Text>
                </Card>
              </View>

              <Card title="Storage Reading History" style={styles.card}>
                {storageReadings.map((r, i) => (
                  <View key={i} style={styles.readingRow}>
                    <Text style={styles.readingTime}>{formatDate(r.timestamp, 'time')}</Text>
                    <Text style={styles.readingValue}>
                      {formatTemperature(r.temperature)} | {r.humidity || 'N/A'}% | {r.co2 || 'N/A'} ppm | {r.motion ? '🐀' : 'Clear'}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.md, gap: spacing.md },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.gray[900] },
  subtitle: { fontSize: 14, color: colors.gray[500] },
  tabSwitch: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  tabButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.md, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  tabButtonActive: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  tabText: { fontSize: 14, color: colors.gray[600], fontWeight: '500' },
  tabTextActive: { color: colors.white },
  card: { gap: spacing.md },
  assignedFarm: { fontSize: 14, color: colors.gray[700], fontWeight: '500' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { flex: 1, minWidth: '45%', alignItems: 'center', padding: spacing.md },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900], marginTop: spacing.xs },
  statLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  readingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  readingTime: { fontSize: 12, color: colors.gray[400] },
  readingValue: { fontSize: 12, color: colors.gray[600] },
  noAccessContainer: { alignItems: 'center', gap: spacing.md, padding: spacing.xl },
  noAccessTitle: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900], textAlign: 'center' },
  noAccessText: { fontSize: 14, color: colors.gray[500], textAlign: 'center' },
});