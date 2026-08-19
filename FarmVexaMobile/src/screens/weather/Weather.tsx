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
import { weatherApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatTemperature } from '../../utils/formatters';

const weatherIcons: Record<string, string> = {
  sunny: '☀️',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  partly_cloudy: '⛅',
};

export default function Weather() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const isFarmer = user?.role === 'farmer';

  const [farmId, setFarmId] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isFarmer) {
      loadFarms();
    } else if (user?.farm) {
      setFarmId(user.farm);
    }
  }, []);

  useEffect(() => {
    if (farmId) {
      loadWeather();
    }
  }, [farmId]);

  const loadWeather = async () => {
    setLoading(true);
    try {
      const res = await weatherApi.getFarmWeather(farmId);
      setWeather(res.data.data?.weather || res.data.data || res.data);
    } catch (error) {
      setWeather(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeather();
  };

  const handleRefreshWeather = async () => {
    setRefreshing(true);
    try {
      const res = await weatherApi.refreshWeather(farmId);
      setWeather(res.data.data?.weather || res.data.data || res.data);
    } catch (error) {
      // Silently fail
    } finally {
      setRefreshing(false);
    }
  };

  const icon = weatherIcons[weather?.condition] || '☀️';
  const forecast = weather?.forecast || [];

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
          <Text style={styles.title}>Weather</Text>
          <Text style={styles.subtitle}>Farm weather & forecast</Text>
        </View>
        {farmId && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefreshWeather}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color={colors.primary[500]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Farm Selector */}
      {isFarmer ? (
        <Select
          label="Farm"
          value={farmId}
          onChange={setFarmId}
          options={farms.map((f) => ({ value: f._id, label: f.name }))}
          placeholder="Select Farm"
        />
      ) : (
        <Text style={styles.assignedFarm}>
          📍 {activeFarm?.name || 'Assigned Farm'}
        </Text>
      )}

      {loading ? (
        <Spinner size="lg" />
      ) : !farmId ? (
        <EmptyState
          icon="cloud-outline"
          title="Select a farm"
          description={isFarmer ? 'Choose a farm to view weather.' : 'No farm assigned.'}
        />
      ) : !weather ? (
        <EmptyState
          icon="cloud-outline"
          title="No weather data"
          description="Click refresh to fetch weather."
        />
      ) : (
        <>
          {/* Current Weather */}
          <Card style={styles.currentCard}>
            <View style={styles.currentHeader}>
              <Text style={styles.currentIcon}>{icon}</Text>
              <Text style={styles.currentTemp}>
                {weather.temperature?.avg?.toFixed(1) || weather.temperature?.max?.toFixed(1) || weather.temperature || 'N/A'}°C
              </Text>
              <Text style={styles.currentCondition}>
                {weather.condition?.replace(/_/g, ' ')}
              </Text>
              {weather.updatedAt && (
                <Text style={styles.updatedText}>
                  Updated: {formatDate(weather.updatedAt)}
                </Text>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="thermometer" size={20} color={colors.red[500]} />
                <Text style={styles.statLabel}>Min / Max</Text>
                <Text style={styles.statValue}>
                  {weather.temperature?.min?.toFixed(1) || 'N/A'}° / {weather.temperature?.max?.toFixed(1) || 'N/A'}°
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="water" size={20} color={colors.blue[500]} />
                <Text style={styles.statLabel}>Humidity</Text>
                <Text style={styles.statValue}>
                  {weather.humidity || 'N/A'}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="umbrella" size={20} color={colors.blue[600]} />
                <Text style={styles.statLabel}>Rainfall</Text>
                <Text style={styles.statValue}>
                  {weather.rainfall || 0}mm
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flag" size={20} color={colors.gray[400]} />
                <Text style={styles.statLabel}>Wind</Text>
                <Text style={styles.statValue}>
                  {weather.windSpeed || 'N/A'} km/h
                </Text>
              </View>
            </View>
          </Card>

          {/* Forecast */}
          {forecast.length > 0 && (
            <Card title="7-Day Forecast" style={styles.card}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.forecastRow}>
                  {forecast.map((f: any, i: number) => (
                    <View
                      key={i}
                      style={[
                        styles.forecastItem,
                        i === 0 && styles.forecastToday,
                      ]}
                    >
                      <Text style={styles.forecastDay}>
                        {i === 0 ? 'Today' : formatDate(f.date, 'date')}
                      </Text>
                      <Text style={styles.forecastIcon}>
                        {weatherIcons[f.condition] || '☀️'}
                      </Text>
                      <Text style={styles.forecastMax}>
                        {f.tempMax?.toFixed(0) || 'N/A'}°
                      </Text>
                      <Text style={styles.forecastMin}>
                        {f.tempMin?.toFixed(0) || 'N/A'}°
                      </Text>
                      <View style={styles.forecastRain}>
                        <Ionicons name="umbrella" size={12} color={colors.blue[500]} />
                        <Text style={styles.forecastRainText}>
                          {f.rainfall || 0}mm
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </Card>
          )}

          {/* Weather Alerts */}
          {weather.alerts?.length > 0 && (
            <Card title="⚠️ Weather Alerts" style={styles.card}>
              {weather.alerts.map((alert: any, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.alertBox,
                    alert.severity === 'high' && styles.alertHigh,
                    alert.severity === 'medium' && styles.alertMedium,
                    alert.severity === 'low' && styles.alertLow,
                  ]}
                >
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  {alert.recommendation && (
                    <Text style={styles.alertRecommendation}>
                      {alert.recommendation}
                    </Text>
                  )}
                </View>
              ))}
            </Card>
          )}

          {/* Farming Tips */}
          <Card title="💡 Farming Tips" style={styles.card}>
            <View style={styles.tipsList}>
              {weather.condition === 'sunny' && (
                <Text style={styles.tipText}>
                  ☀️ Good day for spraying pesticides and harvesting.
                </Text>
              )}
              {weather.condition === 'rainy' && (
                <Text style={styles.tipText}>
                  🌧️ Delay chemical application. Secure harvested crops.
                </Text>
              )}
              {weather.temperature?.max > 30 && (
                <Text style={styles.tipText}>
                  🔥 Increase irrigation. Provide shade for poultry.
                </Text>
              )}
              {weather.temperature?.min < 5 && (
                <Text style={styles.tipText}>
                  ❄️ Protect young plants from frost.
                </Text>
              )}
              {weather.windSpeed > 25 && (
                <Text style={styles.tipText}>
                  💨 Secure loose structures. Avoid spraying.
                </Text>
              )}
            </View>
          </Card>
        </>
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
  refreshButton: {
    padding: 8,
  },
  assignedFarm: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  currentCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  currentHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  currentIcon: {
    fontSize: 64,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  currentCondition: {
    fontSize: 18,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  updatedText: {
    fontSize: 12,
    color: colors.gray[400],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    width: '100%',
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.sm,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray[500],
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  card: {
    gap: spacing.md,
  },
  forecastRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  forecastItem: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    gap: 2,
    minWidth: 80,
  },
  forecastToday: {
    backgroundColor: colors.primary[50],
  },
  forecastDay: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gray[500],
  },
  forecastIcon: {
    fontSize: 24,
  },
  forecastMax: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  forecastMin: {
    fontSize: 12,
    color: colors.gray[400],
  },
  forecastRain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  forecastRainText: {
    fontSize: 11,
    color: colors.blue[500],
  },
  alertBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  alertHigh: {
    backgroundColor: colors.red[50],
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  alertMedium: {
    backgroundColor: colors.yellow[50],
    borderWidth: 1,
    borderColor: colors.yellow[200],
  },
  alertLow: {
    backgroundColor: colors.blue[50],
    borderWidth: 1,
    borderColor: colors.blue[200],
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
  },
  alertRecommendation: {
    fontSize: 12,
    color: colors.gray[600],
  },
  tipsList: {
    gap: spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
});