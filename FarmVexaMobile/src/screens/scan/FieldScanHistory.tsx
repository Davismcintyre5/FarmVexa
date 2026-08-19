import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function FieldScanHistory() {
  const navigation = useNavigation<any>();
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${API_URL}/farm/field-scan/my-scans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScans(res.data.data?.scans || []);
    } catch (error) {
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScans();
    setRefreshing(false);
  };

  const handleDelete = (scanId: string) => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(scanId);
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`${API_URL}/farm/field-scan/${scanId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setScans((prev) => prev.filter((s) => s._id !== scanId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete scan');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Scan History</Text>
        <Button onPress={() => navigation.navigate('FieldScan')} size="sm">
          <Ionicons name="camera" size={16} color={colors.white} /> New Scan
        </Button>
      </View>

      {scans.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No field scans yet"
          description="Start your first field scan to see results here."
          actionLabel="Start Field Scan"
          onAction={() => navigation.navigate('FieldScan')}
        />
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <Card style={styles.scanCard}>
              <TouchableOpacity
                onPress={() => navigation.navigate('FieldScanResult', { scanId: item._id })}
              >
                <View style={styles.scanHeader}>
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanField}>
                      {item.field?.name || 'Unknown Field'}
                    </Text>
                    <Text style={styles.scanDate}>
                      {formatDate(item.createdAt)}
                    </Text>
                    <Text style={styles.scanCrop}>
                      {item.cropType}
                    </Text>
                  </View>
                  <Badge status={item.status} />
                </View>

                {item.status === 'completed' && item.summary && (
                  <View style={styles.summaryGrid}>
                    <View style={[styles.summaryItem, { backgroundColor: colors.red[50] }]}>
                      <Ionicons name="bug" size={16} color={colors.red[600]} />
                      <Text style={[styles.summaryValue, { color: colors.red[600] }]}>
                        {item.summary.diseaseCount || 0}
                      </Text>
                      <Text style={styles.summaryLabel}>Diseases</Text>
                    </View>
                    <View style={[styles.summaryItem, { backgroundColor: colors.yellow[50] }]}>
                      <Ionicons name="leaf" size={16} color={colors.yellow[600]} />
                      <Text style={[styles.summaryValue, { color: colors.yellow[600] }]}>
                        {item.summary.weeds?.hotspots?.length || 0}
                      </Text>
                      <Text style={styles.summaryLabel}>Weeds</Text>
                    </View>
                    <View style={[styles.summaryItem, { backgroundColor: colors.primary[50] }]}>
                      <Ionicons name="shield-checkmark" size={16} color={colors.primary[600]} />
                      <Text style={[styles.summaryValue, { color: colors.primary[600] }]}>
                        {item.summary.healthyPercentage || 0}%
                      </Text>
                      <Text style={styles.summaryLabel}>Healthy</Text>
                    </View>
                  </View>
                )}

                <View style={styles.scanFooter}>
                  <Text style={styles.scanStats}>
                    📸 {item.totalFrames || 0} total · 🔍 {item.analyzedFrames || 0} analyzed
                    {item.duration ? ` · ⏱ ${item.duration}s` : ''}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item._id)}
                disabled={deleting === item._id}
              >
                <Text style={styles.deleteText}>
                  {deleting === item._id ? 'Deleting...' : '🗑 Delete'}
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  scanCard: {
    marginBottom: 0,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scanInfo: {
    flex: 1,
    gap: 2,
  },
  scanField: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  scanDate: {
    fontSize: 12,
    color: colors.gray[400],
  },
  scanCrop: {
    fontSize: 14,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.gray[500],
  },
  scanFooter: {
    marginTop: spacing.sm,
  },
  scanStats: {
    fontSize: 12,
    color: colors.gray[400],
  },
  deleteButton: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  deleteText: {
    fontSize: 12,
    color: colors.red[500],
  },
});