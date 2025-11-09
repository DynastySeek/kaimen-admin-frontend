import { createRouter, createWebHistory } from 'vue-router';
import { VITE_PUBLIC_PATH } from '@/config/env';
import { appraisalRoutes } from './modules/appraisal';
import { articleRoutes } from './modules/article';
import { basicRoutes } from './modules/basic';
import { createPageLoadingGuard } from './page-loading';
import { createPermissionGuard } from './permission';
import { createTabGuard } from './tab';
import { daily } from './modules/daily';
import { chat } from './modules/chat';
export const authRoutes = [...appraisalRoutes, ...articleRoutes, ...daily,...chat];

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
