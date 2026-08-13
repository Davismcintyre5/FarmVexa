import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSvg = path.join(__dirname, '../../client/public/logo.svg');
const outputDir = path.join(__dirname, '../assets');

async function generateAssets() {
    try {
        console.log('Generating mobile assets from logo.svg...');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Square icons
        await sharp(inputSvg)
            .resize(1024, 1024)
            .png()
            .toFile(path.join(outputDir, 'icon.png'));
        console.log('Generated icon.png (1024x1024)');

        await sharp(inputSvg)
            .resize(1024, 1024)
            .png()
            .toFile(path.join(outputDir, 'adaptive-icon.png'));
        console.log('Generated adaptive-icon.png (1024x1024)');

        await sharp(inputSvg)
            .resize(48, 48)
            .png()
            .toFile(path.join(outputDir, 'favicon.png'));
        console.log('Generated favicon.png (48x48)');

        // Splash screen: green background with centered logo (rectangle)
        const logoBuffer = await sharp(inputSvg)
            .resize(400, 400)
            .png()
            .toBuffer();

        await sharp({
            create: {
                width: 1284,
                height: 2778,
                channels: 4,
                background: { r: 34, g: 197, b: 94, alpha: 1 }  // Green #22c55e
            }
        })
            .composite([{
                input: logoBuffer,
                gravity: 'center'
            }])
            .png()
            .toFile(path.join(outputDir, 'splash-icon.png'));
        console.log('Generated splash-icon.png (1284x2778, green background)');

        console.log('All assets generated successfully!');
    } catch (error) {
        console.error('Error generating assets:', error);
        process.exit(1);
    }
}

generateAssets();