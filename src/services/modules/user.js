import alovaInstance from '../alovaInstance';

/**
 * 获取当前登录用户信息
 * @returns {Promise<User>} 用户信息
 */
export const fetchCurrentUserInfo = () => alovaInstance.Get('/user/current');

/**
 * 更新用户信息
 * @param {object} data - 用户信息更新参数
 * @param {string} [data.nickname] - 昵称
 * @param {string} [data.email] - 邮箱
 * @param {string} [data.phone] - 手机号
 * @param {string} [data.avatar] - 头像
 * @returns {Promise<object>} 更新结果
 */
export const fetchUpdateUserInfo = data => alovaInstance.Post('/user/update', data);

/**
 * 分页查询用户列表
 * @param {object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.pageSize - 每页数量，默认20
 * @param {string} [params.username] - 用户名 (可选)
 * @param {string} [params.nickname] - 昵称 (可选)
 * @param {string} [params.email] - 邮箱 (可选)
 * @param {string} [params.phone] - 手机号 (可选)
 * @param {number} [params.status] - 用户状态 (可选)
 * @param {number} [params.userType] - 用户类型 (可选)
 * @returns {Promise<object>} 分页查询结果
 */
export const fetchUserList = params => alovaInstance.Get('/user/list', { params });

/**
 * 根据ID获取用户信息
 * @param {string|number} id - 用户ID
 * @returns {Promise<object>} 用户信息
 */
export const fetchUserInfoById = id => alovaInstance.Get(`/user/${id}`);

/**
 * 删除用户
 * @param {string|number} id - 用户ID
 * @returns {Promise<object>} 删除结果
 */
export const fetchDeleteUser = id => alovaInstance.Delete(`/user/${id}`);

/**
 * 禁用用户
 * @param {string|number} id - 用户ID
 * @returns {Promise<object>} 禁用结果
 */
export const fetchDisableUser = id => alovaInstance.Post(`/user/${id}/disable`);

/**
 * 启用/禁用用户
 * @param {object} data - 操作参数
 * @param {string|number} data.id - 用户ID
 * @param {number} data.status - 用户状态 (0: 启用, 1: 禁用)
 * @returns {Promise<object>} 操作结果
 */
export const fetchEnableDisableUser = data => alovaInstance.Post('/user/status', data);
