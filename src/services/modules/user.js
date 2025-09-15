import alovaInstance from '../alovaInstance';

/**
 * 获取当前登录用户信息
 * @returns {Promise<User>} 用户信息
 */
export const fetchCurrentUserInfo = () => alovaInstance.Get('/api/users/current');

/**
 * 更新当前用户信息
 * @param {UpdateUserInfoParams} data - 请求参数
 * @returns {Promise<User>} 更新后的用户信息
 */
export const fetchUpdateUserInfo = data => alovaInstance.Put('/api/users/update', data);

/**
 * 获取用户列表
 * @param {UserListParams} data - 请求参数
 * @returns {Promise<User[]>} 用户列表
 */
export const fetchUserList = data => alovaInstance.Get('/api/users/list', { params: data });

/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 用户信息
 */
export const fetchUserInfoById = userId => alovaInstance.Get(`/api/users/info/${userId}`);

/**
 * 创建新用户
 * @param {CreateUserParams} data - 请求参数
 * @returns {Promise<User>} 创建的用户信息
 */
export const fetchCreateUser = data => alovaInstance.Post('/api/users/create', data);

/**
 * 删除用户
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 删除的用户信息
 */
export const fetchDeleteUser = userId => alovaInstance.Delete(`/api/users/delete/${userId}`);

/**
 * 启用用户
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 启用停用后的用户信息
 */
export const fetchEnableDisableUser = userId => alovaInstance.Put(`/api/users/enable/${userId}`);

/**
 * 停用用户
 * @param {string} userId - 用户ID
 * @returns {Promise<User>} 启用停用后的用户信息
 */
export const fetchDisableUser = userId => alovaInstance.Put(`/api/users/disable/${userId}`);
