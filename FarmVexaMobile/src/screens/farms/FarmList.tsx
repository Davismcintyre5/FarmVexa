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
import { useFarms } from '../../hooks/useFarms';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { Farm } from '../../types';

export default function FarmList() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, loading, loadFarms, deleteFarm, setActiveFarm } = useFarms();
  const [refreshing, setRefreshing] = useState(false);

  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
    if (farms.length === 0) {
      loadFarms();
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFarms();
    setRefreshing(false);
  };

  const handleDelete = (farm: Farm) => {
    Alert.alert(
      'Delete Farm',
      `Are you sure you want to delete "${farm.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFarm(farm._id);
              Alert.alert('Success', 'Farm deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete farm');
            }
          },
        },
      ]
    );
  };

  if (loading && farms.length === 0) {
    return <Spinner size="lg" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Farms</Text>
          <Text style={styles.subtitle}>
            {farms.length} farm{farms.length !== 1 ? 's' : ''}
          </Text>
        </View>
        {isFarmer && (
          <Button onPress={() => navigation.navigate('FarmCreate')} size="sm">
            <Ionicons name="add" size={20} color={colors.white} /> Add Farm
          </Button>
        )}
      </View>

      {farms.length === 0 ? (
        <EmptyState
          icon="leaf-outline"
          title="No farms yet"
          description={
            isFarmer
              ? 'Create your first farm to get started.'
              : 'You are not assigned to any farm. Contact your administrator.'
          }
          actionLabel={isFarmer ? 'Create Farm' : undefined}
          onAction={isFarmer ? () => navigation.navigate('FarmCreate') : undefined}
        />
      ) : (
        <FlatList
          data={farms}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setActiveFarm(item);
                navigation.navigate('FarmDetail', { farmId: item._id });
              }}
            >
              <Card style={styles.farmCard}>
                <View style={styles.farmHeader}>
                  <View style={styles.farmInfo}>
                    <Text style={styles.farmName}>{item.name}</Text>
                    <View style={styles.farmMeta}>
                      <Ionicons name="location" size={14} color={colors.gray[500]} />
                      <Text style={styles.farmMetaText}>
                        {item.location?.county || 'N/A'}
                      </Text>
                    </View>
                    {item.size?.value ? (
                      <View style={styles.farmMeta}>
                        <Ionicons name="resize" size={14} color={colors.gray[500]} />
                        <Text style={styles.farmMetaText}>
                          {item.size.value} {item.size.unit}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.farmActions}>
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
  farmCard: {
    marginBottom: 0,
  },
  farmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  farmInfo: {
    flex: 1,
    gap: 4,
  },
  farmName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  farmMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  farmMetaText: {
    fontSize: 14,
    color: colors.gray[500],
  },
  farmActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  deleteButton: {
    padding: 4,
  },
});