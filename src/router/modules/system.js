/**
 * 系统管理路由
 * @description 系统管理相关的路由配置
 */
export const systemRoutes = [
  {
    name: 'SysMgt',
    path: '/system',
    // component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/pms/user',
    meta: {
      title: '系统管理',
      icon: 'i-fe:grid',
      code: 'SysMgt',
      show: true,
      enable: true,
    },
    children: [
      {
        name: 'UserMgt',
        path: '/pms/user',
        component: () => import('@/views/pms/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'i-fe:user',
          keepAlive: true,
          code: 'UserMgt',
          show: true,
          enable: true,
          btns: [
            { code: 'AddUser', name: '创建新用户' },
          ],
        },
      },
    ],
  },
];
