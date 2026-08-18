import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { publicApi } from '../../api/axios';
import Logo from '../../components/ui/Logo';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function GetAccess() {
  const navigation = useNavigation<any>();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getPublicSettings()
      .then((res) => setSettings(res.data.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { supportPhone, supportEmail, whatsappNumber, showWhatsapp, appName } = settings;

  const handleCall = () => {
    if (supportPhone) {
      Linking.openURL(`tel:${supportPhone}`);
    }
  };

  const handleEmail = () => {
    if (supportEmail) {
      Linking.openURL(`mailto:${supportEmail}`);
    }
  };

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      const number = whatsappNumber.replace(/\+/g, '');
      Linking.openURL(`https://wa.me/${number}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Logo size="sm" />
        <Text style={styles.title}>Get Access to {appName || 'FarmVexa'}</Text>
        <Text style={styles.subtitle}>
          {appName || 'FarmVexa'} is currently available by invitation only. Here's how to get started.
        </Text>
      </View>

      {/* Steps */}
      <View style={styles.stepsContainer}>
        {/* Step 1 */}
        <View style={styles.stepCard}>
          <View style={[styles.stepIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="person-add" size={24} color={colors.primary[600]} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>1. Contact the Admin Team</Text>
            <Text style={styles.stepText}>
              Reach out to us through any of the channels below. Let us know your name, location, and farm details.
            </Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.stepCard}>
          <View style={[styles.stepIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="clipboard" size={24} color={colors.primary[600]} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>2. Account Setup</Text>
            <Text style={styles.stepText}>
              Our team will create your account and set up your farm profile. You'll receive login credentials via email or SMS.
            </Text>
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.stepCard}>
          <View style={[styles.stepIcon, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="time" size={24} color={colors.primary[600]} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>3. Approval & Onboarding</Text>
            <Text style={styles.stepText}>
              Once approved (usually within 24 hours), you'll receive a welcome email with everything you need to get started.
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Methods */}
      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Contact Us Now</Text>
        
        <View style={styles.contactGrid}>
          {supportPhone && (
            <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
              <Ionicons name="call" size={20} color={colors.primary[500]} />
              <View>
                <Text style={styles.contactLabel}>Call</Text>
                <Text style={styles.contactValue}>{supportPhone}</Text>
              </View>
            </TouchableOpacity>
          )}

          {supportEmail && (
            <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
              <Ionicons name="mail" size={20} color={colors.primary[500]} />
              <View>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{supportEmail}</Text>
              </View>
            </TouchableOpacity>
          )}

          {showWhatsapp && whatsappNumber && (
            <TouchableOpacity style={styles.contactItem} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <View>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>{whatsappNumber}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="arrow-back" size={20} color={colors.gray[500]} />
        <Text style={styles.backButtonText}>Back to Login</Text>
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  stepsContainer: {
    gap: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  stepText: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: spacing.md,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[900],
  },
  contactGrid: {
    gap: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.gray[500],
  },
});