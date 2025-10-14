import { chunk } from 'lodash-es';
import cloudbase from './cloudbase';

/**
 * 批量获取文件临时链接
 * @param fileIDs 云文件ID数组
 * @returns {Promise<Array<{fileID: string, tempFileURL: string}>>}
 */
export async function getTempFileUrls(fileIDs) {
  try {
    if (!Array.isArray(fileIDs) || fileIDs.length === 0) {
      return [];
    }
    // 分块，getTempFileURL 最多支持 50 个 fileID
    const chunks = chunk(fileIDs, 50);
    const responses = await Promise.all(
      chunks.map(fileList => cloudbase.getTempFileURL({ fileList })),
    );
    // 合并各分块结果
    return responses.flatMap(res => res.fileList || []);
  } catch (err) {
    console.error('获取临时链接失败:', err);
    $message.error('获取云服务资源链接失败');
    throw err; // 抛出错误由调用方处理
  }
}
