import { isNullOrUndef } from '@/utils';

/**
 * Storage类，用于封装localStorage和sessionStorage操作
 */
class Storage {
  constructor(option) {
    this.storage = option.storage;
    this.prefixKey = option.prefixKey;
  }

  /**
   * 获取带前缀的key
   * @param {string} key - 原始key
   * @returns {string} 带前缀的key
   */
  getKey(key) {
    return `${this.prefixKey}${key}`;
  }

  /**
   * 设置存储值
   * @param {string} key - 存储key
   * @param {any} value - 存储值
   * @param {number} expire - 过期时间（秒）
   */
  set(key, value, expire) {
    const stringData = JSON.stringify({
      value,
      time: Date.now(),
      expire: !isNullOrUndef(expire) ? new Date().getTime() + expire * 1000 : null,
    });
    this.storage.setItem(this.getKey(key), stringData);
  }

  /**
   * 获取存储值
   * @param {string} key - 存储key
   * @returns {any} 存储的值
   */
  get(key) {
    const { value } = this.getItem(key, {});
    return value;
  }

  /**
   * 获取存储项（包含时间信息）
   * @param {string} key - 存储key
   * @param {any} def - 默认值
   * @returns {object} 包含value和time的对象
   */
  getItem(key, def = null) {
    const val = this.storage.getItem(this.getKey(key));
    if (!val) {
      return def;
    }
    try {
      const data = JSON.parse(val);
      const { value, time, expire } = data;
      if (isNullOrUndef(expire) || expire > new Date().getTime()) {
        return { value, time };
      }
      this.remove(key);
      return def;
    } catch (error) {
      console.error(error);
      this.remove(key);
      return def;
    }
  }

  /**
   * 移除存储项
   * @param {string} key - 存储key
   */
  remove(key) {
    this.storage.removeItem(this.getKey(key));
  }

  /**
   * 清空所有存储
   */
  clear() {
    this.storage.clear();
  }
}

/**
 * 创建Storage实例
 * @param {object} options - 配置选项
 * @param {string} options.prefixKey - key前缀
 * @param {Storage} options.storage - 存储对象
 * @returns {Storage} Storage实例
 */
export function createStorage({ prefixKey = '', storage = sessionStorage }) {
  return new Storage({ prefixKey, storage });
}

const prefixKey = '';

/**
 * 创建localStorage实例
 * @param {object} option - 配置选项
 * @returns {Storage} localStorage实例
 */
export function createLocalStorage(option = {}) {
  return createStorage({
    prefixKey: option.prefixKey || '',
    storage: localStorage,
  });
}

/**
 * 创建sessionStorage实例
 * @param {object} option - 配置选项
 * @returns {Storage} sessionStorage实例
 */
export function createSessionStorage(option = {}) {
  return createStorage({
    prefixKey: option.prefixKey || '',
    storage: sessionStorage,
  });
}

export const lStorage = createLocalStorage({ prefixKey });

export const sStorage = createSessionStorage({ prefixKey });
