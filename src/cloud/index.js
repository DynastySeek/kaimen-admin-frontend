import { chunk } from 'lodash-es';
import cloudbase from './cloudbase';

/**
 * 批量获取文件临时链接
 * @param fileIDs 云文件ID或可直接访问的 http(s) 链接数组
 * @returns {Promise<Array<{fileID: string, tempFileURL: string}>>}
 */
export async function getTempFileUrls(fileIDs) {
  try {
    if (!Array.isArray(fileIDs) || fileIDs.length === 0) {
      return [];
    }
    // 拆分：可直接访问的 http(s) 链接 与 云端 fileID
    const httpLinks = [];
    const cloudIDs = [];
    for (const id of fileIDs) {
      const str = String(id || '');
      if (/^https?:\/\//i.test(str)) {
        httpLinks.push(str);
      } else {
        cloudIDs.push(str);
      }
    }

    // 直接可用的链接，映射为统一结构
    const urlResults = httpLinks.map(url => ({ fileID: url, tempFileURL: url }));

    // 云端 fileID：分块请求（每次最多 50 个）
    let cloudResults = [];
    if (cloudIDs.length > 0) {
      const chunks = chunk(cloudIDs, 50);
      const responses = await Promise.all(
        chunks.map(fileList => cloudbase.getTempFileURL({ fileList })),
      );
      cloudResults = responses.flatMap(res => res.fileList || []);
    }

    // 合并返回
    return [...urlResults, ...cloudResults];
  } catch (err) {
    console.error('获取临时链接失败:', err);
    $message.error('获取云服务资源链接失败');
    throw err; // 抛出错误由调用方处理
  }
}
