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

// Memory storage implementation
import type { IStorageService } from './storage';

// 内存存储实现 - 数据只在当前页面会话中存在
export class MemoryStorage implements IStorageService {
  // 使用Map存储数据
  private storage: Map<string, any>;

  constructor() {
    this.storage = new Map();
  }

  // 保存数据
  async put(key: string, value: any): Promise<void> {
    this.storage.set(key, value);
  }

  // 获取数据
  async get(key: string): Promise<any | null> {
    return this.storage.get(key) || null;
  }

  // 删除数据
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }

  // 获取所有key
  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  // 清空所有数据
  async clear(): Promise<void> {
    this.storage.clear();
  }

  // 删除所有符合条件的key
  async deleteKeysWithPrefix(prefix: string): Promise<void> {
    for (const key of this.storage.keys()) {
      if (key.startsWith(prefix)) {
        this.storage.delete(key);
      }
    }
  }

  // 获取所有符合条件前缀的key-value
  async getWithPrefix(prefix: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(prefix)) {
        result[key] = value;
      }
    }

    return result;
  }
}
