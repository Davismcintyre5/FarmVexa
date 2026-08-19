import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { fieldApi, publicApi, imageApi } from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { useCamera } from '../../hooks/useCamera';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { CROP_TYPES } from '../../utils/constants';
import { WebView } from 'react-native-webview';

export default function CropScan() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fieldId: presetFieldId } = route.params || {};
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const { image, file, takePhoto, pickImage, clearImage } = useCamera();
  const webViewRef = useRef<WebView>(null);
  
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState(presetFieldId || '');
  const [cropType, setCropType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [externalInUrl, setExternalInUrl] = useState('');
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [allowExternalCamera, setAllowExternalCamera] = useState(false);
  const [receivedImage, setReceivedImage] = useState<string | null>(null);

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
    if (presetFieldId) {
      setSelectedFieldId(presetFieldId);
    }
  }, [presetFieldId]);

  const loadSettings = async () => {
    try {
      const res = await publicApi.getPublicSettings();
      const data = res.data.data || {};
      setAllowExternalCamera(data.allowExternalCamera || false);
      setExternalInUrl(data.externalCameraInUrl || '');
    } catch (error) {
      setAllowExternalCamera(false);
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

      if (data.type === 'farmvexa-crop-photo') {
        const imageUrl = data.imageUrl;
        if (!imageUrl) return;

        setShowCameraModal(false);
        setReceivedImage(imageUrl);
        
        Alert.alert(
          'Photo Received',
          'Photo sent from hdmstream. Tap Upload to analyze.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleUpload = async () => {
    const imageToUpload = receivedImage || image;
    
    if (!imageToUpload) {
      Alert.alert('Error', 'Please select or capture an image');
      return;
    }
    if (!selectedFieldId) {
      Alert.alert('Error', 'Please select a field');
      return;
    }
    if (!cropType) {
      Alert.alert('Error', 'Please select crop type');
      return;
    }

    setUploading(true);
    try {
      if (receivedImage) {
        // External image - send URL
        const res = await imageApi.uploadImageByUrl({
          cropImageUrl: receivedImage,
          fieldId: selectedFieldId,
          cropType,
        });

        const scanId = res.data?.data?.cropImage?._id;
        
        if (scanId) {
          navigation.navigate('ScanResult', { scanId });
        } else {
          Alert.alert('Error', 'Failed to get scan result');
        }
      } else {
        // Local image - FormData
        const formData = new FormData();
        formData.append('cropImage', {
          uri: image,
          name: `crop_${Date.now()}.jpg`,
          type: 'image/jpeg',
        } as any);
        formData.append('fieldId', selectedFieldId);
        formData.append('cropType', cropType);

        const res = await imageApi.uploadImage(formData);
        const scanId = res.data?.data?.cropImage?._id;
        
        if (scanId) {
          navigation.navigate('ScanResult', { scanId });
        } else {
          Alert.alert('Error', 'Failed to get scan result');
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearReceivedImage = () => {
    setReceivedImage(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Crop</Text>
        {selectedFieldId && (
          <TouchableOpacity
            onPress={() => navigation.navigate('ScanHistory', { fieldId: selectedFieldId })}
          >
            <Text style={styles.historyLink}>History</Text>
          </TouchableOpacity>
        )}
      </View>

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
          options={CROP_TYPES}
          placeholder="Select Crop Type"
        />
      </Card>

      <Card style={styles.card}>
        {receivedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: receivedImage }} style={styles.preview} />
            <TouchableOpacity style={styles.clearButton} onPress={clearReceivedImage}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.receivedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary[500]} />
              <Text style={styles.receivedText}>Photo from hdmstream</Text>
            </View>
          </View>
        ) : image ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />
            <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.previewActions}>
              <Button variant="outline" onPress={clearImage} style={styles.previewButton}>
                Remove
              </Button>
              <Button variant="outline" onPress={pickImage} style={styles.previewButton}>
                Change
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.uploadOptions}>
            <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
              <View style={[styles.uploadIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="camera" size={32} color={colors.primary[500]} />
              </View>
              <Text style={styles.uploadText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <View style={[styles.uploadIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="images" size={32} color={colors.blue[500]} />
              </View>
              <Text style={styles.uploadText}>Gallery</Text>
            </TouchableOpacity>

            {allowExternalCamera && (
              <TouchableOpacity style={styles.uploadButton} onPress={openExternalCamera}>
                <View style={[styles.uploadIcon, { backgroundColor: '#fce7f3' }]}>
                  <Ionicons name="videocam" size={32} color="#ec4899" />
                </View>
                <Text style={styles.uploadText}>External</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>

      <Button
        onPress={handleUpload}
        loading={uploading}
        disabled={(!receivedImage && !image) || !selectedFieldId || !cropType}
        fullWidth
        size="lg"
      >
        {uploading ? 'Analyzing...' : 'Upload & Analyze Crop'}
      </Button>

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
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState
            injectedJavaScript={`
              if (!window.ReactNativeWebView) {
                window.ReactNativeWebView = {
                  postMessage: function(data) {}
                };
              }
              true;
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
  },
  card: {
    gap: spacing.md,
  },
  assignedFarm: {
    fontSize: 14,
    color: colors.gray[700],
    fontWeight: '500',
  },
  previewContainer: {
    position: 'relative',
    gap: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.md,
  },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  receivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
  },
  receivedText: {
    fontSize: 12,
    color: colors.primary[500],
    fontWeight: '500',
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewButton: {
    flex: 1,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 12,
    color: colors.gray[600],
    fontWeight: '500',
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