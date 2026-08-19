import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'Farmer'}</Text>
          </View>
        </View>
      </Card>

      {/* User Details */}
      <Card style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Ionicons name="mail" size={18} color={colors.gray[500]} />
          <Text style={styles.detailText}>{user?.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={18} color={colors.gray[500]} />
          <Text style={styles.detailText}>{user?.phone || 'Not set'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={18} color={colors.gray[500]} />
          <Text style={styles.detailText}>
            {user?.county ? `${user.county}, ${user.subCounty || ''}` : 'Not set'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="pricetag" size={18} color={colors.gray[500]} />
          <Text style={styles.detailText}>
            {user?.selectedPlan || 'Basic'} Plan
          </Text>
        </View>
      </Card>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={20} color={colors.blue[500]} />
          <Text style={styles.quickLinkText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('Plans')}
        >
          <Ionicons name="pricetag" size={20} color={colors.primary[500]} />
          <Text style={styles.quickLinkText}>Plans & Upgrades</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out" size={20} color={colors.red[500]} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  profileCard: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray[500],
  },
  roleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[600],
    textTransform: 'capitalize',
  },
  detailsCard: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[600],
    flex: 1,
  },
  quickLinks: {
    gap: spacing.xs,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  quickLinkText: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[700],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.red[100],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red[500],
  },
});