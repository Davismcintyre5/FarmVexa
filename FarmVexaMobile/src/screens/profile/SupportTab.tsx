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
import { publicApi } from '../../api/axios';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function SupportTab() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      setSettings(res.data.data || {});
    } catch (error) {
      setSettings({});
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (settings.supportPhone) {
      Linking.openURL(`tel:${settings.supportPhone}`);
    }
  };

  const handleEmail = () => {
    if (settings.supportEmail) {
      Linking.openURL(`mailto:${settings.supportEmail}?subject=FarmVexa Support`);
    }
  };

  const handleWhatsApp = () => {
    if (settings.whatsappNumber) {
      const number = settings.whatsappNumber.replace(/\+/g, '');
      Linking.openURL(`https://wa.me/${number}`);
    }
  };

  if (loading) {
    return <Spinner size="lg" />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Need Help?</Text>
        <Text style={styles.subtitle}>
          Our support team is here to help you with any questions or issues.
        </Text>
      </Card>

      <View style={styles.contactList}>
        {settings.supportPhone && (
          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <View style={[styles.contactIcon, { backgroundColor: colors.primary[50] }]}>
              <Ionicons name="call" size={24} color={colors.primary[500]} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Call Us</Text>
              <Text style={styles.contactValue}>{settings.supportPhone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}

        {settings.supportEmail && (
          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <View style={[styles.contactIcon, { backgroundColor: colors.blue[50] }]}>
              <Ionicons name="mail" size={24} color={colors.blue[500]} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email Us</Text>
              <Text style={styles.contactValue}>{settings.supportEmail}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}

        {settings.showWhatsapp && settings.whatsappNumber && (
          <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
            <View style={[styles.contactIcon, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>{settings.whatsappNumber}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>

      <Card style={styles.card}>
        <Text style={styles.hoursTitle}>Support Hours</Text>
        <View style={styles.hoursRow}>
          <Ionicons name="time" size={16} color={colors.gray[500]} />
          <Text style={styles.hoursText}>Monday - Friday: 8:00 AM - 6:00 PM</Text>
        </View>
        <View style={styles.hoursRow}>
          <Ionicons name="time" size={16} color={colors.gray[500]} />
          <Text style={styles.hoursText}>Saturday: 9:00 AM - 1:00 PM</Text>
        </View>
        <View style={styles.hoursRow}>
          <Ionicons name="time" size={16} color={colors.gray[500]} />
          <Text style={styles.hoursText}>Sunday: Closed</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
  },
  contactList: {
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hoursText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});