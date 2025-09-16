import { createRouter, createWebHistory } from 'vue-router';
import { VITE_PUBLIC_PATH } from '@/config/env';
import { basicRoutes } from './modules/basic';
import { createPageLoadingGuard } from './page-loading';
import { createPermissionGuard } from './permission';
import { createTabGuard } from './tab';

export const router = createRouter({
  history: createWebHistory(VITE_PUBLIC_PATH),
  routes: basicRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export async function setupRouter(app) {
  app.use(router);
  createPageLoadingGuard(router);
  createPermissionGuard(router);
  createTabGuard(router);
}
