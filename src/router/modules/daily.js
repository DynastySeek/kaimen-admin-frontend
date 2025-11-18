
/**
 * 每日精品评选
 * @description 每日精品评选
 */

export const daily = [
  {
    name: 'Daily',
    path: '/daily',
    redirect: '/daily/list',
    meta: {
      title: '每日精品评选',
      icon: 'i-fe:like',
      show: true,
      enable: true,
      order: 4,
    },
     children: [
        {
          name: 'DailyList',
          path: '/daily/list',
          component: () => import('@/views/daily/daily-list.vue'),
          meta: {
            title: '评选列表',
            keepAlive: true,
            show: true,
            enable: true,
          }
        },

        {
          name: 'ExchangeList',
          path: '/exchange/list',
          component: () => import('@/views/daily/exchange-list.vue'),
          meta: {
            title: '兑换列表',
            keepAlive: true,
            show: true,
            enable: true,
          }
        },
    ]
    }
];
