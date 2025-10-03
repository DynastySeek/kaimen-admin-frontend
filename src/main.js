import { createApp } from 'vue';
import { videoPlay as VideoPlay } from 'vue3-video-play/lib/index.js';
import App from './App.vue';
import { setupDirectives } from './directives';
import { setupRouter } from './router';
import { setupStore } from './store';
import { setupNaiveDiscreteApi } from './utils';
import 'vue3-video-play/dist/style.css';
import '@/styles/reset.css';
import '@/styles/global.css';
import 'uno.css';

async function bootstrap() {
  const app = createApp(App);
  setupStore(app);
  setupDirectives(app);
  app.use(VideoPlay);
  await setupRouter(app);
  app.mount('#app');
  setupNaiveDiscreteApi();
}

bootstrap();
