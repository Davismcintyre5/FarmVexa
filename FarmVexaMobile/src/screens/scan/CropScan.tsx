import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useFarms } from '../../hooks/useFarms';
import { useCamera } from '../../hooks/useCamera';
import { fieldApi, imageApi } from '../../api/axios';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { colors, spacing, borderRadius } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { CROP_TYPES } from '../../utils/constants';

export default function CropScan() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { fieldId: presetFieldId } = route.params || {};
  const { user } = useAuth();
  const { farms, activeFarm, loadFarms } = useFarms();
  const { image, file, takePhoto, pickImage, clearImage } = useCamera();
  
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [selectedFieldId, setSelectedFieldId] = useState(presetFieldId || '');
  const [cropType, setCropType] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
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

  const handleUpload = async () => {
    if (!image || !file) {
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
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
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

      {/* Field Selection */}
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

      {/* Image Upload */}
      <Card style={styles.card}>
        {image ? (
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
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={takePhoto}
            >
              <View style={[styles.uploadIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="camera" size={32} color={colors.primary[500]} />
              </View>
              <Text style={styles.uploadText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={pickImage}
            >
              <View style={[styles.uploadIcon, { backgroundColor: colors.blue[50] }]}>
                <Ionicons name="images" size={32} color={colors.blue[500]} />
              </View>
              <Text style={styles.uploadText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      <Button
        onPress={handleUpload}
        loading={uploading}
        disabled={!image || !selectedFieldId || !cropType}
        fullWidth
        size="lg"
      >
        {uploading ? 'Analyzing...' : 'Upload & Analyze Crop'}
      </Button>
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
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: '500',
  },
});