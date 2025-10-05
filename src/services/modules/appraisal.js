import alovaInstance from '../alovaInstance';

/**
 * 分页查询鉴定单列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认20
 * @param {string} [params.appraisalId] - 鉴定ID (可选)
 * @param {string} [params.phone] - 用户手机号 (可选)
 * @param {string} [params.title] - 标题 (可选)
 * @param {string} [params.appraisalClass] - 类目 (可选)
 * @param {string} [params.createStartTime] - 创建开始时间 (可选) YYYY-MM-DD HH:mm:ss
 * @param {string} [params.createEndTime] - 创建结束时间 (可选) YYYY-MM-DD HH:mm:ss
 * @param {string} [params.updateStartTime] - 修改开始时间 (可选) YYYY-MM-DD HH:mm:ss
 * @param {string} [params.updateEndTime] - 修改结束时间 (可选) YYYY-MM-DD HH:mm:ss
 * @param {string} [params.lastSubmitUser] - 最后提交鉴定师 (可选)
 * @returns {Promise<object>} 分页查询结果
 */
export const fetchAppraisalList = params => alovaInstance.Get('/appraisal/list', { params });

/**
 * 批量查询鉴定单详情
 * @param {object} data - 请求参数
 * @param {string[]} data.ids - 鉴定单ID数组
 * @returns {Promise<object[]>} 鉴定单详情数组
 */
export const fetchAppraisalDetail = data => alovaInstance.Post('/appraisal/detail', data);

/**
 * 批量修改鉴定单
 * @param {object[]} data - 修改项目数组
 * @param {string} data[].id - 鉴定单ID
 * @param {string} data[].appraisal_class - 鉴定类目
 * @param {string} data[].appraisal_status - 鉴定状态
 * @returns {Promise<object>} 批量修改结果
 */
export const fetchAppraisalUpdate = data => alovaInstance.Post('/order/update', data);

/**
 * 批量添加鉴定结果
 * @param {object[]} items - 鉴定结果数组
 * @param {string} items[].orderId - 订单ID
 * @param {string} items[].appraisalResult - 鉴定结果
 * @param {string} items[].comment - 鉴定评语
 * @param {string} items[].reason - 原因
 * @param {string} items[].userId - 用户ID
 * @param {string} items[].customReason - 自定义原因
 * @returns {Promise<object>} 批量添加结果
 */
export const fetchAppraisalResultAdd = items => alovaInstance.Post('/appraisal/result/add', { items });
