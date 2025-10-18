import { Permission } from '@/constants';

/**
 * 文章管理路由
 * @description 文章相关的路由配置
 */
export const articleRoutes = [
  {
    name: 'ArticleMgt',
    path: '/article',
    redirect: '/article/list',
    meta: {
      title: '文章管理',
      icon: 'i-fe:book-open',
      code: Permission.ArticleMgt,
      show: true,
      enable: true,
      order: 2,
    },
    children: [
      {
        name: 'ArticleList',
        path: '/article/list',
        component: () => import('@/views/article/list.vue'),
        meta: {
          title: '文章列表',
          keepAlive: true,
          code: Permission.ArticleList,
          show: true,
          enable: true,
        },
      },
      {
        name: 'ArticleDetail',
        path: '/article/detail',
        component: () => import('@/views/article/detail.vue'),
        meta: {
          title: '文章详情',
          keepAlive: false,
          code: Permission.ArticleDetail,
          show: false,
          enable: true,
        },
      },
    ],
  },
];
