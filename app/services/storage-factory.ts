// Storage factory pattern implementation
import { IStorageService } from './storage';
import { IndexedDBStorage } from './indexeddb-storage';
import { MemoryStorage } from './memory-storage';

// Define available storage types
export type StorageType = 'indexeddb' | 'memory' | 'localstorage'; // Extend with other types as needed

// Storage factory
export class StorageFactory {
  // Create storage service based on environment variable or default to indexedDB
  static createStorage(): IStorageService {
    // Read storage type from environment variable
    const storageType = process.env.HADEX_STORAGE_TYPE?.toLowerCase() as StorageType || 'indexeddb';

    switch (storageType) {
      case 'indexeddb':
        return new IndexedDBStorage();
      case 'memory':
        return new MemoryStorage();
      // case 'localstorage':
      //   return new LocalStorage();
      // Add other storage implementations here as they are developed
      default:
        console.warn(`Unknown storage type: ${storageType}, falling back to indexedDB`);
        return new IndexedDBStorage();
    }
  }
}
