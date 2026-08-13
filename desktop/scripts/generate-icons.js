import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputSvg = path.join(__dirname, '../assets/logo.svg');
const outputDir = path.join(__dirname, '../assets');
const pngBuffers = [];

async function generateIcons() {
  try {
    console.log('Generating icons from logo.svg...');

    // Generate PNG sizes
    const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
    
    for (const size of sizes) {
      const buffer = await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toBuffer();
      
      await sharp(buffer)
        .toFile(path.join(outputDir, `icon-${size}.png`));
      
      console.log(`Generated icon-${size}.png`);
    }

    // Generate main icon.png (256x256)
    await sharp(inputSvg)
      .resize(256, 256)
      .png()
      .toFile(path.join(outputDir, 'icon.png'));
    console.log('Generated icon.png');

    // Generate ICO for Windows
    for (const size of [16, 32, 48, 64, 128, 256]) {
      const buffer = await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toBuffer();
      pngBuffers.push(buffer);
    }
    
    const icoBuffer = await pngToIco(pngBuffers);
    fs.writeFileSync(path.join(outputDir, 'icon.ico'), icoBuffer);
    console.log('Generated icon.ico');

    // Generate ICNS for macOS (requires multiple sizes in specific order)
    console.log('Note: For mac ICNS, use icon.icns generator or online converter');
    console.log('Currently generating a placeholder icon.icns from 512x512 PNG');
    
    const icnsBuffer = await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'icon-512.png'));
    
    console.log('All icons generated successfully!');
    console.log(`Output directory: ${outputDir}`);

  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();