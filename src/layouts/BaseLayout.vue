<template>
  <div class="wh-full flex">
    <aside
      class="flex-col flex-shrink-0 transition-width-300"
      :class="appStore.collapsed ? 'w-64' : 'w-220'"
      border-r="1px solid light_border dark:dark_border"
    >
      <Sidebar />
    </aside>

    <article class="w-0 flex-col flex-1">
      <Header class="h-60 flex-shrink-0" />
      <slot />
    </article>
  </div>
</template>

<script setup>
import { useAppStore } from '@/stores';
import { Header, Sidebar } from './components';

const appStore = useAppStore();
</script>

<style>
.collapsed {
  width: 64px;
}
</style>
