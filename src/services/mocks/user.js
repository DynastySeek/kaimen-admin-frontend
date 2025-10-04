import { defineMock } from '@alova/mock';
import Mock from 'mockjs';

/**
 * 用户相关接口 mock
 * @description 定义用户列表和用户详情的模拟数据
 */
export default defineMock(
  {
    // 用户列表接口
    '/api/users/list': ({ query }) => {
      const { page = 1, size = 10, username, email, phone, status } = query;

      // 生成用户数据
      const generateUsers = (count) => {
        return Mock.mock({
          [`list|${count}`]: [
            {
              'id|+1': 1,
              'username': () => Mock.Random.word(5, 10),
              'name': () => Mock.Random.cname(),
              'phone': () => Mock.Random.string('number', 11),
              'email': () => Mock.Random.email(),
              'role|1': ['admin', 'user', 'manager'],
              'status|1': ['active', 'inactive'],
              'create_time': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
              'update_time': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
            },
          ],
        }).list;
      };

      // 生成总数据
      let allUsers = generateUsers(100);

      // 根据搜索条件过滤
      if (username) {
        allUsers = allUsers.filter(user => user.username.includes(username));
      }
      if (email) {
        allUsers = allUsers.filter(user => user.email.includes(email));
      }
      if (phone) {
        allUsers = allUsers.filter(user => user.phone.includes(phone));
      }
      if (status) {
        allUsers = allUsers.filter(user => user.status === status);
      }

      const total = allUsers.length;
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + Number.parseInt(size);
      const list = allUsers.slice(startIndex, endIndex);

      return {
        list,
        total,
        page: Number.parseInt(page),
        size: Number.parseInt(size),
      };
    },

    // 用户详情接口
    '/api/users/current': ({ query }) => {
      const { userId } = query;

      return Mock.mock({
        id: userId || 1,
        username: 'admin',
        enable: true,
        createTime: Mock.Random.datetime('yyyy-MM-ddTHH:mm:ss.SSSZ'),
        updateTime: Mock.Random.datetime('yyyy-MM-ddTHH:mm:ss.SSSZ'),
        profile: {
          id: userId || 1,
          nickName: 'Admin',
          gender: null,
          address: null,
          email: null,
          userId: userId || 1,
        },
        roles: [
          {
            id: 1,
            code: 'SUPER_ADMIN',
            name: '超级管理员',
            enable: true,
          },
          {
            id: 2,
            code: 'ROLE_QA',
            name: '质检员',
            enable: true,
          },
        ],
        currentRole: {
          id: 1,
          code: 'SUPER_ADMIN',
          name: '超级管理员',
          enable: true,
        },
      });
    },
  },
  true, // 启用此组 mock 接口
);
