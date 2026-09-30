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
import { usePlanAccess } from '../../hooks/usePlanAccess';
import { fieldApi, sensorApi, deviceApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PlanGate from '../../components/plan/PlanGate';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTemperature } from '../../utils/formatters';

export default function SensorReadings() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  // Plan gating
  const { allowed: hasIotAccess, loading: iotLoading, planName } =
    usePlanAccess('iot_field_sensors');
  const { allowed: hasStorageAccess, loading: storageLoading } =
    usePlanAccess('storage_monitoring');

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

  useEffect(() => {
    if (iotLoading) return;
    if (!hasIotAccess) return;

    if (isFarmer) {
      loadFarms();
    } else if (user?.farm) {
      setFarmId(user.farm);
      loadFields(user.farm);
      fetchStorageDevices(user.farm);
    }
    fetchVirtualDevices();
  }, [user, hasIotAccess, iotLoading]);

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
    } catch {
      setFields([]);
    }
  };

  const fetchStorageDevices = async (farmId: string) => {
    try {
      const res = await deviceApi.getDevices(farmId);
      const devices = res.data.data?.devices || [];
      setStorageDevices(devices.filter((d: any) => d.zone === 'storage'));
    } catch {
      setStorageDevices([]);
    }
  };

  // Split fetch — readings failure must NOT hide the tab
  const fetchVirtualDevices = async () => {
    try {
      const res = await deviceApi.getVirtualDevices();
      const devices = res.data.data?.devices || [];

      // Sort by lastReadingAt descending
      const sorted = [...devices].sort((a: any, b: any) => {
        const at = new Date(a.lastReadingAt || 0).getTime();
        const bt = new Date(b.lastReadingAt || 0).getTime();
        return bt - at;
      });

      setVirtualDevices(sorted);
      setShowVirtualTab(sorted.length > 0);

      if (sorted.length > 0) {
        setVirtualDeviceId(sorted[0]._id);
        try {
          const readingsRes = await sensorApi.getDeviceReadings(sorted[0]._id, 50);
          setVirtualReadings(readingsRes.data.data?.readings || []);
        } catch {
          // Tab stays visible, readings empty
          setVirtualReadings([]);
        }
      }
    } catch {
      // Devices fetch failed — hide tab
      setVirtualDevices([]);
      setShowVirtualTab(false);
    }
  };

  const loadFieldReadings = async () => {
    setLoading(true);
    try {
      const res = await sensorApi.getFieldReadings(selectedFieldId, 50);
      setReadings(res.data.data?.readings || []);
    } catch {
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
    } catch {
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
    } catch {
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

  // ---- Derived values ----
  const latest = readings[0];
  const prev = readings[1];
  const storageLatest = storageReadings[0];
  const storagePrev = storageReadings[1];
  const virtualLatest = virtualReadings[0];
  const virtualPrev = virtualReadings[1];

  // ---- Loading / Plan gate guards ----
  if (iotLoading) return <Spinner size="lg" />;

  if (!hasIotAccess) {
    return (
      <PlanGate
        feature="iot_field_sensors"
        planName={planName}
        title="IoT Sensors Not Available"
        description={`Your plan (${planName}) does not include IoT Sensors. Upgrade to Pro or Full Suite to monitor field conditions.`}
      />
    );
  }

  // ---- Render ----
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
          <Ionicons name="pulse" size={16} color={activeTab === 'field' ? colors.white : colors.gray[600]} />
          <Text style={[styles.tabText, activeTab === 'field' && styles.tabTextActive]}>Field</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'storage' && styles.tabButtonActive]}
          onPress={() => setActiveTab('storage')}
        >
          <Ionicons name="cube" size={16} color={activeTab === 'storage' ? colors.white : colors.gray[600]} />
          <Text style={[styles.tabText, activeTab === 'storage' && styles.tabTextActive]}>Storage</Text>
        </TouchableOpacity>

        {showVirtualTab && (
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'virtual' && styles.tabButtonActive]}
            onPress={() => setActiveTab('virtual')}
          >
            <Ionicons name="sparkles" size={16} color={activeTab === 'virtual' ? colors.white : colors.gray[600]} />
            <Text style={[styles.tabText, activeTab === 'virtual' && styles.tabTextActive]}>Virtual</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ==================== VIRTUAL TAB ==================== */}
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
            <EmptyState
              icon="sparkles-outline"
              title="No readings yet"
              description="The scheduler will generate readings soon."
            />
          ) : (
            <>
              {/* Stat cards */}
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                    {virtualLatest?.temperature !== undefined && virtualPrev?.temperature !== undefined && (
                      <Ionicons
                        name={
                          virtualLatest.temperature > virtualPrev.temperature
                            ? 'trending-up'
                            : virtualLatest.temperature < virtualPrev.temperature
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          virtualLatest.temperature > virtualPrev.temperature
                            ? colors.red[500]
                            : virtualLatest.temperature < virtualPrev.temperature
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {virtualLatest?.temperature !== undefined
                      ? formatTemperature(virtualLatest.temperature)
                      : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="water" size={20} color={colors.blue[500]} />
                    {virtualLatest?.humidity !== undefined && virtualPrev?.humidity !== undefined && (
                      <Ionicons
                        name={
                          virtualLatest.humidity > virtualPrev.humidity
                            ? 'trending-up'
                            : virtualLatest.humidity < virtualPrev.humidity
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          virtualLatest.humidity > virtualPrev.humidity
                            ? colors.red[500]
                            : virtualLatest.humidity < virtualPrev.humidity
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {virtualLatest?.humidity !== undefined ? `${virtualLatest.humidity}%` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="leaf" size={20} color={colors.primary[500]} />
                    {virtualLatest?.soilMoisture !== undefined && virtualPrev?.soilMoisture !== undefined && (
                      <Ionicons
                        name={
                          virtualLatest.soilMoisture > virtualPrev.soilMoisture
                            ? 'trending-up'
                            : virtualLatest.soilMoisture < virtualPrev.soilMoisture
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          virtualLatest.soilMoisture > virtualPrev.soilMoisture
                            ? colors.red[500]
                            : virtualLatest.soilMoisture < virtualPrev.soilMoisture
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {virtualLatest?.soilMoisture !== undefined
                      ? `${virtualLatest.soilMoisture}%`
                      : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Soil Moisture</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="sunny" size={20} color={colors.yellow[500]} />
                    {virtualLatest?.lightLevel !== undefined && virtualPrev?.lightLevel !== undefined && (
                      <Ionicons
                        name={
                          virtualLatest.lightLevel > virtualPrev.lightLevel
                            ? 'trending-up'
                            : virtualLatest.lightLevel < virtualPrev.lightLevel
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          virtualLatest.lightLevel > virtualPrev.lightLevel
                            ? colors.red[500]
                            : virtualLatest.lightLevel < virtualPrev.lightLevel
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {virtualLatest?.lightLevel !== undefined ? virtualLatest.lightLevel : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Light Level</Text>
                </Card>
              </View>

              {/* History */}
              <Card title="Virtual Reading History" style={styles.card}>
                {virtualReadings.map((r, i) => (
                  <View key={i} style={styles.readingRow}>
                    <Text style={styles.readingTime}>
                      {formatDate(r.timestamp, 'time')}
                    </Text>
                    <Text style={styles.readingValue}>
                      {formatTemperature(r.temperature)} | {r.humidity ?? 'N/A'}% |{' '}
                      {r.soilMoisture ?? 'N/A'}% | {r.lightLevel || 'N/A'}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}

      {/* ==================== FIELD TAB ==================== */}
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
                <Text style={styles.assignedFarm}>
                  📍 {activeFarm?.name || 'Assigned Farm'}
                </Text>
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
            <EmptyState
              icon="pulse-outline"
              title="Select a field"
              description="Choose a farm and field to view sensor data."
            />
          ) : readings.length === 0 ? (
            <EmptyState
              icon="pulse-outline"
              title="No readings yet"
              description="No sensor data for this field. Connect a device to start monitoring."
            />
          ) : (
            <>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                    {latest?.temperature !== undefined && prev?.temperature !== undefined && (
                      <Ionicons
                        name={
                          latest.temperature > prev.temperature
                            ? 'trending-up'
                            : latest.temperature < prev.temperature
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          latest.temperature > prev.temperature
                            ? colors.red[500]
                            : latest.temperature < prev.temperature
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>{formatTemperature(latest?.temperature)}</Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="water" size={20} color={colors.blue[500]} />
                    {latest?.humidity !== undefined && prev?.humidity !== undefined && (
                      <Ionicons
                        name={
                          latest.humidity > prev.humidity
                            ? 'trending-up'
                            : latest.humidity < prev.humidity
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          latest.humidity > prev.humidity
                            ? colors.red[500]
                            : latest.humidity < prev.humidity
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {latest?.humidity !== undefined ? `${latest.humidity}%` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="leaf" size={20} color={colors.primary[500]} />
                    {latest?.soilMoisture !== undefined && prev?.soilMoisture !== undefined && (
                      <Ionicons
                        name={
                          latest.soilMoisture > prev.soilMoisture
                            ? 'trending-up'
                            : latest.soilMoisture < prev.soilMoisture
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          latest.soilMoisture > prev.soilMoisture
                            ? colors.red[500]
                            : latest.soilMoisture < prev.soilMoisture
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {latest?.soilMoisture !== undefined ? `${latest.soilMoisture}%` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Soil Moisture</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="sunny" size={20} color={colors.yellow[500]} />
                    {latest?.lightLevel !== undefined && prev?.lightLevel !== undefined && (
                      <Ionicons
                        name={
                          latest.lightLevel > prev.lightLevel
                            ? 'trending-up'
                            : latest.lightLevel < prev.lightLevel
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          latest.lightLevel > prev.lightLevel
                            ? colors.red[500]
                            : latest.lightLevel < prev.lightLevel
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {latest?.lightLevel !== undefined ? latest.lightLevel : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Light Level</Text>
                </Card>
              </View>

              <Card title="Reading History" style={styles.card}>
                {readings.map((r, i) => (
                  <View key={i} style={styles.readingRow}>
                    <Text style={styles.readingTime}>
                      {formatDate(r.timestamp, 'time')}
                    </Text>
                    <Text style={styles.readingValue}>
                      {formatTemperature(r.temperature)} | {r.humidity ?? 'N/A'}% |{' '}
                      {r.soilMoisture ?? 'N/A'}% | {r.lightLevel || 'N/A'}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </>
      )}

      {/* ==================== STORAGE TAB ==================== */}
      {activeTab === 'storage' && !hasStorageAccess && (
        <PlanGate
          feature="storage_monitoring"
          planName={planName}
          title="Storage Monitoring Not Available"
          description={`Your plan (${planName}) does not include Storage Monitoring. Upgrade to Full Suite to access CO2 and PIR sensors.`}
        />
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
            <EmptyState
              icon="cube-outline"
              title="Select a storage device"
              description="Choose a storage device to view conditions."
            />
          ) : storageReadings.length === 0 ? (
            <EmptyState
              icon="cube-outline"
              title="No readings yet"
              description="No sensor data for this storage device."
            />
          ) : (
            <>
              <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                    {storageLatest?.temperature !== undefined && storagePrev?.temperature !== undefined && (
                      <Ionicons
                        name={
                          storageLatest.temperature > storagePrev.temperature
                            ? 'trending-up'
                            : storageLatest.temperature < storagePrev.temperature
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          storageLatest.temperature > storagePrev.temperature
                            ? colors.red[500]
                            : storageLatest.temperature < storagePrev.temperature
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>{formatTemperature(storageLatest?.temperature)}</Text>
                  <Text style={styles.statLabel}>Temperature</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="water" size={20} color={colors.blue[500]} />
                    {storageLatest?.humidity !== undefined && storagePrev?.humidity !== undefined && (
                      <Ionicons
                        name={
                          storageLatest.humidity > storagePrev.humidity
                            ? 'trending-up'
                            : storageLatest.humidity < storagePrev.humidity
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          storageLatest.humidity > storagePrev.humidity
                            ? colors.red[500]
                            : storageLatest.humidity < storagePrev.humidity
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {storageLatest?.humidity !== undefined ? `${storageLatest.humidity}%` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Humidity</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="bug" size={20} color="#9333ea" />
                    {storageLatest?.co2 !== undefined && storagePrev?.co2 !== undefined && (
                      <Ionicons
                        name={
                          storageLatest.co2 > storagePrev.co2
                            ? 'trending-up'
                            : storageLatest.co2 < storagePrev.co2
                            ? 'trending-down'
                            : 'remove'
                        }
                        size={16}
                        color={
                          storageLatest.co2 > storagePrev.co2
                            ? colors.red[500]
                            : storageLatest.co2 < storagePrev.co2
                            ? colors.primary[500]
                            : colors.gray[400]
                        }
                      />
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {storageLatest?.co2 !== undefined ? `${storageLatest.co2} ppm` : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>CO2 Level</Text>
                </Card>

                <Card style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <Ionicons name="paw" size={20} color={colors.orange[500]} />
                    {storageLatest?.motion ? (
                      <Text style={styles.motionAlert}>🐀 Active</Text>
                    ) : (
                      <Text style={styles.motionClear}>Clear</Text>
                    )}
                  </View>
                  <Text style={styles.statValue}>
                    {storageLatest?.motion ? 'Detected' : 'None'}
                  </Text>
                  <Text style={styles.statLabel}>Motion (Rats)</Text>
                </Card>
              </View>

              <Card title="Storage Reading History" style={styles.card}>
                {storageReadings.map((r, i) => (
                  <View key={i} style={styles.readingRow}>
                    <Text style={styles.readingTime}>
                      {formatDate(r.timestamp, 'time')}
                    </Text>
                    <Text style={styles.readingValue}>
                      {formatTemperature(r.temperature)} | {r.humidity ?? 'N/A'}% |{' '}
                      {r.co2 ?? 'N/A'} ppm | {r.motion ? '🐀' : 'Clear'}
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
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
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
  statCard: { flex: 1, minWidth: '45%', padding: spacing.md, gap: 2 },
  statHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.gray[900] },
  statLabel: { fontSize: 11, color: colors.gray[500], marginTop: 2 },
  motionAlert: { fontSize: 11, color: colors.red[500], fontWeight: 'bold' },
  motionClear: { fontSize: 11, color: colors.primary[500] },
  readingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  readingTime: { fontSize: 12, color: colors.gray[400], width: 80 },
  readingValue: { fontSize: 12, color: colors.gray[600], flex: 1, textAlign: 'right' },
});