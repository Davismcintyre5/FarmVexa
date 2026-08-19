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
import { useAuth } from '../../hooks/useAuth';
import { fieldApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Field } from '../../types';

export default function FieldList() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { farmId } = route.params;
  const { user } = useAuth();
  const isFarmer = user?.role === 'farmer';

  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFields();
  }, [farmId]);

  const loadFields = async () => {
    try {
      const res = await fieldApi.getFields(farmId);
      setFields(res.data.data.fields || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFields();
    setRefreshing(false);
  };

  const handleDelete = (field: Field) => {
    Alert.alert(
      'Delete Field',
      `Are you sure you want to delete "${field.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fieldApi.deleteField(field._id);
              setFields((prev) => prev.filter((f) => f._id !== field._id));
              Alert.alert('Success', 'Field deleted');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Fields</Text>
          <Text style={styles.subtitle}>
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {isFarmer && (
          <Button
            onPress={() => navigation.navigate('FieldCreate', { farmId })}
            size="sm"
          >
            <Ionicons name="add" size={20} color={colors.white} /> Add Field
          </Button>
        )}
      </View>

      {fields.length === 0 ? (
        <EmptyState
          icon="grid-outline"
          title="No fields yet"
          description={isFarmer ? 'Add your first field to this farm.' : 'No fields assigned.'}
          actionLabel={isFarmer ? 'Add Field' : undefined}
          onAction={isFarmer ? () => navigation.navigate('FieldCreate', { farmId }) : undefined}
        />
      ) : (
        <FlatList
          data={fields}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('FieldDetail', { fieldId: item._id })}
            >
              <Card style={styles.fieldCard}>
                <View style={styles.fieldHeader}>
                  <View style={styles.fieldInfo}>
                    <Text style={styles.fieldName}>{item.name}</Text>
                    <View style={styles.fieldMeta}>
                      <Ionicons name="leaf" size={14} color={colors.gray[500]} />
                      <Text style={styles.fieldMetaText}>
                        {item.crop || 'No crop'}
                      </Text>
                    </View>
                    {item.size?.value && (
                      <View style={styles.fieldMeta}>
                        <Ionicons name="resize" size={14} color={colors.gray[500]} />
                        <Text style={styles.fieldMetaText}>
                          {item.size.value} {item.size.unit}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.fieldActions}>
                    <Badge status={item.status || 'active'} />
                    {isFarmer && (
                      <TouchableOpacity
                        onPress={() => handleDelete(item)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.red[500]} />
                      </TouchableOpacity>
                    )}
                  </View>
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
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  fieldCard: {
    marginBottom: 0,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  fieldInfo: {
    flex: 1,
    gap: 4,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
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
  deleteButton: {
    padding: 4,
  },
});