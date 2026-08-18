import { Tray, Menu, app, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;

export function initTray(mainWindow) {
  try {
    let iconPath;
    
    if (app.isPackaged) {
      iconPath = path.join(process.resourcesPath, 'app.asar', 'assets', 'icon.png');
    } else {
      iconPath = path.join(__dirname, '../assets/icon.png');
    }
    
    const icon = nativeImage.createFromPath(iconPath);
    
    if (icon.isEmpty()) {
      console.log('Tray icon empty, skipping tray');
      return null;
    }
    
    const resizedIcon = icon.resize({ width: 16, height: 16 });
    tray = new Tray(resizedIcon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open FarmVexa',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Check for Updates',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('update-message', 'Checking for updates...');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit FarmVexa',
        click: () => {
          app.quit();
        }
      }
    ]);
    
    tray.setToolTip('FarmVexa Desktop');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
    
    return tray;
  } catch (error) {
    console.log('Tray init failed:', error.message);
    return null;
  }
}