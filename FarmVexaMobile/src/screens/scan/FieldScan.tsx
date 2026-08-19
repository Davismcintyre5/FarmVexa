import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { fieldApi, publicApi } from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { CROP_TYPES } from '../../utils/constants';
import { WebView } from 'react-native-webview';
import { useCamera } from '../../hooks/useCamera';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://farmvexaserver.pxxl.click/api';

export default function FieldScan() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const webViewRef = useRef<WebView>(null);
  const { pickMultipleImages } = useCamera();
  
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [cropType, setCropType] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [showWebView, setShowWebView] = useState(false);
  const [externalCameraUrl, setExternalCameraUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingText, setProcessingText] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState<any[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const isFarmer = user?.role === 'farmer';

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

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      const data = res.data.data || {};
      setSettings(data.fieldScan);
      setExternalCameraUrl(data.externalCameraOutUrl || '');
    } catch (error) {
      setSettings({ enabled: false });
      setExternalCameraUrl('');
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadFields = async (farmId: string) => {
    try {
      const res = await fieldApi.getFields(farmId);
      setFields(res.data.data.fields || []);
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
      Alert.alert('Error', 'Please select a field first');
      return;
    }
    if (!cropType) {
      Alert.alert('Error', 'Please select crop type first');
      return;
    }
    if (!externalCameraUrl) {
      Alert.alert('Error', 'External camera URL not configured');
      return;
    }

    setShowWebView(true);
  };

  // Handle postMessage from hdmstream WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message received:', data);
      console.log('Message type:', data.type);

      // Handle batch photos from field scan
      if (data.type === 'farmvexa-field-scan-batch') {
        const photos = data.photos || [];
        console.log('Batch photos received:', photos.length);
        if (photos.length === 0) return;

        setShowWebView(false);
        Alert.alert('Photos Received', `Received ${photos.length} photos — analyzing...`);
        autoAnalyze(photos);
      }

      // Handle single photo
      if (data.type === 'farmvexa-crop-photo') {
        const imageUrl = data.imageUrl;
        console.log('Single photo received:', imageUrl);
        if (!imageUrl) return;

        setShowWebView(false);
        Alert.alert('Photo Received', 'Photo received — analyzing...');
        autoAnalyze([{
          imageUrl,
          lat: data.lat,
          lng: data.lng,
          timestamp: data.timestamp || new Date().toISOString(),
        }]);
      }

      // Handle console logs from WebView
      if (data.type === 'console') {
        console.log('WebView console:', data.data);
      }
    } catch (error) {
      console.log('Failed to parse WebView message:', error);
      console.log('Raw message:', event.nativeEvent.data);
    }
  };

  // Auto analyze photos from hdmstream
  const autoAnalyze = async (photos: any[]) => {
    if (!selectedFieldId || !cropType) {
      Alert.alert('Error', 'Select field and crop type first');
      return;
    }

    setProcessing(true);
    setProcessingText(0);

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

      const scanId = res.data.data?.scanId || res.data.scanId;
      Alert.alert('Success', 'Field scan complete');
      
      if (scanId) {
        navigation.navigate('FieldScanResult', { scanId });
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Field scan failed');
    } finally {
      setProcessing(false);
    }
  };

  // Take multiple photos with phone camera
  const handleTakePhotos = async () => {
    const images = await pickMultipleImages(10);
    if (images.length > 0) {
      setCapturedPhotos(images);
      setPhotoPreviews(images.map((img) => img.uri));
    }
  };

  // Upload phone camera photos
  const handleUploadPhotos = async () => {
    if (capturedPhotos.length === 0) {
      Alert.alert('Error', 'No photos to upload');
      return;
    }
    if (!selectedFieldId || !cropType) {
      Alert.alert('Error', 'Select field and crop type first');
      return;
    }

    setProcessing(true);
    setProcessingText(0);

    try {
      const token = await AsyncStorage.getItem('token');
      
      // Upload photos first
      const uploadedUrls: string[] = [];
      for (const photo of capturedPhotos) {
        const formData = new FormData();
        formData.append('image', {
          uri: photo.uri,
          name: `field_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        
        const uploadRes = await axios.post(`${API_URL}/farm/images/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (uploadRes.data?.data?.imageUrl) {
          uploadedUrls.push(uploadRes.data.data.imageUrl);
        }
      }

      // Then analyze
      const frames = uploadedUrls.map((url) => ({
        imageUrl: url,
        timestamp: new Date().toISOString(),
      }));

      const res = await axios.post(
        `${API_URL}/farm/field-scan/analyze`,
        {
          fieldId: selectedFieldId,
          cropType,
          frames,
          maxGeminiCalls: settings?.maxGeminiCallsPerScan || 30,
          preFilterEnabled: settings?.preFilterEnabled ?? true,
          preFilterPercentage: settings?.preFilterPercentage || 60,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const scanId = res.data.data?.scanId || res.data.scanId;
      Alert.alert('Success', 'Field scan complete');
      
      if (scanId) {
        navigation.navigate('FieldScanResult', { scanId });
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Field scan failed');
    } finally {
      setProcessing(false);
      setCapturedPhotos([]);
      setPhotoPreviews([]);
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
        </Text>
      </View>
    );
  }

  if (showWebView) {
    return (
      <View style={styles.webviewContainer}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity onPress={() => setShowWebView(false)}>
            <Ionicons name="close" size={24} color={colors.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.webviewTitle}>External Camera</Text>
          <View style={{ width: 24 }} />
        </View>
        <WebView
          ref={webViewRef}
          source={{ uri: externalCameraUrl }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onMessage={handleWebViewMessage}
          injectedJavaScript={`
            (function() {
              const originalPostMessage = window.postMessage;
              
              window.postMessage = function(message, targetOrigin) {
                try {
                  if (typeof message === 'string') {
                    try {
                      const data = JSON.parse(message);
                      window.ReactNativeWebView.postMessage(JSON.stringify(data));
                    } catch {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'hdmstream-message',
                        data: message
                      }));
                    }
                  } else {
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
                        data.type === 'farmvexa-crop-photo' ||
                        data.type === 'hdmstream-photo') {
                      window.ReactNativeWebView.postMessage(JSON.stringify(data));
                    }
                  }
                } catch (e) {}
              });
              
              document.addEventListener('hdmstream-photo', function(event) {
                window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
              });
              
              document.addEventListener('farmvexa-field-scan-batch', function(event) {
                window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
              });
              
              document.addEventListener('farmvexa-crop-photo', function(event) {
                window.ReactNativeWebView.postMessage(JSON.stringify(event.detail));
              });
              
              true;
            })();
          `}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <Spinner size="lg" />
            </View>
          )}
        />
      </View>
    );
  }

  if (processing) {
    return (
      <View style={styles.processingContainer}>
        <Ionicons name="sync" size={48} color={colors.primary[500]} />
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
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((processingText + 1) / processingMessages.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.processingNote}>
          This takes less than 5 minutes — please stay on this page
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Field Scan</Text>

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
        <Text style={styles.sectionTitle}>Scan Options</Text>
        
        <Button
          onPress={openExternalCamera}
          disabled={!selectedFieldId || !cropType}
          fullWidth
          size="lg"
        >
          <Ionicons name="videocam" size={20} color={colors.white} /> External Camera (hdmstream)
        </Button>

        <Text style={styles.dividerText}>OR</Text>

        <Button
          onPress={handleTakePhotos}
          disabled={!selectedFieldId || !cropType}
          variant="outline"
          fullWidth
          size="lg"
        >
          <Ionicons name="camera" size={20} color={colors.primary[500]} /> Use Phone Camera
        </Button>

        {photoPreviews.length > 0 && (
          <View style={styles.photoPreviewSection}>
            <Text style={styles.photoCount}>
              {photoPreviews.length} photos selected
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photoRow}>
                {photoPreviews.map((preview, i) => (
                  <View key={i} style={styles.photoItem}>
                    <Image source={{ uri: preview }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => {
                        setPhotoPreviews((prev) => prev.filter((_, idx) => idx !== i));
                        setCapturedPhotos((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                    >
                      <Ionicons name="close" size={14} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
            <Button
              onPress={handleUploadPhotos}
              fullWidth
              size="lg"
            >
              Upload & Analyze Photos
            </Button>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={20} color={colors.blue[500]} />
          <Text style={styles.infoText}>
            Field Scan captures multiple photos of your field for AI analysis.
            You can use external camera (hdmstream) or your phone camera.
          </Text>
        </View>
        {settings?.maxPhotosPerScan && (
          <View style={styles.infoRow}>
            <Ionicons name="images" size={20} color={colors.gray[500]} />
            <Text style={styles.infoText}>
              Max photos: {settings.maxPhotosPerScan}
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  assignedFarm: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  dividerText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.gray[400],
    marginVertical: spacing.xs,
  },
  photoPreviewSection: {
    gap: spacing.md,
  },
  photoCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
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
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  webviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.gray[50],
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
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
  },
  processingNote: {
    fontSize: 12,
    color: colors.gray[400],
  },
});