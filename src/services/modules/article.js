import { getTempFileUrls } from '@/cloud';
import alovaInstance from '../alovaInstance';

/**
 * 分页查询文章列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认20
 * @param {string} [params.title] - 标题 (可选)
 * @param {string} [params.author] - 作者 (可选)
 * @param {string} [params.pub_status] - 发布状态 (可选)
 * @param {string} [params.createStartTime] - 创建开始时间 (可选) YYYY-MM-DD HH:mm:ss
 * @param {string} [params.createEndTime] - 创建结束时间 (可选) YYYY-MM-DD HH:mm:ss
 * @returns {Promise<object>} 分页查询结果
 */
export function fetchArticleList(params) {
  return alovaInstance.Get('/article/list', {
    params,
    async transform(rawData) {
      const { data } = rawData;

      if (data && data.list && data.list.length > 0) {
        // 提取所有cloud://开头的cover_pic
        const allCloudImages = data.list
          .map(item => item.cover_pic)
          .filter(pic => pic && pic.startsWith('cloud://'));

        if (allCloudImages.length > 0) {
          const tempFileUrls = await getTempFileUrls(allCloudImages);
          data.list.forEach((item) => {
            if (item.cover_pic && item.cover_pic.startsWith('cloud://')) {
              const tempFile = tempFileUrls.find(file => file.fileID === item.cover_pic);
              if (tempFile) {
                item.cover_pic = tempFile.tempFileURL;
              }
            }
          });
        }
      }

      return rawData;
    },
  });
}

/**
 * 获取文章详情
 * @param {string} id - 文章ID
 * @returns {Promise<object>} 文章详情
 */
export const fetchArticleDetail = id => alovaInstance.Get('/article/detail', { params: { id } });

/**
 * 创建文章
 * @param {object} data - 文章数据
 * @param {string} data.title - 标题
 * @param {string} data.author - 作者
 * @param {string} data.cover_pic - 封面图片
 * @param {string} data.rich_content - 富文本内容
 * @param {string} data.pub_status - 发布状态
 * @returns {Promise<object>} 创建结果
 */
export const fetchCreateArticle = data => alovaInstance.Post('/article/create', data);

/**
 * 更新文章
 * @param {number} article_id - 文章ID
 * @param {object} article_data - 更新数据
 * @param {string} [article_data.title] - 标题
 * @param {string} [article_data.author] - 作者
 * @param {string} [article_data.cover_pic] - 封面图片
 * @param {string} [article_data.rich_content] - 富文本内容
 * @param {string} [article_data.pub_status] - 发布状态
 * @returns {Promise<object>} 更新结果
 */
export const fetchUpdateArticle = (article_id, article_data) => alovaInstance.Put('/article/update', article_data, { params: { article_id } });

/**
 * 启用文章
 * @param {number} article_id - 文章ID
 * @returns {Promise<object>} 启用结果
 */
export const fetchEnableArticle = article_id => alovaInstance.Put('/article/enable', {}, { params: { article_id } });

/**
 * 禁用文章
 * @param {number} article_id - 文章ID
 * @returns {Promise<object>} 禁用结果
 */
export const fetchDisableArticle = article_id => alovaInstance.Put('/article/disable', {}, { params: { article_id } });
