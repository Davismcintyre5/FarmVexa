import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import { dialog } from 'electron';

let mainWindow = null;

export function initUpdater(window) {
  mainWindow = window;
  
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-message', `FarmVexa v${info.version} is available`);
    }
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `FarmVexa version ${info.version} is available.`,
      detail: 'Would you like to download it now?',
      buttons: ['Download', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.downloadUpdate();
      }
    });
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
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: `FarmVexa version ${info.version} has been downloaded.`,
      detail: 'Restart now to install the update?',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall(false, true);
      }
    });
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