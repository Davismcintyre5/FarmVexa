import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { fieldApi, publicApi } from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { CROP_TYPES } from '../../utils/constants';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

const processingMessages = [
  '📸 Uploading photos...',
  '🔍 Pre-filtering frames...',
  '🧠 Analyzing with AI...',
  '🦠 Detecting diseases...',
  '🌿 Checking for weeds...',
  '🐛 Scanning for pests...',
  '📊 Building results...',
  '✅ Almost done...',
];

export default function FieldScan() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const webViewRef = useRef<WebView>(null);
  
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [cropType, setCropType] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [externalInUrl, setExternalInUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState(0);

  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
    loadSettings();
    if (isFarmer) {
      loadFarms();
    } else if (user?.farm) {
      setSelectedFarmId(user.farm);
      loadFields(user.farm);
    }
  }, []);

  useEffect(() => {
    if (!processing) return;
    const interval = setInterval(() => {
      setProcessingText((prev) => (prev + 1) % processingMessages.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [processing]);

  // Force hide loading after 10 seconds
  useEffect(() => {
    if (showCameraModal) {
      const timer = setTimeout(() => {
        setWebViewLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showCameraModal]);

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      const data = res.data.data || {};
      setSettings(data.fieldScan);
      setExternalInUrl(data.externalCameraInUrl || '');
    } catch (error) {
      setSettings({ enabled: false });
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadFields = async (farmId: string) => {
    try {
      const res = await fieldApi.getFields(farmId);
      setFields(res.data.data?.fields || []);
    } catch (error) {
      setFields([]);
    }
  };

  const handleFarmChange = (farmId: string) => {
    setSelectedFarmId(farmId);
    setSelectedFieldId('');
    loadFields(farmId);
  };

  const openExternalCamera = () => {
    if (!selectedFieldId) {
      Alert.alert('Error', 'Select a field first');
      return;
    }
    if (!cropType) {
      Alert.alert('Error', 'Select crop type first');
      return;
    }
    if (!externalInUrl) {
      Alert.alert('Error', 'External camera URL not configured');
      return;
    }

    setShowCameraModal(true);
    setWebViewLoading(true);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'farmvexa-field-scan-batch') {
        const photos = data.photos || [];
        if (photos.length === 0) return;

        setShowCameraModal(false);
        autoAnalyze(photos);
      }

      if (data.type === 'farmvexa-crop-photo') {
        const imageUrl = data.imageUrl;
        if (!imageUrl) return;

        setShowCameraModal(false);
        autoAnalyze([{
          imageUrl,
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp || new Date().toISOString(),
        }]);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const autoAnalyze = async (photos: any[]) => {
    if (!selectedFieldId || !cropType) {
      Alert.alert('Error', 'Select field and crop type first');
      return;
    }

    setProcessing(true);
    setProcessingText(0);

    Alert.alert(
      'Analysis Started',
      `Received ${photos.length} photos. Please stay on this page — the scan takes less than 5 minutes.`,
      [{ text: 'OK' }]
    );

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/farm/field-scan/analyze`,
        {
          fieldId: selectedFieldId,
          cropType,
          frames: photos,
          maxGeminiCalls: settings?.maxGeminiCallsPerScan || 30,
          preFilterEnabled: settings?.preFilterEnabled ?? true,
          preFilterPercentage: settings?.preFilterPercentage || 60,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const scanId = res.data?.data?.scanId || res.data?.scanId;
      
      if (scanId) {
        Alert.alert('Success', 'Field scan complete!', [
          { text: 'View Results', onPress: () => navigation.navigate('FieldScanResult', { scanId }) },
        ]);
      } else {
        Alert.alert('Error', 'Failed to get scan result');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Field scan failed');
    } finally {
      setProcessing(false);
    }
  };

  if (settingsLoading) {
    return <Spinner size="lg" />;
  }

  if (settings && !settings.enabled) {
    return (
      <View style={styles.disabledContainer}>
        <Ionicons name="videocam-off" size={64} color={colors.gray[300]} />
        <Text style={styles.disabledTitle}>Field Scan is currently disabled</Text>
        <Text style={styles.disabledText}>
          The field scan feature has been temporarily disabled by the administrator.
          Please check back later.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Scan</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FieldScanHistory')}>
          <Text style={styles.historyLink}>History</Text>
        </TouchableOpacity>
      </View>

      {processing && (
        <Card style={styles.processingCard}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.processingText}>
            {processingMessages[processingText]}
          </Text>
          <View style={styles.progressDots}>
            {processingMessages.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === processingText && styles.dotActive,
                  i < processingText && styles.dotDone,
                ]}
              />
            ))}
          </View>
          <Text style={styles.processingWarning}>
            ⚠️ Please stay on this page — do not navigate away
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((processingText + 1) / processingMessages.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressPercentage}>
            {Math.round(((processingText + 1) / processingMessages.length) * 100)}%
          </Text>
        </Card>
      )}

      {!processing && (
        <>
          <Card style={styles.card}>
            {isFarmer ? (
              <>
                <Select
                  label="Farm"
                  value={selectedFarmId}
                  onChange={handleFarmChange}
                  options={farms.map((f) => ({ value: f._id, label: f.name }))}
                  placeholder="Select Farm"
                />
                <Select
                  label="Field"
                  value={selectedFieldId}
                  onChange={setSelectedFieldId}
                  options={fields.map((f) => ({ value: f._id, label: f.name }))}
                  placeholder="Select Field"
                />
              </>
            ) : (
              <>
                <Text style={styles.assignedFarm}>
                  📍 {activeFarm?.name || 'Assigned Farm'}
                </Text>
                <Select
                  label="Field"
                  value={selectedFieldId}
                  onChange={setSelectedFieldId}
                  options={fields.map((f) => ({ value: f._id, label: f.name }))}
                  placeholder="Select Field"
                />
              </>
            )}

            <Select
              label="Crop Type"
              value={cropType}
              onChange={setCropType}
              options={settings?.allowedCropTypes
                ? settings.allowedCropTypes.map((c: string) => ({
                    value: c,
                    label: c.charAt(0).toUpperCase() + c.slice(1),
                  }))
                : CROP_TYPES
              }
              placeholder="Select Crop Type"
            />
          </Card>

          <Card style={styles.card}>
            <Button
              onPress={openExternalCamera}
              disabled={!settings?.enabled}
              fullWidth
              size="lg"
            >
              <Ionicons name="videocam" size={20} color={colors.white} /> Open External Camera
            </Button>
            <Text style={styles.cameraNote}>
              Opens hdmstream. Start field scan from the hdmstream /out page.
            </Text>
          </Card>
        </>
      )}

      <Modal
        open={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        title="📹 External Camera"
        size="xl"
      >
        <View style={styles.webviewContainer}>
          {webViewLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#2d6a4f" />
              <Text style={styles.loadingText}>Loading camera...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: externalInUrl }}
            onMessage={handleWebViewMessage}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={() => setWebViewLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState
            originWhitelist={['*']}
            mixedContentMode="always"
            setSupportMultipleWindows={false}
            injectedJavaScript={`
              (function() {
                const originalPostMessage = window.postMessage;
                
                window.postMessage = function(message, targetOrigin) {
                  try {
                    if (typeof message === 'string') {
                      try {
                        const data = JSON.parse(message);
                        if (data.type === 'farmvexa-field-scan-batch' || 
                            data.type === 'farmvexa-crop-photo') {
                          window.ReactNativeWebView.postMessage(JSON.stringify(data));
                        }
                      } catch (e) {}
                    } else if (message && message.type) {
                      window.ReactNativeWebView.postMessage(JSON.stringify(message));
                    }
                  } catch (e) {}
                  
                  if (originalPostMessage) {
                    return originalPostMessage.call(this, message, targetOrigin);
                  }
                };
                
                window.addEventListener('message', function(event) {
                  try {
                    if (event.data) {
                      const data = typeof event.data === 'string' 
                        ? JSON.parse(event.data) 
                        : event.data;
                      
                      if (data.type === 'farmvexa-field-scan-batch' || 
                          data.type === 'farmvexa-crop-photo') {
                        window.ReactNativeWebView.postMessage(JSON.stringify(data));
                      }
                    }
                  } catch (e) {}
                });
                
                document.addEventListener('farmvexa-field-scan-batch', function(event) {
                  try {
                    window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
                  } catch (e) {}
                });
                
                document.addEventListener('farmvexa-crop-photo', function(event) {
                  try {
                    window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
                  } catch (e) {}
                });
                
                true;
              })();
            `}
            style={styles.webview}
          />
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  historyLink: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  card: {
    gap: spacing.md,
  },
  assignedFarm: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  cameraNote: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
  },
  processingCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  processingText: {
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: '500',
    textAlign: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
  },
  dotActive: {
    backgroundColor: colors.primary[500],
    transform: [{ scale: 1.5 }],
  },
  dotDone: {
    backgroundColor: colors.primary[300],
  },
  processingWarning: {
    fontSize: 13,
    color: colors.orange[600],
    fontWeight: '600',
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    maxWidth: 300,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  progressPercentage: {
    fontSize: 12,
    color: colors.gray[400],
  },
  disabledContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  disabledText: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
  webviewContainer: {
    height: 400,
    backgroundColor: '#000',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  loadingText: {
    color: colors.white,
    marginTop: spacing.sm,
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
});