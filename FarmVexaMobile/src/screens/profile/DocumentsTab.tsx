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
import axios from 'axios';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function DocumentsTab() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/public/documents`);
      setDocuments(res.data.data?.documents || []);
    } catch (error) {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Failed to open document');
    });
  };

  const handleDownload = async (doc: any) => {
    setDownloading(doc._id);
    try {
      // Open the URL directly for download/view
      await Linking.openURL(doc.cloudinaryUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
    } finally {
      setDownloading(null);
    }
  };

  const typeLabels: Record<string, string> = {
    user_guide: '📖 User Guide',
    pricing: '💳 Pricing',
    terms: '⚖️ Terms',
    privacy: '🔒 Privacy',
    cookies: '🍪 Cookies',
    other: '📄 Other',
  };

  const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    user_guide: 'book-outline',
    pricing: 'document-text-outline',
    terms: 'shield-checkmark-outline',
    privacy: 'shield-outline',
    cookies: 'document-outline',
    other: 'document-outline',
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon="document-text-outline"
        title="No Documents"
        description="No documents available."
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.docList}>
        {documents.map((doc) => {
          const fileSizeMB = doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(1) : null;

          return (
            <View key={doc._id} style={styles.docCard}>
              <View style={styles.docHeader}>
                <View style={styles.docIcon}>
                  <Ionicons
                    name={typeIcons[doc.type] || 'document-outline'}
                    size={24}
                    color={colors.primary[500]}
                  />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docMeta}>
                    {typeLabels[doc.type] || doc.type} · v{doc.version || '1.0.0'} · {doc.fileType?.toUpperCase()}
                    {fileSizeMB && ` · ${fileSizeMB} MB`}
                  </Text>
                </View>
              </View>

              <View style={styles.docActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleView(doc.cloudinaryUrl)}
                >
                  <Ionicons name="eye-outline" size={18} color={colors.gray[500]} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDownload(doc)}
                  disabled={downloading === doc._id}
                >
                  {downloading === doc._id ? (
                    <Spinner size="sm" />
                  ) : (
                    <Ionicons name="download-outline" size={18} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  docList: {
    gap: spacing.md,
  },
  docCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  docHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    gap: 2,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  docMeta: {
    fontSize: 11,
    color: colors.gray[500],
  },
  docActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: 8,
  },
});