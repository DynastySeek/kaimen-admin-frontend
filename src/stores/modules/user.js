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
      const  {data}  = await fetchCurrentUserInfo();
      const { userId, name, nickName, phone,role, email, avatar, roleName, createdAt, updatedAt } = data || {};
      const userInfo = {
        user_id:userId,
        username:name,
        nickname:nickName,
        phone,
        email,
        avatar,
        role,
        create_time:createdAt,
        update_time:updatedAt,
      };
      this.setUser(userInfo);
      return userInfo;
    },
  },
});
