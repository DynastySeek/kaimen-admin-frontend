import { defineMock } from '@alova/mock';
import Mock from 'mockjs';

/**
 * 认证相关接口 mock
 * @description 定义登录、注册、忘记密码等认证相关的模拟数据
 */
export default defineMock(
  {
    // 登录接口
    '[POST]/api/auth/login': ({ data }) => {
      const { username, password } = data;

      // 模拟登录验证
      if (username === 'admin' && password === '123456') {
        return {
          accessToken: Mock.mock('@guid'),
          userInfo: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            userType: 'admin',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00',
          },
        };
      } else if (username === 'user' && password === '123456') {
        return {
          accessToken: Mock.mock('@guid'),
          userInfo: {
            id: 2,
            username: 'user',
            email: 'user@example.com',
            userType: 'user',
            avatar: 'https://avatars.githubusercontent.com/u/2?v=4',
            createTime: '2024-01-01 00:00:00',
            updateTime: '2024-01-01 00:00:00',
          },
        };
      } else {
        throw new Error('用户名或密码错误');
      }
    },

    // 注册接口
    '/api/auth/register': ({ data }) => {
      const { username, email, phone } = data;

      // 模拟注册成功
      return {
        id: Mock.mock('@increment'),
        username,
        email,
        phone,
        userType: 'user',
        avatar: Mock.mock('@image("200x200", "@color", "@first")'),
        createTime: Mock.mock('@datetime'),
        updateTime: Mock.mock('@datetime'),
      };
    },

    // 忘记密码接口
    '/api/auth/forget-password': () => {
      // 模拟密码重置成功
      return {
        success: true,
        message: '密码重置成功',
      };
    },

    // 发送邮箱验证码接口
    '/api/auth/send-sms-code': () => {
      // 模拟发送验证码成功
      return {
        success: true,
        message: '验证码已发送到邮箱',
        code: Mock.mock('@integer(100000, 999999)'),
      };
    },

    // 修改密码接口
    '/api/auth/change-password': () => {
      // 模拟密码修改成功
      return {
        success: true,
        message: '密码修改成功',
      };
    },
  },
  {
    baseURL: '',
    times: 1,
  },
);
