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

export default function DevicesHome() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Devices & Sensors</Text>
      <Text style={styles.subtitle}>Monitor your IoT devices and sensors</Text>

      {/* Devices Card */}
      <TouchableOpacity onPress={() => navigation.navigate('DeviceList')}>
        <Card style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary[50] }]}>
            <Ionicons name="hardware-chip" size={32} color={colors.primary[500]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Devices</Text>
            <Text style={styles.cardDescription}>
              View and manage your IoT devices
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </Card>
      </TouchableOpacity>

      {/* Sensors Card */}
      <TouchableOpacity onPress={() => navigation.navigate('SensorReadings')}>
        <Card style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="pulse" size={32} color="#ec4899" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Sensor Readings</Text>
            <Text style={styles.cardDescription}>
              View real-time sensor data from your fields
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.gray[400]} />
        </Card>
      </TouchableOpacity>

      {/* Weather Card */}
      <TouchableOpacity onPress={() => navigation.navigate('Weather')}>
        <Card style={styles.card}>
          <View style={[styles.iconContainer, { backgroundColor: colors.blue[50] }]}>
            <Ionicons name="cloud" size={32} color={colors.blue[500]} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Weather</Text>
            <Text style={styles.cardDescription}>
              Check weather conditions for your farm
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
  card: {
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