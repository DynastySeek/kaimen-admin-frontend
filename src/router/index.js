import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { VITE_PUBLIC_PATH, VITE_USE_HASH } from '@/config/env';
import { basicRoutes } from './basic-routes';
import { setupRouterGuards } from './guards';

export const router = createRouter({
  history:
    VITE_USE_HASH
      ? createWebHashHistory(VITE_PUBLIC_PATH)
      : createWebHistory(VITE_PUBLIC_PATH),
  routes: basicRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export async function setupRouter(app) {
  app.use(router);
  setupRouterGuards(router);
}
