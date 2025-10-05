import alovaInstance from '../alovaInstance';

/**
 * 获取当前登录用户信息
 * @returns {Promise<User>} 用户信息
 */
export const fetchCurrentUserInfo = () => alovaInstance.Get('/user/info');
