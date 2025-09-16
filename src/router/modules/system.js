/**
 * 系统管理路由
 * @description 系统管理相关的路由配置
 */
export const systemRoutes = [
  {
    name: 'SysMgt',
    path: '/system',
    // component: () => import('@/layouts/BaseLayout.vue'),
    redirect: '/pms/resource',
    meta: {
      title: '系统管理',
      icon: 'i-fe:grid',
    },
    children: [
      {
        name: 'Resource_Mgt',
        path: '/pms/resource',
        component: () => import('@/views/pms/resource/index.vue'),
        meta: {
          title: '资源管理',
          icon: 'i-fe:list',
        },
      },
      {
        name: 'RoleMgt',
        path: '/pms/role',
        component: () => import('@/views/pms/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'i-fe:user-check',
        },
        children: [
          {
            name: 'RoleUser',
            path: '/pms/role/user/:roleId',
            component: () => import('@/views/pms/role/role-user.vue'),
            meta: {
              title: '分配用户',
              icon: 'i-fe:user-plus',
              layout: 'full',
              hideInMenu: true,
            },
          },
        ],
      },
      {
        name: 'UserMgt',
        path: '/pms/user',
        component: () => import('@/views/pms/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'i-fe:user',
          keepAlive: true,
        },
      },
    ],
  },
];
