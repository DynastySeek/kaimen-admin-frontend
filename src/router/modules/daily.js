
/**
 * 每日精品评选
 * @description 每日精品评选
 */
export const daily = [
  {
    name: 'daily',
    path: '/daily/list',
    meta: {
      title: '每日精品评选',
      icon: 'i-fe:like',
      show: true,
      enable: true,
      order: 4,
    },
    component: () => import('@/views/daily/daily-list.vue'),
  },
];
