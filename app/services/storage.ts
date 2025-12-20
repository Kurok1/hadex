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