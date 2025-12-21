/**
 * Copyright 2025 Kurok1
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
