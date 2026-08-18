const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets');
const SVG_PATH = path.join(ASSETS_DIR, 'logo.svg');

// Read SVG
const svgBuffer = fs.readFileSync(SVG_PATH);

// Define all icon sizes needed
const icons = [
  // iOS
  { size: 1024, name: 'icon.png', description: 'iOS App Store (1024x1024)' },
  { size: 180, name: 'icon-180.png', description: 'iOS 180x180' },
  { size: 120, name: 'icon-120.png', description: 'iOS 120x120' },
  { size: 76, name: 'icon-76.png', description: 'iOS 76x76' },
  
  // Android
  { size: 1024, name: 'adaptive-icon.png', description: 'Android Adaptive (1024x1024)' },
  { size: 512, name: 'adaptive-icon-512.png', description: 'Android Adaptive (512x512)' },
  { size: 192, name: 'android-icon-192.png', description: 'Android 192x192' },
  { size: 144, name: 'android-icon-144.png', description: 'Android 144x144' },
  { size: 96, name: 'android-icon-96.png', description: 'Android 96x96' },
  { size: 72, name: 'android-icon-72.png', description: 'Android 72x72' },
  { size: 48, name: 'android-icon-48.png', description: 'Android 48x48' },
  
  // Web
  { size: 192, name: 'favicon.png', description: 'Web Favicon (192x192)' },
  { size: 512, name: 'favicon-512.png', description: 'PWA Icon (512x512)' },
  { size: 384, name: 'favicon-384.png', description: 'PWA Icon (384x384)' },
  { size: 256, name: 'favicon-256.png', description: 'PWA Icon (256x256)' },
  { size: 128, name: 'favicon-128.png', description: 'Web Icon (128x128)' },
  { size: 64, name: 'favicon-64.png', description: 'Web Icon (64x64)' },
  { size: 32, name: 'favicon-32.png', description: 'Web Icon (32x32)' },
  { size: 16, name: 'favicon-16.png', description: 'Web Icon (16x16)' },
];

// Splash screens (different aspect ratios)
const splashes = [
  { width: 2048, height: 2048, name: 'splash-icon.png', description: 'Splash Icon (square)' },
  { width: 2732, height: 2732, name: 'splash-2732.png', description: 'iOS Splash (2732x2732)' },
  { width: 2048, height: 2048, name: 'splash-2048.png', description: 'Android Splash (2048x2048)' },
  { width: 1242, height: 2436, name: 'splash-1242x2436.png', description: 'iOS Splash (1242x2436)' },
  { width: 1242, height: 2208, name: 'splash-1242x2208.png', description: 'iOS Splash (1242x2208)' },
  { width: 1080, height: 1920, name: 'splash-1080x1920.png', description: 'Android Splash (1080x1920)' },
];

// Generate regular icons
async function generateIcons() {
  console.log('🎨 Generating icons...\n');
  
  for (const icon of icons) {
    try {
      await sharp(svgBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 45, g: 106, b: 79, alpha: 1 } // #2d6a4f
        })
        .png()
        .toFile(path.join(ASSETS_DIR, icon.name));
      
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size}) - ${icon.description}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
    }
  }
}

// Generate splash screens
async function generateSplashes() {
  console.log('\n🎨 Generating splash screens...\n');
  
  for (const splash of splashes) {
    try {
      // Center the logo on a green background
      const svgWithBackground = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${splash.width}" height="${splash.height}" viewBox="0 0 ${splash.width} ${splash.height}">
          <rect width="${splash.width}" height="${splash.height}" fill="#2d6a4f"/>
          <g transform="translate(${splash.width / 2 - 256}, ${splash.height / 2 - 256})">
            <circle cx="256" cy="256" r="240" fill="#2d6a4f"/>
            <text x="256" y="200" text-anchor="middle" fill="white" font-size="120">🌾</text>
            <text x="256" y="310" text-anchor="middle" fill="white" font-size="48" font-weight="bold" font-family="Arial, sans-serif">FarmVexa</text>
            <text x="256" y="345" text-anchor="middle" fill="#3b82f6" font-size="18" font-family="Arial, sans-serif">See. Sense. Predict. Grow.</text>
          </g>
        </svg>
      `;
      
      await sharp(Buffer.from(svgWithBackground))
        .resize(splash.width, splash.height)
        .png()
        .toFile(path.join(ASSETS_DIR, splash.name));
      
      console.log(`✅ ${splash.name} (${splash.width}x${splash.height}) - ${splash.description}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${splash.name}:`, error.message);
    }
  }
}

// Generate notification icons (Android)
async function generateNotificationIcons() {
  console.log('\n🎨 Generating notification icons...\n');
  
  const notifSizes = [
    { size: 96, name: 'notification-icon-96.png' },
    { size: 72, name: 'notification-icon-72.png' },
    { size: 48, name: 'notification-icon-48.png' },
    { size: 24, name: 'notification-icon-24.png' },
  ];
  
  for (const icon of notifSizes) {
    try {
      // Notification icons should be white/transparent
      const notificationSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${icon.size}" height="${icon.size}" viewBox="0 0 ${icon.size} ${icon.size}">
          <text x="${icon.size / 2}" y="${icon.size * 0.75}" text-anchor="middle" fill="white" font-size="${icon.size * 0.75}">🌾</text>
        </svg>
      `;
      
      await sharp(Buffer.from(notificationSvg))
        .png()
        .toFile(path.join(ASSETS_DIR, icon.name));
      
      console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error.message);
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Starting icon generation...\n');
  console.log(`📁 Assets directory: ${ASSETS_DIR}\n`);
  
  await generateIcons();
  await generateSplashes();
  await generateNotificationIcons();
  
  console.log('\n✨ All icons generated successfully!');
  console.log('📱 Ready for Expo build!');
}

// Run
main().catch(console.error);