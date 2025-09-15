import authMock from './auth.js';
import roleMock from './role.js';
import userMock from './user.js';

/**
 * Mock 数据配置入口文件
 * @description 统一管理所有模块的 mock 数据
 */
export const mockGroups = [userMock, authMock, roleMock];

export default mockGroups;
