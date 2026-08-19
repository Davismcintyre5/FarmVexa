import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function FieldScanResult() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { scanId } = route.params;
  
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const loadScan = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/farm/field-scan/${scanId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScan(res.data.data?.scan || res.data.scan);
    } catch (error) {
      setScan(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScan();
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!scan) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.notFoundText}>Scan not found</Text>
      </View>
    );
  }

  const summary = scan.summary || {};

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>
        Field Scan — {scan.field?.name || 'Unknown Field'}
      </Text>

      {/* Header Info */}
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>
            {formatDate(scan.createdAt)}
          </Text>
          <Text style={styles.headerCrop}>
            {scan.cropType}
          </Text>
          <View style={[
            styles.statusBadge,
            scan.status === 'completed' && styles.statusCompleted,
            scan.status === 'failed' && styles.statusFailed,
            scan.status === 'processing' && styles.statusProcessing,
          ]}>
            <Text style={styles.statusText}>{scan.status}</Text>
          </View>
        </View>

        <Text style={styles.statsText}>
          📸 {scan.totalFrames || 0} total · 🔍 {scan.analyzedFrames || 0} analyzed · ⏭ {scan.skippedFrames || 0} skipped
        </Text>
        {scan.duration && (
          <Text style={styles.statsText}>⏱ {scan.duration}s</Text>
        )}
      </Card>

      {/* Summary Cards */}
      {scan.status === 'completed' && (
        <View style={styles.summaryGrid}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.red[50] }]}>
            <Ionicons name="bug" size={24} color={colors.red[600]} />
            <Text style={[styles.summaryValue, { color: colors.red[600] }]}>
              {summary.diseaseCount || 0}
            </Text>
            <Text style={styles.summaryLabel}>Diseases</Text>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.yellow[50] }]}>
            <Ionicons name="leaf" size={24} color={colors.yellow[600]} />
            <Text style={[styles.summaryValue, { color: colors.yellow[600] }]}>
              {summary.weeds?.hotspots?.length || 0}
            </Text>
            <Text style={styles.summaryLabel}>Weed Spots</Text>
          </Card>

          <Card style={[styles.summaryCard, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary[600]} />
            <Text style={[styles.summaryValue, { color: colors.primary[600] }]}>
              {summary.healthyPercentage || 0}%
            </Text>
            <Text style={styles.summaryLabel}>Healthy</Text>
          </Card>
        </View>
      )}

      {/* Diseases Detected */}
      {summary.diseases?.length > 0 && (
        <Card style={styles.card} title="🦠 Diseases Detected">
          {summary.diseases.map((d: any, i: number) => (
            <View key={i} style={styles.diseaseItem}>
              <Text style={styles.diseaseName}>{d.name}</Text>
              <Text style={styles.diseaseDetail}>
                Severity: {d.severity}
                {d.location?.lat && ` · 📍 ${d.location.lat.toFixed(5)}, ${d.location.lng.toFixed(5)}`}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* Photos Grid */}
      {scan.photos?.length > 0 && (
        <Card style={styles.card} title={`📸 Photos (${scan.photos.length})`}>
          <View style={styles.photoGrid}>
            {scan.photos.map((photo: any, i: number) => (
              <View key={i} style={styles.photoItem}>
                <Image source={{ uri: photo.imageUrl }} style={styles.photo} />
                <View style={styles.photoOverlay}>
                  <Text style={styles.photoAnalysis}>
                    {photo.analysis?.disease || 'Unknown'}
                  </Text>
                  {photo.analysis?.weeds && (
                    <Text style={styles.photoBadge}>🌿</Text>
                  )}
                  {photo.analysis?.pests && (
                    <Text style={styles.photoBadge}>🐛</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Recommendations */}
      {scan.photos?.some((p: any) => p.analysis?.recommendation) && (
        <Card style={styles.card} title="💧 Recommendations">
          {scan.photos
            .filter((p: any) => p.analysis?.recommendation)
            .slice(0, 5)
            .map((p: any, i: number) => (
              <View key={i} style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  {p.analysis.recommendation}
                </Text>
              </View>
            ))}
        </Card>
      )}

      <Button
        onPress={() => navigation.navigate('FieldScan')}
        fullWidth
        size="lg"
      >
        <Ionicons name="camera" size={20} color={colors.white} /> New Scan
      </Button>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  card: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  headerText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  headerCrop: {
    fontSize: 14,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusCompleted: {
    backgroundColor: colors.primary[100],
  },
  statusFailed: {
    backgroundColor: colors.red[100],
  },
  statusProcessing: {
    backgroundColor: colors.yellow[100],
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 12,
    color: colors.gray[400],
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.gray[500],
    marginTop: 2,
  },
  diseaseItem: {
    padding: spacing.sm,
    backgroundColor: colors.red[50],
    borderRadius: borderRadius.md,
    gap: 2,
  },
  diseaseName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.red[700],
  },
  diseaseDetail: {
    fontSize: 12,
    color: colors.gray[500],
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  photoItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoAnalysis: {
    fontSize: 10,
    color: colors.white,
    flex: 1,
  },
  photoBadge: {
    fontSize: 12,
  },
  recommendationItem: {
    padding: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
  },
  recommendationText: {
    fontSize: 13,
    color: colors.gray[700],
    lineHeight: 18,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.gray[500],
  },
});