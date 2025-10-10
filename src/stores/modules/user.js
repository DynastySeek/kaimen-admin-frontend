import { defineStore } from 'pinia';
import { Role } from '@/constants';
import { fetchCurrentUserInfo } from '@/services';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
  }),
  getters: {
    isAdmin: state => state.userInfo?.role === Role.SuperAdmin,
    isAppraiser: state => state.userInfo?.role === Role.Appraiser,
  },
  actions: {
    setUser(user) {
      this.userInfo = user;
    },
    resetUser() {
      this.$reset();
    },
    async updateUserInfo() {
      const { data } = await fetchCurrentUserInfo();
      const { user_id, username, nickname, phone, email, avatar, role, create_time, update_time } = data || {};
      const userInfo = {
        user_id,
        username,
        nickname,
        phone,
        email,
        avatar,
        role,
        create_time,
        update_time,
      };
      this.setUser(userInfo);
      return userInfo;
    },
  },
});
