import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export function useCamera() {
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<any>(null);

  const requestPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required');
        return false;
      }
    }
    return true;
  };

  const takePhoto = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setFile(result.assets[0]);
    }
  }, []);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setFile(result.assets[0]);
    }
  }, []);

  const pickMultipleImages = useCallback(async (limit = 5) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: limit,
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets;
    }
    return [];
  }, []);

  const clearImage = () => {
    setImage(null);
    setFile(null);
  };

  return {
    image,
    file,
    takePhoto,
    pickImage,
    pickMultipleImages,
    clearImage,
  };
}