import cloudbase from './cloudbase';

/**
 * 批量获取文件临时链接
 * @param fileIDs 云文件ID数组
 * @returns {Promise<Array<{fileID: string, tempFileURL: string}>>}
 */
export async function getTempFileUrls(fileIDs) {
  try {
    const res = await cloudbase.getTempFileURL({
      fileList: fileIDs,
    });
    return res.fileList;
  } catch (err) {
    console.error('获取临时链接失败:', err);
    throw err; // 抛出错误由调用方处理
  }
}
