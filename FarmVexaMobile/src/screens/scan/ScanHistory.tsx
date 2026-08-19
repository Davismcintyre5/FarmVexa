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
import { useNavigation, useRoute } from '@react-navigation/native';
import { imageApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function ScanHistory() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fieldId } = route.params || {};
  
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadScans();
  }, [fieldId]);

  const loadScans = async () => {
    try {
      const res = fieldId
        ? await imageApi.getFieldImages(fieldId)
        : await imageApi.getFieldImages('');
      setScans(res.data.data.images || []);
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

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <View style={styles.container}>
      {scans.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No scans yet"
          description="Scan your first crop to see results here."
          actionLabel="Scan Crop"
          onAction={() => navigation.navigate('CropScan')}
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
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ScanResult', { scanId: item._id })}
            >
              <Card style={styles.scanCard}>
                <View style={styles.scanHeader}>
                  <View style={styles.scanInfo}>
                    <Text style={styles.scanDate}>
                      {formatDate(item.createdAt, 'date')}
                    </Text>
                    <Text style={styles.scanCrop}>
                      {item.cropType || 'Unknown crop'}
                    </Text>
                  </View>
                  <View style={styles.scanStatus}>
                    {item.analysis?.disease ? (
                      <Badge status="high" label={item.analysis.disease} />
                    ) : (
                      <Badge status="active" label="Healthy" />
                    )}
                  </View>
                </View>
                <View style={styles.scanFooter}>
                  <Ionicons name="arrow-forward" size={16} color={colors.gray[400]} />
                </View>
              </Card>
            </TouchableOpacity>
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
    gap: 4,
  },
  scanDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  scanCrop: {
    fontSize: 14,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  scanStatus: {
    flexShrink: 0,
  },
  scanFooter: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
});