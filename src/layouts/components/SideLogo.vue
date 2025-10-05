<template>
  <router-link class="h-60 f-c-c" to="/">
    <TheLogo />
    <h2
      v-show="!appStore.collapsed"
      class="ml-10 max-w-140 flex-shrink-0 text-16 color-primary font-bold"
    >
      {{ title }}
    </h2>
  </router-link>
</template>

<script setup>
import { TheLogo } from '@/components';
import { VITE_APP_TITLE } from '@/config/env';
import { useAppStore } from '@/stores';

const title = VITE_APP_TITLE;

const appStore = useAppStore();
</script>
