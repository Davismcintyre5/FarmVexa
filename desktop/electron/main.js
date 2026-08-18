import { app, BrowserWindow, shell, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initTray } from './tray.js';
import { initUpdater } from './updater.js';
import { initDatabase, getValue, setValue, deleteValue, clearDatabase } from './services/database.js';
import { initOfflineQueue } from './services/offlineQueue.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

app.setPath('cache', path.join(app.getPath('userData'), 'cache'));

function setupWebviewMessaging(win) {
  win.webContents.on('did-attach-webview', (event, webContents) => {
    webContents.on('ipc-message', (event, channel, ...args) => {
      if (channel === 'farmvexa-message') {
        win.webContents.send('farmvexa-message-from-webview', args[0]);
      }
    });
  });

  ipcMain.on('farmvexa-message', (event, data) => {
    const allWebContents = win.webContents.getAllWebContents?.() || [];
    for (const wc of allWebContents) {
      if (wc.getType() === 'webview') {
        wc.send('farmvexa-message-to-webview', data);
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'camera', 'microphone', 'display-capture', 'fullscreen'];
    callback(allowed.includes(permission));
  });

  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    const allowed = ['media', 'camera', 'microphone'];
    return allowed.includes(permission);
  });

  setupWebviewMessaging(mainWindow);

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000/#/login');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/login'
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  initOfflineQueue();

  ipcMain.handle('app:version', () => app.getVersion());

  ipcMain.handle('db:get', (event, key) => getValue(key));
  ipcMain.handle('db:set', (event, key, value) => setValue(key, value));
  ipcMain.handle('db:delete', (event, key) => {
    deleteValue(key);
    return true;
  });
  ipcMain.handle('db:clear', () => {
    clearDatabase();
    return true;
  });

  ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
  });

  createWindow();
  initTray(mainWindow);
  initUpdater(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}