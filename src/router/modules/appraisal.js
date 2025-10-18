import { Permission } from '@/constants';

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
      title: '订单管理',
      icon: 'i-fe:list',
      code: Permission.AppraisalMgt,
      show: true,
      enable: true,
      order: 1,
    },
    children: [
      {
        name: 'AppraisalList',
        path: '/appraisal/list',
        component: () => import('@/views/appraisal/list.vue'),
        meta: {
          title: '鉴定单列表',
          keepAlive: true,
          code: Permission.AppraisalList,
          show: true,
          enable: true,
        },
      },
      {
        name: 'AppraisalConsignment',
        path: '/appraisal/consignment',
        component: () => import('@/views/appraisal/consignment-list.vue'),
        meta: {
          title: '传递单列表',
          keepAlive: true,
          code: Permission.AppraisalConsignment,
          show: true,
          enable: true,
        },
      },
      {
        name: 'AppraisalBuy',
        path: '/appraisal/buy',
        component: () => import('@/views/appraisal/buy-list.vue'),
        meta: {
          title: '求购单列表',
          keepAlive: true,
          code: Permission.AppraisalBuy,
          show: true,
          enable: true,
        },
      },
    ],
  },
];
