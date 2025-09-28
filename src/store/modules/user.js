import { defineStore } from 'pinia';
import { fetchCurrentUserInfo } from '@/services';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
  }),
  getters: {
    userId() {
      return this.userInfo?.id;
    },
    username() {
      return this.userInfo?.username;
    },
    nickName() {
      return this.userInfo?.nickName;
    },
    avatar() {
      return this.userInfo?.avatar;
    },
    currentRole() {
      return this.userInfo?.currentRole || {};
    },
    roles() {
      return this.userInfo?.roles || [];
    },
  },
  actions: {
    setUser(user) {
      this.userInfo = user;
    },
    resetUser() {
      this.$reset();
    },
    /**
     * 获取并更新当前用户信息
     * @returns {Promise<object>} 用户信息
     */
    async updateUserInfo() {
      const { data } = await fetchCurrentUserInfo();
      const { id, username, profile, roles, currentRole } = data || {};
      const userInfo = {
        id,
        username,
        avatar: profile?.avatar,
        nickName: profile?.nickName,
        gender: profile?.gender,
        address: profile?.address,
        email: profile?.email,
        roles,
        currentRole,
      };
      this.setUser(userInfo);
      return userInfo;
    },
  },
});
