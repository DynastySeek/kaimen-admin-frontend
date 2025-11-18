import { useAuthStore, usePermissionStore, useUserStore } from '@/stores';
import { Role } from '@/constants';

const WHITE_LIST = ['/login', '/404'];
export function createPermissionGuard(router) {

  router.beforeEach(async (to) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    /** 没有token */
    if (!token) {
      if (WHITE_LIST.includes(to.path)) {
        return true;
      }
      return { path: 'login', query: { ...to.query, redirect: to.path } };
    }

    // 有token的情况
    if (to.path === '/login') {
      return { path: '/' };
    }
    if (WHITE_LIST.includes(to.path)) {
      return true;
    }

    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    if (!userStore.userInfo) {
      await userStore.updateUserInfo();
      permissionStore.updatePermissions(userStore.userInfo);
      permissionStore.accessRoutes.forEach((route) => {
        !router.hasRoute(route.name) && router.addRoute(route);
      });
      return { ...to, replace: true };
    }

    // 检查 ExchangeList 路由权限：只有超级管理员可以访问
    if (to.name === 'ExchangeList') {
      const isSuperAdmin = userStore.userInfo?.role === Role.SuperAdmin;
      if (!isSuperAdmin) {
         return { name: '403', query: { path: to.fullPath } };
      }
    }

    const routes = router.getRoutes();
    if (routes.find(route => route.name === to.name)) {
      return true;
    }

    // 判断是无权限还是404
    // const { data: hasMenu } = await api.validateMenuPath(to.path);
    // return hasMenu
    //   ? { name: '403', query: { path: to.fullPath }, state: { from: 'permission-guard' } }
    //   : { name: '404', query: { path: to.fullPath } };
    return { name: '404', query: { path: to.fullPath } };
  });
}
