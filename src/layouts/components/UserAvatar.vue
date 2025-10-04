<template>
  <n-dropdown :options="options" @select="handleSelect">
    <div id="user-dropdown" class="flex cursor-pointer items-center">
      <n-avatar round :size="36" :src="userStore.avatar || DefaultAvatar" />
      <div v-if="userStore.userInfo" class="ml-12 flex-col flex-shrink-0 items-center">
        <span class="text-14">{{ userStore.nickName ?? userStore.username }}</span>
        <span class="text-12 opacity-50">[{{ userStore.currentRole?.name }}]</span>
      </div>
    </div>
  </n-dropdown>
</template>

<script setup>
import DefaultAvatar from '@/assets/images/default_avatar.png';
import { fetchLogout } from '@/services';
import { useAuthStore, useUserStore } from '@/store';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();

const options = reactive([
  {
    label: '个人资料',
    key: 'profile',
    icon: () => h('i', { class: 'i-material-symbols:person-outline text-14' }),
  },
  {
    label: '系统信息',
    key: 'systemInfo',
    icon: () => h('i', { class: 'i-material-symbols:info-outline text-14' }),
  },
  {
    label: '退出登录',
    key: 'logout',
    icon: () => h('i', { class: 'i-mdi:exit-to-app text-14' }),
  },
]);

function handleSelect(key) {
  switch (key) {
    case 'profile':
      router.push('/profile');
      break;
    case 'systemInfo':
      router.push('/system-info');
      break;
    case 'logout':
      $dialog.confirm({
        title: '提示',
        type: 'info',
        content: '确认退出？',
        async confirm() {
          try {
            await fetchLogout();
          } catch (error) {
            console.error(error);
          }
          authStore.logout();
          $message.success('已退出登录');
        },
      });
      break;
  }
}
</script>
