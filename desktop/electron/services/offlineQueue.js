import fs from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let queuePath;
let queue = [];

export function initOfflineQueue() {
  const userDataPath = app.getPath('userData');
  queuePath = path.join(userDataPath, 'offline-queue.json');
  
  // Load existing queue
  try {
    if (fs.existsSync(queuePath)) {
      const data = fs.readFileSync(queuePath, 'utf8');
      queue = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading offline queue:', error);
    queue = [];
  }
  
  // IPC handlers
  ipcMain.handle('queue:add', (event, request) => {
    const queuedRequest = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...request
    };
    queue.push(queuedRequest);
    saveQueue();
    return queuedRequest;
  });
  
  ipcMain.handle('queue:get', () => {
    return queue;
  });
  
  ipcMain.handle('queue:remove', (event, id) => {
    queue = queue.filter(item => item.id !== id);
    saveQueue();
    return queue;
  });
  
  ipcMain.handle('queue:clear', () => {
    queue = [];
    saveQueue();
    return queue;
  });
  
  return queue;
}

function saveQueue() {
  try {
    fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving offline queue:', error);
  }
}

export function getQueue() {
  return queue;
}

export function addToQueue(request) {
  const queuedRequest = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...request
  };
  queue.push(queuedRequest);
  saveQueue();
  return queuedRequest;
}

export function processQueue() {
  // Process offline queue when back online
  return queue;
}