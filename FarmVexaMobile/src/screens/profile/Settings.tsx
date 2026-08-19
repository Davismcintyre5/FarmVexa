import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { authApi, publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { getCountyOptions, getConstituencyOptions } from '../../utils/counties';
import SupportTab from './SupportTab';
import DownloadsTab from './DownloadsTab';
import DocumentsTab from './DocumentsTab';
import { APP_VERSION } from '../../utils/constants';

export default function Settings() {
  const navigation = useNavigation<any>();
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [publicSettings, setPublicSettings] = useState<any>({});
  const [constituencyOptions, setConstituencyOptions] = useState<{value: string, label: string}[]>([]);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    county: user?.county || '',
    subCounty: user?.subCounty || '',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    if (user?.county) {
      setConstituencyOptions(getConstituencyOptions(user.county));
    }
  }, []);

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      setPublicSettings(res.data.data || {});
    } catch (error) {
      setPublicSettings({});
    }
  };

  const handleCountyChange = (county: string) => {
    setProfile({ ...profile, county, subCounty: '' });
    setConstituencyOptions(getConstituencyOptions(county));
  };

  const handleProfile = async () => {
    if (!profile.name || profile.name.trim().length < 2) {
      Alert.alert('Error', 'Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      await authApi.updateProfile({
        name: profile.name.trim(),
        phone: profile.phone,
        county: profile.county,
        subCounty: profile.subCounty,
      });
      updateUser({
        name: profile.name.trim(),
        phone: profile.phone,
        county: profile.county,
        subCounty: profile.subCounty,
      });
      Alert.alert('Success', 'Profile updated');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (!passwords.current) {
      Alert.alert('Error', 'Current password is required');
      return;
    }
    if (!passwords.newPass || passwords.newPass.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      setPasswords({ current: '', newPass: '', confirm: '' });
      Alert.alert('Success', 'Password changed');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: 'person' },
    { key: 'password', label: 'Password', icon: 'key' },
    { key: 'support', label: 'Support', icon: 'help-circle' },
    { key: 'documents', label: 'Documents', icon: 'document-text' },
  ];

  const downloads = publicSettings.downloads?.filter((d: any) => d.enabled) || [];
  if (downloads.length > 0) {
    tabs.push({ key: 'downloads', label: 'Downloads', icon: 'download' });
  }

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map(({ key, label, icon }) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
          >
            <Ionicons
              name={icon as any}
              size={16}
              color={activeTab === key ? colors.primary[500] : colors.gray[500]}
            />
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'profile' && (
          <Card style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'F'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            <Input
              label="Name"
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
              placeholder="Davix HDM"
            />
            <Input
              label="Phone"
              value={profile.phone}
              onChangeText={(text) => setProfile({ ...profile, phone: text })}
              placeholder="+254 700 000 000"
              keyboardType="phone-pad"
            />
            <Select
              label="County"
              value={profile.county}
              onChange={handleCountyChange}
              options={getCountyOptions()}
              placeholder="Select County"
            />
            <Select
              label="Sub-County / Constituency"
              value={profile.subCounty}
              onChange={(value) => setProfile({ ...profile, subCounty: value })}
              options={constituencyOptions}
              placeholder={profile.county ? 'Select Constituency' : 'Select County First'}
            />
            <Button onPress={handleProfile} loading={loading} fullWidth>
              Save Changes
            </Button>
          </Card>
        )}

        {activeTab === 'password' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Input
              label="Current Password"
              value={passwords.current}
              onChangeText={(text) => setPasswords({ ...passwords, current: text })}
              placeholder="Enter current password"
              secureTextEntry
            />
            <Input
              label="New Password"
              value={passwords.newPass}
              onChangeText={(text) => setPasswords({ ...passwords, newPass: text })}
              placeholder="Min 6 characters"
              secureTextEntry
            />
            <Input
              label="Confirm Password"
              value={passwords.confirm}
              onChangeText={(text) => setPasswords({ ...passwords, confirm: text })}
              placeholder="Repeat new password"
              secureTextEntry
            />
            <Button onPress={handlePassword} loading={loading} fullWidth>
              Change Password
            </Button>
          </Card>
        )}

        {activeTab === 'support' && <SupportTab />}
        {activeTab === 'documents' && <DocumentsTab />}
        {activeTab === 'downloads' && <DownloadsTab />}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.red[500]} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>FarmVexa v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  tabBar: {
    flexGrow: 0,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tabBarContent: {
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  tabActive: {
    borderBottomColor: colors.primary[500],
  },
  tabText: {
    fontSize: 14,
    color: colors.gray[500],
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.primary[500],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray[500],
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
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
  versionText: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
  },
});