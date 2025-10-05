import alovaInstance from '../alovaInstance';

/**
 * 登录
 * @param {LoginParams} data - 请求参数
 * @returns {Promise<User>} 用户信息
 */
export const fetchLogin = data => alovaInstance.Post('/auth/login', data);

/**
 * 注册
 * @param {RegisterParams} data - 请求参数
 * @returns {Promise<User>} 用户信息
 */
export const fetchRegister = data => alovaInstance.Post('/auth/register', data);

/**
 * 忘记密码
 * @param {ForgotPasswordParams} data - 请求参数
 * @returns {Promise<void>} 修改结果
 */
export const fetchForgotPassword = data => alovaInstance.Post('/auth/forget-password', data);

/**
 * 发送邮箱验证码
 * @param {SendEmailCodeParams} data - 请求参数
 * @returns {Promise<void>} 发送结果
 */
export const fetchSendEmailCode = data => alovaInstance.Post('/auth/send-sms-code', data);

/**
 * 修改密码
 * @param {ChangePasswordParams} data - 请求参数
 * @returns {Promise<void>} 修改结果
 */
export const fetchChangePassword = data => alovaInstance.Put('/auth/change-password', data);

/**
 * 退出登录
 * @returns {Promise<void>} 退出结果
 */
export const fetchLogout = () => alovaInstance.Post('/auth/logout');
