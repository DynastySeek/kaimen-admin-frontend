import { defineMock } from '@alova/mock';
import Mock from 'mockjs';

/**
 * 用户相关接口 mock
 * @description 定义用户列表和用户详情的模拟数据
 */
export default defineMock(
  {
    // 用户列表接口
    '/api/user/list': ({ query }) => {
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
    '/api/user/info': ({ query }) => {
      const { userId } = query;

      return Mock.mock({
        'id': userId,
        'username': () => Mock.Random.word(5, 10),
        'name': () => Mock.Random.cname(),
        'phone': () => Mock.Random.string('number', 11),
        'email': () => Mock.Random.email(),
        'role|1': ['admin', 'user', 'manager'],
        'status|1': ['active', 'inactive'],
        'avatar': () => Mock.Random.image('200x200', Mock.Random.color(), '#FFF', 'Avatar'),
        'department': () => Mock.Random.word(3, 8),
        'position': () => Mock.Random.word(3, 6),
        'create_time': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'update_time': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'last_login_time': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        'login_count|1-1000': 1,
      });
    },
  },
  true, // 启用此组 mock 接口
);
