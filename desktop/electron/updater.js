import pkg from 'electron-updater';
const { autoUpdater } = pkg;

let mainWindow = null;

export function initUpdater(window) {
  mainWindow = window;
  
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-message', `Downloading FarmVexa v${info.version}...`);
    }
  });
  
  autoUpdater.on('update-not-available', () => {
    console.log('App is up to date');
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-message', 'FarmVexa is up to date');
    }
  });
  
  autoUpdater.on('download-progress', (progressObj) => {
    const percent = Math.round(progressObj.percent);
    console.log(`Downloading update: ${percent}%`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('download-progress', percent);
    }
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-message', `FarmVexa v${info.version} downloaded. Restarting...`);
    }
    setTimeout(() => {
      autoUpdater.quitAndInstall(false, true);
    }, 3000);
  });
  
  autoUpdater.on('error', (error) => {
    console.error('Update error:', error.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-error', error.message);
    }
  });
  
  setTimeout(() => {
    checkForUpdates();
  }, 5000);
  
  setInterval(() => {
    checkForUpdates();
  }, 3600000);
}

export function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(err => {
    console.error('Check for updates failed:', err.message);
  });
}