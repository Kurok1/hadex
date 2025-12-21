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

import type { IStorageService } from './storage';

// IndexedDB存储实现
export class IndexedDBStorage implements IStorageService {
  private db: IDBDatabase | null = null;
  // 从环境变量读取配置，使用默认值作为回退
  private readonly DB_NAME = process.env.HADEX_DB_NAME || "AnnotationDB";
  private readonly STORE_NAME = process.env.HADEX_STORE_NAME || "Annotations";
  private readonly VERSION = Number(process.env.HADEX_DB_VERSION) || 1;

  // 打开数据库
  private async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // 创建对象仓库
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // 保存数据
  async put(key: string, value: any): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  // 获取数据
  async get(key: string): Promise<any | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  // 删除数据
  async delete(key: string): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  // 获取所有key
  async getAllKeys(): Promise<string[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const keys = request.result as (string | number)[];
        // 只返回字符串类型的key
        const stringKeys = keys.filter(key => typeof key === "string") as string[];
        resolve(stringKeys);
      };
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  // 清空所有数据
  async clear(): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  // 删除所有符合条件的key
  async deleteKeysWithPrefix(prefix: string): Promise<void> {
    const db = await this.open();
    const keys = await this.getAllKeys();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);

      // 收集所有符合条件的key
      const keysToDelete = keys.filter(key => key.startsWith(prefix));

      // 删除所有符合条件的key
      keysToDelete.forEach(key => {
        store.delete(key);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject((event.target as IDBTransaction).error);
    });
  }

  // 获取所有符合条件前缀的key-value
  async getWithPrefix(prefix: string): Promise<Record<string, any>> {
    const db = await this.open();
    const keys = await this.getAllKeys();

    // 收集所有符合条件的key
    const relevantKeys = keys.filter(key => key.startsWith(prefix));

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);

      const result: Record<string, any> = {};

      // 如果没有相关key，直接返回空对象
      if (relevantKeys.length === 0) {
        resolve(result);
        return;
      }

      // 读取所有相关key的数据
      let completedReads = 0;

      relevantKeys.forEach(key => {
        const request = store.get(key);

        request.onsuccess = () => {
          const value = request.result;
          if (value !== null) {
            result[key] = value;
          }
          completedReads++;

          // 所有读取完成后返回结果
          if (completedReads === relevantKeys.length) {
            resolve(result);
          }
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    });
  }
}