import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { fieldApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Field } from '../../types';

export default function FieldDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fieldId } = route.params || {};
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';

  const [field, setField] = useState<Field | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (fieldId) {
      loadFieldData();
    } else {
      setLoading(false);
      Alert.alert('Error', 'No field ID provided');
    }
  }, [fieldId]);

  const loadFieldData = async () => {
    setLoading(true);
    try {
      const res = await fieldApi.getField(fieldId);
      const fieldData = 
        res.data?.data?.field || 
        res.data?.field || 
        res.data?.data ||
        res.data;
      setField(fieldData);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load field data');
      setField(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFieldData();
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Field',
      `Are you sure you want to delete "${field?.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fieldApi.deleteField(fieldId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete field');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!field) {
    return (
      <EmptyState
        icon="leaf-outline"
        title="Field not found"
        description="The field you're looking for doesn't exist."
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Field Header */}
      <View style={styles.fieldHeader}>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{field.name}</Text>
          <View style={styles.fieldMeta}>
            <Ionicons name="leaf" size={16} color={colors.gray[500]} />
            <Text style={styles.fieldMetaText}>
              {field.crop || 'No crop assigned'}
            </Text>
          </View>
          {field.size?.value && (
            <View style={styles.fieldMeta}>
              <Ionicons name="resize" size={16} color={colors.gray[500]} />
              <Text style={styles.fieldMetaText}>
                {field.size.value} {field.size.unit}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.fieldActions}>
          <Badge status={field.status || 'active'} />
          {isFarmer && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => navigation.navigate('FieldEdit', { fieldId })}
                style={styles.actionButton}
              >
                <Ionicons name="pencil" size={18} color={colors.blue[500]} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.actionButton}
              >
                <Ionicons name="trash" size={18} color={colors.red[500]} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={styles.card}>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Scan', { screen: 'CropScan', params: { fieldId } })}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="camera" size={24} color={colors.primary[500]} />
            </View>
            <Text style={styles.quickActionText}>Scan Crop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Scan', { screen: 'FieldScan', params: { fieldId } })}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="videocam" size={24} color={colors.blue[500]} />
            </View>
            <Text style={styles.quickActionText}>Field Scan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Scan', { screen: 'ScanHistory', params: { fieldId } })}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.yellow[50] }]}>
              <Ionicons name="time" size={24} color={colors.yellow[600]} />
            </View>
            <Text style={styles.quickActionText}>History</Text>
          </TouchableOpacity>
        </View>
      </Card>
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
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  fieldInfo: {
    flex: 1,
    gap: 4,
  },
  fieldName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  fieldMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fieldMetaText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  fieldActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  card: {
    marginBottom: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: colors.gray[600],
    textAlign: 'center',
  },
});