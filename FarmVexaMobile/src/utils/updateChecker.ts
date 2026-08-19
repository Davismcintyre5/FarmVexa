import { Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';

const GITHUB_REPO = 'Davismcintyre5/FarmVexa';
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

export const checkForUpdate = async (showUpToDate = true) => {
  try {
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    
    const res = await axios.get(GITHUB_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 10000,
    });

    const release = res.data;
    const assets = release.assets || [];
    
    // Find APK asset
    const apkAsset = assets.find(
      (asset: any) => asset.name.toLowerCase().endsWith('.apk')
    );
    
    // No APK found - silent on app start, alert in settings
    if (!apkAsset) {
      if (showUpToDate) {
        Alert.alert(
          'No Update Available',
          'You are on the latest version.',
          [{ text: 'OK' }]
        );
      }
      // Silent when showUpToDate is false
      return;
    }
    
    const latestVersion = release.tag_name.replace('v', '');
    
    if (isNewerVersion(latestVersion, currentVersion)) {
      // Always show update alert (even on app start)
      Alert.alert(
        'Update Available',
        `FarmVexa Mobile v${latestVersion} is available!\n\nDownload and install the latest version.`,
        [
          { text: 'Later', style: 'cancel' },
          {
            text: 'Download Update',
            onPress: () => {
              Linking.openURL(apkAsset.browser_download_url);
            },
          },
        ]
      );
    } else {
      // Same or older version
      if (showUpToDate) {
        Alert.alert(
          'Up to Date',
          `You are on the latest version (v${currentVersion}).`,
          [{ text: 'OK' }]
        );
      }
      // Silent when showUpToDate is false
    }
  } catch (error) {
    // Only show error in manual check
    if (showUpToDate) {
      Alert.alert(
        'Update Check Failed',
        'Could not check for updates. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    }
    // Silent on app start
  }
};

export const isNewerVersion = (latest: string, current: string): boolean => {
  const latestParts = latest.split('.').map(Number);
  const currentParts = current.split('.').map(Number);
  
  const maxLength = Math.max(latestParts.length, currentParts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const latestPart = latestParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  
  return false;
};