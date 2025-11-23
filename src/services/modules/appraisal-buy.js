import alovaInstance from '../alovaInstance';

/**
 * 获取求购单列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.id] - 求购ID
 * @param {string} [params.type] - 类目
 * @param {string} [params.desc] - 描述
 * @param {string} [params.expected_price] - 心理价位
 * @param {string} [params.auth_phone] - 用户登录授权手机号
 * @param {string} [params.phone] - 用户填写联系方式
 * @param {string} [params.createStartTime] - 创建开始时间 YYYY-MM-DD HH:mm:ss
 * @param {string} [params.createEndTime] - 创建结束时间 YYYY-MM-DD HH:mm:ss
 * @returns {Promise} 求购单列表数据
 */
export function fetchAppraisalBuyList(params) {
  return alovaInstance.Get('/appraisalBuy/query', {
    params,
  });
}
