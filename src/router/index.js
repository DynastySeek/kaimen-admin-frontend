import { createRouter, createWebHistory } from 'vue-router';
import { VITE_PUBLIC_PATH } from '@/config/env';
import { basicRoutes } from './basic-routes';
import { setupRouterGuards } from './guards';

export const router = createRouter({
  history: createWebHistory(VITE_PUBLIC_PATH),
  routes: basicRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export async function setupRouter(app) {
  app.use(router);
  setupRouterGuards(router);
}
