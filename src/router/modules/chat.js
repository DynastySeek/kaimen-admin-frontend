
/**
 * AI客服对话列表
 * @description AI客服对话列表的路由配置
 */
export const chat = [
  {
    name: 'chat',
    path: '/chat/list',
    meta: {
      title: 'AI客服对话列表',
      icon: 'i-fe:chat',
      show: true,
      enable: true,
      order: 4,
    },
    component: () => import('@/views/chat/chat-list.vue'),
  },
];
