<template>
  <n-menu
    ref="menu"
    class="side-menu"
    accordion
    :indent="18"
    :collapsed-icon-size="22"
    :collapsed-width="64"
    :collapsed="appStore.collapsed"
    :options="permissionStore.menus"
    :value="activeKey"
    @update:value="handleMenuSelect"
  />
</template>

<script setup>
import { useDialog } from 'naive-ui';
import { useAppStore, usePermissionStore } from '@/stores';
import { isExternal } from '@/utils';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const permissionStore = usePermissionStore();
const dialog = useDialog();

const activeKey = computed(() => route.meta?.parentKey || route.name);

const menu = ref(null);
watch(route, async () => {
  await nextTick();
  menu.value?.showOption();
});

function handleMenuSelect(key, item) {
  if (isExternal(item.originPath)) {
    dialog.info({
      title: `请选择打开方式`,
      positiveText: '外链打开',
      negativeText: '在本站内嵌打开',
      onPositiveClick() {
        window.open(item.originPath);
      },
      onNegativeClick: () => {
        router.push(item.path);
      },
    });
  } else {
    if (!item.path) {
      return;
    }
    router.push(item.path);
  }
}
</script>

<style>
.side-menu:not(.n-menu--collapsed) .n-menu-item-content::before {
  left: 8px;
  right: 8px;
}

.side-menu:not(.n-menu--collapsed) .n-menu-item-content.n-menu-item-content--selected::before {
  border-left: 4px solid rgb(var(--primary-color));
}
</style>
