import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOCK_DATA_DIR = path.join(__dirname, '../mock');

let cfxDataStore = [];

/**
 * Loads all mock *.json files from the mock directory into an in-memory array.
 */
export async function loadMockData() {
  try {
    // Avoid reloading if already populated
    if (cfxDataStore.length > 0) {
      console.log('Mock CFX data is already loaded.');
      return;
    }

    const files = await fs.readdir(MOCK_DATA_DIR);
    const dataPromises = files
      .filter(file => path.extname(file) === '.json')
      .map(async (file) => {
        const filePath = path.join(MOCK_DATA_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      });

    cfxDataStore = await Promise.all(dataPromises);
    console.log('Successfully loaded mock CFX data into memory.');
  } catch (error) {
    console.error('Error loading mock CFX data:', error);
    // In case of error, ensure the store is empty
    cfxDataStore = [];
  }
}

/**
 * Returns the currently stored mock CFX data.
 * @returns {Array} An array of CFX data objects.
 */
export function getCfxData() {
  return cfxDataStore;
}

