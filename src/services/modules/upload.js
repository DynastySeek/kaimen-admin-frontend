import alovaInstance from '../alovaInstance';

/**
 * 上传图片
 * @param {File} file - 要上传的图片文件
 * @returns {Promise} 上传结果
 */
export function fetchUploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  return alovaInstance.Post('/upload/image', formData);
}
