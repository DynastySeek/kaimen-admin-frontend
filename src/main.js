import { createApp } from 'vue';
import { videoPlay as VideoPlay } from 'vue3-video-play/lib/index.js';
import App from './App.vue';
import { VITE_PUBLIC_RESOURCE_PATH } from './config/env';
import { setupDirectives } from './directives';
import { setupRouter } from './router';
import { setupStore } from './stores';
import { setupNaiveDiscreteApi } from './utils';
import 'vue3-video-play/dist/style.css';
import '@/styles/reset.css';
import '@/styles/global.css';
import 'uno.css';

// 全局资源路径构建函数，模板中可直接使用：$resourceUrl('xx')
function resourceUrl(path = '') {
  const p = String(path || '');
  // 绝对/数据/Blob URL 原样返回
  if (/^(?:https?:|data:|blob:|\/\/)/.test(p)) {
    return p;
  }
  const base = VITE_PUBLIC_RESOURCE_PATH || '';
  const baseTrimmed = base.replace(/\/+$/, '');
  const pathTrimmed = p.replace(/^\/+/, '');
  return baseTrimmed ? `${baseTrimmed}/${pathTrimmed}` : `/${pathTrimmed}`;
}

async function bootstrap() {
  const app = createApp(App);
  app.config.globalProperties.$resourceUrl = resourceUrl;
  setupStore(app);
  setupDirectives(app);
  app.use(VideoPlay);
  await setupRouter(app);
  app.mount('#app');
  setupNaiveDiscreteApi();
}

bootstrap();
