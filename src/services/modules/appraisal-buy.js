import alovaInstance from '../alovaInstance';

/**
 * 获取求购单列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.phone] - 手机号
 * @param {string} [params.type] - 类型
 * @param {string} [params.desc] - 描述
 * @returns {Promise} 求购单列表数据
 */
export function fetchAppraisalBuyList(params) {
  return alovaInstance.Get('/appraisal-buy/list', {
    params,
  });
}
