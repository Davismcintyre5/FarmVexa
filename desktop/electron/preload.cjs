const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  version: process.version,
  
  db: {
    get: (key) => ipcRenderer.invoke('db:get', key),
    set: (key, value) => ipcRenderer.invoke('db:set', key, value),
    delete: (key) => ipcRenderer.invoke('db:delete', key),
    clear: () => ipcRenderer.invoke('db:clear')
  },
  
  offlineQueue: {
    add: (request) => ipcRenderer.invoke('queue:add', request),
    get: () => ipcRenderer.invoke('queue:get'),
    remove: (id) => ipcRenderer.invoke('queue:remove', id),
    clear: () => ipcRenderer.invoke('queue:clear')
  },
  
  onUpdateMessage: (callback) => {
    ipcRenderer.on('update-message', (event, message) => callback(message));
  },
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, percent) => callback(percent));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (event, error) => callback(error));
  },
  
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  
  onOnlineStatus: (callback) => {
    ipcRenderer.on('online-status', (event, status) => callback(status));
  }
});