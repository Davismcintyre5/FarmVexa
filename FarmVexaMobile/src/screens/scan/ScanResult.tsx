import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { imageApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ScanResult() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { scanId } = route.params;
  
  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const loadScan = async () => {
    try {
      const res = await imageApi.getImage(scanId);
      setScan(res.data.data.image || res.data.data.cropImage);
    } catch (error) {
      setScan(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!scan) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="leaf-outline" size={64} color={colors.gray[300]} />
        <Text style={styles.notFoundText}>Scan not found</Text>
        <Button onPress={() => navigation.goBack()} variant="outline">
          Go Back
        </Button>
      </View>
    );
  }

  const analysis = scan.analysis || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Crop Analysis Result</Text>

      {/* Image */}
      {scan.imageUrl && (
        <Image source={{ uri: scan.imageUrl }} style={styles.image} />
      )}

      {/* Analysis */}
      {analysis.disease && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Disease Detection</Text>
          <View style={styles.resultRow}>
            <Ionicons name="warning" size={24} color={colors.red[500]} />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{analysis.disease}</Text>
              {analysis.confidence && (
                <Text style={styles.resultDetail}>
                  Confidence: {analysis.confidence}%
                </Text>
              )}
              {analysis.severity && (
                <Text style={styles.resultDetail}>
                  Severity: {analysis.severity}
                </Text>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Recommendation */}
      {analysis.recommendation && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Recommendation</Text>
          <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
        </Card>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button onPress={() => navigation.navigate('CropScan')} fullWidth size="lg">
          <Ionicons name="camera" size={20} color={colors.white} /> New Scan
        </Button>
        <Button
          onPress={() => navigation.navigate('ScanHistory')}
          variant="outline"
          fullWidth
        >
          View History
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
  },
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resultInfo: {
    flex: 1,
    gap: 4,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.red[600],
  },
  resultDetail: {
    fontSize: 14,
    color: colors.gray[500],
  },
  recommendationText: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 22,
  },
  actions: {
    gap: spacing.sm,
  },
  notFoundText: {
    fontSize: 18,
    color: colors.gray[500],
  },
});