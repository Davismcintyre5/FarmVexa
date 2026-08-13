import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbPath;
let db = {};

export async function initDatabase() {
  const userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'farmvexa-data.json');
  
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      db = JSON.parse(data);
      console.log('Database loaded from:', dbPath);
    } else {
      db = {};
      saveDatabase();
      console.log('Database created at:', dbPath);
    }
  } catch (error) {
    console.error('Error loading database:', error);
    db = {};
  }
  
  return db;
}

function saveDatabase() {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export function getValue(key) {
  return db[key];
}

export function setValue(key, value) {
  db[key] = value;
  saveDatabase();
  return db[key];
}

export function deleteValue(key) {
  delete db[key];
  saveDatabase();
}

export function clearDatabase() {
  db = {};
  saveDatabase();
}