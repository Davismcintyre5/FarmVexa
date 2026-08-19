import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { imageApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/formatters';

export default function ScanResult() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Safe param extraction with multiple fallbacks
  const scanId = route.params?.scanId || route.params?.imageId || route.params?.id || '';
  
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (scanId) {
      loadImage();
    } else {
      setLoading(false);
    }
  }, [scanId]);

  const loadImage = async () => {
    setLoading(true);
    try {
      const res = await imageApi.getImage(scanId);
      setImage(res.data?.data?.image || res.data?.image || res.data?.data);
    } catch (error) {
      setImage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Scan', 'Delete this scan result?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await imageApi.deleteImage(scanId);
            Alert.alert('Success', 'Scan deleted');
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Delete failed');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!scanId) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.notFoundText}>No scan ID provided</Text>
        <Button onPress={() => navigation.goBack()} variant="outline">
          Go Back
        </Button>
      </View>
    );
  }

  if (!image) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.notFoundText}>Image not found</Text>
        <Button onPress={() => navigation.goBack()} variant="outline">
          Go Back
        </Button>
      </View>
    );
  }

  const isHealthy = image.diseaseDetected === 'Healthy';
  const severityColors: Record<string, string> = {
    low: colors.primary[100],
    moderate: colors.yellow[100],
    high: colors.red[100],
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        {image.imageUrl && (
          <Image source={{ uri: image.imageUrl }} style={styles.image} />
        )}

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            isHealthy ? styles.healthyBanner : styles.diseaseBanner,
          ]}
        >
          <Ionicons
            name={isHealthy ? 'shield-checkmark' : 'warning'}
            size={32}
            color={isHealthy ? colors.primary[600] : colors.red[600]}
          />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, isHealthy ? styles.healthyText : styles.diseaseText]}>
              {isHealthy ? 'Crop is Healthy' : 'Disease Detected'}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isHealthy ? 'No issues found' : image.diseaseDetected}
            </Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Disease</Text>
            <Text style={styles.detailValue}>{image.diseaseDetected || 'Unknown'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Severity</Text>
            <View style={[styles.severityBadge, { backgroundColor: severityColors[image.severity] || severityColors.low }]}>
              <Text style={styles.severityText}>
                {image.severity?.charAt(0)?.toUpperCase() + image.severity?.slice(1) || 'Low'}
              </Text>
            </View>
          </View>
          {image.cropType && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Crop</Text>
              <Text style={styles.detailValue}>{image.cropType}</Text>
            </View>
          )}
          {image.confidence && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Confidence</Text>
              <Text style={styles.detailValue}>{image.confidence}%</Text>
            </View>
          )}
        </View>

        {/* Symptoms */}
        {image.symptoms && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Symptoms
            </Text>
            <Text style={styles.sectionText}>{image.symptoms}</Text>
          </View>
        )}

        {/* Recommendation */}
        {image.recommendation && (
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Recommendation</Text>
            <Text style={styles.recommendationText}>{image.recommendation}</Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Scanned {formatDate(image.createdAt)}
        </Text>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button onPress={() => navigation.navigate('CropScan')} fullWidth>
          <Ionicons name="camera" size={18} color={colors.white} /> New Scan
        </Button>
        <Button variant="outline" onPress={handleDelete} loading={deleting} fullWidth>
          <Ionicons name="trash" size={18} color={colors.red[500]} /> Delete
        </Button>
      </View>
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
  notFoundText: {
    fontSize: 18,
    color: colors.gray[500],
  },
  card: {
    gap: spacing.md,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  healthyBanner: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  diseaseBanner: {
    backgroundColor: colors.red[50],
    borderColor: colors.red[200],
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  healthyText: {
    color: colors.primary[700],
  },
  diseaseText: {
    color: colors.red[700],
  },
  statusSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.sm,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    gap: 2,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.gray[500],
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    textTransform: 'capitalize',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
  sectionText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  recommendationBox: {
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
    gap: 4,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[700],
  },
  recommendationText: {
    fontSize: 14,
    color: colors.primary[600],
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray[400],
    textAlign: 'right',
  },
  actions: {
    gap: spacing.sm,
  },
});