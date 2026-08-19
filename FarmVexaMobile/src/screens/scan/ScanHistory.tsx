import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { imageApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function ScanHistory() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Safe param extraction
  const fieldId = route.params?.fieldId || '';
  
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (fieldId) {
      loadImages();
    } else {
      setLoading(false);
    }
  }, [fieldId]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const res = await imageApi.getFieldImages(fieldId);
      setImages(res.data?.data?.images || []);
    } catch (error) {
      setImages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadImages();
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!fieldId) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.notFoundText}>No field selected</Text>
        <Button onPress={() => navigation.goBack()} variant="outline">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {images.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No scans yet"
          description="Scan your first crop to see results here."
          actionLabel="Scan Crop"
          onAction={() => navigation.navigate('CropScan', { fieldId })}
        />
      ) : (
        <FlatList
          data={images}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ScanResult', { scanId: item._id })}
            >
              <Card style={styles.scanCard}>
                {item.imageUrl && (
                  <Image source={{ uri: item.imageUrl }} style={styles.scanImage} />
                )}
                <View style={styles.scanInfo}>
                  <View style={styles.scanHeader}>
                    <Text style={styles.scanDisease} numberOfLines={1}>
                      {item.diseaseDetected || 'Healthy'}
                    </Text>
                    <Badge status={item.severity || 'low'} />
                  </View>
                  <Text style={styles.scanDate}>
                    {formatDate(item.createdAt, 'relative')}
                  </Text>
                  {item.cropType && (
                    <Text style={styles.scanCrop}>
                      {item.cropType}
                    </Text>
                  )}
                  {item.confidence && (
                    <Text style={styles.scanConfidence}>
                      Confidence: {item.confidence}%
                    </Text>
                  )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  notFoundText: {
    fontSize: 18,
    color: colors.gray[500],
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  scanCard: {
    gap: spacing.sm,
  },
  scanImage: {
    width: '100%',
    height: 160,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  scanInfo: {
    gap: 4,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanDisease: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginRight: spacing.sm,
  },
  scanDate: {
    fontSize: 11,
    color: colors.gray[400],
  },
  scanCrop: {
    fontSize: 12,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  scanConfidence: {
    fontSize: 11,
    color: colors.gray[400],
  },
});