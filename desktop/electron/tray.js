import { Tray, Menu, app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tray = null;

export function initTray(mainWindow) {
  const iconPath = path.join(__dirname, '../assets/icon-256.png');
  
  tray = new Tray(iconPath);
  
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
  
  // Double click to open
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  
  return tray;
}