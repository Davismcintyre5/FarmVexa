const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const LOGO_SVG = path.join(PUBLIC_DIR, 'logo.svg');

const sizes = [
    { name: 'favicon-16.png', size: 16 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'favicon-96.png', size: 96 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'og-image.png', size: 1200 },
];

async function generate() {
    if (!fs.existsSync(LOGO_SVG)) {
        console.error('❌ logo.svg not found in public/');
        console.log('👉 Choose a logo from the generated SVGs and rename it to logo.svg');
        process.exit(1);
    }

    console.log('🎨 Generating PWA assets from logo.svg...\n');

    for (const { name, size } of sizes) {
        const outputPath = path.join(PUBLIC_DIR, name);
        await sharp(LOGO_SVG)
            .resize(size, size)
            .png()
            .toFile(outputPath);
        console.log(`✅ ${name} (${size}x${size})`);
    }

    // Generate favicon.ico (multi-size)
    await sharp(LOGO_SVG)
        .resize(32, 32)
        .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));

    console.log('✅ favicon.ico');

    // Generate maskable icon for PWA
    await sharp(LOGO_SVG)
        .resize(512, 512)
        .extend({ top: 50, bottom: 50, left: 50, right: 50, background: '#2d6a4f' })
        .png()
        .toFile(path.join(PUBLIC_DIR, 'maskable-icon.png'));

    console.log('✅ maskable-icon.png');
    console.log('\n📁 All assets generated in public/');
    console.log('🔗 Update manifest.json and index.html with these files.');
}

generate().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});