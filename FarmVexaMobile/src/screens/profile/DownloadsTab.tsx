import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface Download {
  _id: string;
  name: string;
  version: string;
  link: string;
  description?: string;
  platform: string;
  enabled: boolean;
}

export default function DownloadsTab() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      const allDownloads = res.data.data?.downloads || [];
      setDownloads(allDownloads.filter((d: Download) => d.enabled));
    } catch (error) {
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (download: Download) => {
    Alert.alert(
      'Download',
      `Open download link for ${download.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            Linking.openURL(download.link).catch(() => {
              Alert.alert('Error', 'Failed to open download link');
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (downloads.length === 0) {
    return (
      <EmptyState
        icon="download-outline"
        title="No Downloads"
        description="No downloads available yet."
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.downloadList}>
        {downloads.map((download) => (
          <TouchableOpacity
            key={download._id}
            onPress={() => handleDownload(download)}
          >
            <Card style={styles.downloadCard}>
              <View style={styles.downloadHeader}>
                <View style={styles.downloadIcon}>
                  {download.platform === 'windows' ? (
                    <Ionicons name="logo-windows" size={32} color={colors.blue[500]} />
                  ) : download.platform === 'android' ? (
                    <Ionicons name="logo-android" size={32} color={colors.primary[500]} />
                  ) : download.platform === 'ios' ? (
                    <Ionicons name="logo-apple" size={32} color={colors.gray[700]} />
                  ) : (
                    <Ionicons name="download" size={32} color={colors.primary[500]} />
                  )}
                </View>
                <View style={styles.downloadInfo}>
                  <Text style={styles.downloadName}>{download.name}</Text>
                  <Text style={styles.downloadVersion}>Version {download.version}</Text>
                  {download.description && (
                    <Text style={styles.downloadDescription} numberOfLines={2}>
                      {download.description}
                    </Text>
                  )}
                </View>
                <View style={styles.downloadAction}>
                  <Ionicons name="download-outline" size={24} color={colors.primary[500]} />
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  downloadList: {
    gap: spacing.md,
  },
  downloadCard: {
    gap: spacing.md,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  downloadIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadInfo: {
    flex: 1,
    gap: 2,
  },
  downloadName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  downloadVersion: {
    fontSize: 12,
    color: colors.gray[500],
  },
  downloadDescription: {
    fontSize: 12,
    color: colors.gray[400],
  },
  downloadAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});