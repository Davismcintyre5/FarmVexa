import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          Alert.alert('Permission needed', 'Location permission is required');
          return;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
      return currentLocation;
    } catch (err) {
      setError('Failed to get location');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentLocation,
  };
}