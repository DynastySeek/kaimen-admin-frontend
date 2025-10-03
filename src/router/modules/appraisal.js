/**
 * 鉴定单管理路由
 * @description 鉴定单相关的路由配置
 */
export const appraisalRoutes = [
  {
    name: 'AppraisalMgt',
    path: '/appraisal',
    redirect: '/appraisal/list',
    meta: {
      title: '鉴定单管理',
      icon: 'i-fe:file-text',
      code: 'AppraisalMgt',
      show: true,
      enable: true,
      order: 1,
    },
    children: [
      {
        name: 'AppraisalList',
        path: '/appraisal/list',
        component: () => import('@/views/appraisal/index.vue'),
        meta: {
          title: '鉴定单列表',
          icon: 'i-fe:list',
          keepAlive: true,
          code: 'AppraisalList',
          show: true,
          enable: true,
        },
      },
    ],
  },
];
