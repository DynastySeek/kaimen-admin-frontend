import { defineMock } from '@alova/mock';
import Mock from 'mockjs';

/**
 * 角色权限相关接口 mock
 * @description 定义角色权限树的模拟数据
 */
export default defineMock(
  {
    // 角色权限数组接口
    '/api/role/permissions': () => {
      return [
        { type: 'MENU', code: 'SysMgt' },
        { type: 'MENU', code: 'Resource_Mgt' },
        { type: 'MENU', code: 'RoleMgt' },
        { type: 'MENU', code: 'RoleUser' },
        { type: 'MENU', code: 'UserMgt' },
        { type: 'BUTTON', code: 'AddUser' },
      ];
    },

    // 角色列表接口
    '/api/role/list': ({ query }) => {
      const { page = 1, size = 10, name, code } = query;

      // 生成角色数据
      const generateRoles = (count) => {
        return Mock.mock({
          [`list|${count}`]: [
            {
              'id|+1': 1,
              'name': () => `${Mock.Random.ctitle(2, 6)}角色`,
              'code': () => Mock.Random.word(4, 10).toUpperCase(),
              'description': () => Mock.Random.csentence(5, 20),
              'enable|1': [true, false],
              'createTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
              'updateTime': () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
            },
          ],
        }).list;
      };

      // 生成总数据
      let allRoles = generateRoles(20);

      // 添加固定角色
      allRoles.unshift({
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '系统超级管理员，拥有所有权限',
        enable: true,
        createTime: '2024-01-01 00:00:00',
        updateTime: '2024-01-01 00:00:00',
      });

      // 根据搜索条件过滤
      if (name) {
        allRoles = allRoles.filter(role => role.name.includes(name));
      }
      if (code) {
        allRoles = allRoles.filter(role => role.code.includes(code));
      }

      const total = allRoles.length;
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + Number.parseInt(size);
      const list = allRoles.slice(startIndex, endIndex);

      return {
        list,
        total,
        page: Number.parseInt(page),
        size: Number.parseInt(size),
      };
    },

    // 角色详情接口
    '/api/role/:id': ({ params }) => {
      const { id } = params;

      if (id === '1') {
        return {
          id: 1,
          name: '超级管理员',
          code: 'SUPER_ADMIN',
          description: '系统超级管理员，拥有所有权限',
          enable: true,
          createTime: '2024-01-01 00:00:00',
          updateTime: '2024-01-01 00:00:00',
        };
      }

      return Mock.mock({
        id: Number(id),
        name: () => `${Mock.Random.ctitle(2, 6)}角色`,
        code: () => Mock.Random.word(4, 10).toUpperCase(),
        description: () => Mock.Random.csentence(5, 20),
        enable: true,
        createTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updateTime: () => Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      });
    },
  },
  true, // 启用此组 mock 接口
);
