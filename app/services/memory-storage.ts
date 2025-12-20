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
