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

// 通用存储接口
export interface IStorageService {
  // 保存数据
  put(key: string, value: any): Promise<void>;

  // 获取数据
  get(key: string): Promise<any | null>;

  // 删除数据
  delete(key: string): Promise<void>;

  // 获取所有key
  getAllKeys(): Promise<string[]>;

  // 清空所有数据
  clear(): Promise<void>;

  // 删除所有符合条件的key
  deleteKeysWithPrefix(prefix: string): Promise<void>;

  // 获取所有符合条件前缀的key-value
  getWithPrefix(prefix: string): Promise<Record<string, any>>;
}