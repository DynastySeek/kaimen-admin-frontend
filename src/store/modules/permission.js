import { defineStore } from 'pinia';
import { h } from 'vue';
import { authRoutes } from '@/router';
import { fetchPermissions } from '@/services';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    accessRoutes: [],
    permissions: [],
    menus: [],
  }),

  actions: {
    /** 更新权限数据 */
    async updatePermissions() {
      try {
        const data = await fetchPermissions();
        this.setPermissions(data);
      } catch (error) {
        console.error('获取权限失败:', error);
        throw error;
      }
    },
    /** 设置权限数据 */
    setPermissions(permissions) {
      this.permissions = permissions;
      this.menus = this.getMenus(this.permissions);
    },
    /** 根据权限数据生成菜单树 */
    getMenus(permissions) {
      const filteredRoutes = this.generateRoute(permissions);
      const generateMenuFromRoute = (route, _parentKey = null) => {
        if (!route.meta || route.meta.show === false) {
          return null;
        }
        if (route.path && !route.path.startsWith('http')) {
          this.accessRoutes.push(route);
        }
        const menuItem = {
          label: route.meta.title,
          key: route.name,
          path: route.path,
          originPath: route.meta.originPath,
          icon: () => h('i', { class: `${route.meta.icon} text-16` }),
          order: route.meta.order ?? 0,
        };
        if (route.children && route.children.length) {
          menuItem.children = route.children
            .map(child => generateMenuFromRoute(child, menuItem.key))
            .filter(item => !!item)
            .sort((a, b) => a.order - b.order);
          if (!menuItem.children.length) {
            delete menuItem.children;
          }
        }
        return menuItem;
      };
      return filteredRoutes
        .map(route => generateMenuFromRoute(route))
        .filter(item => !!item)
        .sort((a, b) => a.order - b.order);
    },
    /** 根据权限数据过滤 authRoutes 生成路由树 */
    generateRoute(permissions) {
      const menuPermissions = permissions.filter(item => item.type === 'MENU');
      const filterRoutes = (routes) => {
        const filteredRoutes = [];
        for (const route of routes) {
          if (route.meta?.code) {
            const hasPermission = menuPermissions.some(item => item.code === route.meta?.code);
            if (!hasPermission) {
              continue;
            }
          }
          const newRoute = { ...route };
          if (route.children && route.children.length > 0) {
            const filteredChildren = filterRoutes(route.children);
            if (filteredChildren.length > 0) {
              newRoute.children = filteredChildren;
            }
          }
          filteredRoutes.push(newRoute);
        }
        return filteredRoutes;
      };
      return filterRoutes(authRoutes);
    },
    /** 重置权限相关状态 */
    resetPermission() {
      this.$reset();
    },
  },
});
