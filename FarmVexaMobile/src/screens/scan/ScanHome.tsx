import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/ui/Card';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ScanHome() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scan</Text>
      <Text style={styles.subtitle}>Choose a scanning method</Text>

      {/* Crop Scan Card */}
      <TouchableOpacity onPress={() => navigation.navigate('CropScan')}>
        <Card style={styles.scanCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="camera" size={32} color={colors.primary[500]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Crop Scan</Text>
            <Text style={styles.cardDescription}>
              Take a photo of a single crop to detect diseases instantly.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </Card>
      </TouchableOpacity>

      {/* Field Scan Card */}
      <TouchableOpacity onPress={() => navigation.navigate('FieldScan')}>
        <Card style={styles.scanCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.blue[50] }]}>
            <Ionicons name="videocam" size={32} color={colors.blue[500]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Field Scan</Text>
            <Text style={styles.cardDescription}>
              Scan your entire field using external camera for comprehensive analysis.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </Card>
      </TouchableOpacity>

      {/* Field Scan History Card */}
      <TouchableOpacity onPress={() => navigation.navigate('FieldScanHistory')}>
        <Card style={styles.scanCard}>
          <View style={[styles.iconContainer, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="map" size={32} color="#ec4899" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Field Scan History</Text>
            <Text style={styles.cardDescription}>
              View all your past field scans and detailed results.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </Card>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  scanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  cardDescription: {
    fontSize: 12,
    color: colors.gray[500],
    lineHeight: 18,
  },
});