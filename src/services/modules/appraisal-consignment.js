import alovaInstance from '../alovaInstance';

/**
 * 获取传递单列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.phone] - 手机号
 * @param {string} [params.buyer_type] - 买家类型
 * @param {string} [params.desc] - 描述
 * @returns {Promise} 传递单列表数据
 */
export function fetchAppraisalConsignmentList(params) {
  return alovaInstance.Get('/appraisalConsignment/query', {
    params,
  });
}
