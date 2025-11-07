
/**
 * 每日精选
 * @description 每日精选的路由配置
 */
export const daily = [
  {
    name: 'Daily',
    redirect: '/daily/list',
    meta: {
      title: '每日精品管理',
      icon: 'i-fe:book-open',
      show: true,
      enable: true,
      order: 3,
    },
    children: [
      {
        name: 'DailyList',
        path: '/daily/list',
        component: () => import('@/views/daily/daily-list.vue'),
        meta: {
          title: '每日精品评论',
          keepAlive: true,
          show: true,
          enable: true,
        },
      },
    ],
  },
];
