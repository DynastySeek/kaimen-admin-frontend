import path from 'node:path';
import Vue from '@vitejs/plugin-vue';
import VueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';
import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import removeNoMatch from 'vite-plugin-router-warn';
import VueDevTools from 'vite-plugin-vue-devtools';
import { pluginIcons, pluginPagePathes } from './build/plugin-isme';

// 将纯字符串配置转换类型
function toTransformConfig(config) {
  const isNumberKeys = ['VITE_PORT'];
  return Object.entries(config).reduce((total, cur) => {
    const [key, value] = cur;
    if (value === 'true') {
      return { ...total, [key]: true };
    }
    if (value === 'false') {
      return { ...total, [key]: false };
    }
    if (isNumberKeys.includes(key)) {
      return { ...total, [key]: Number(value) };
    }
    return { ...total, [key]: value };
  }, {});
}

export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, process.cwd());
  const { VITE_PUBLIC_PATH, VITE_PROXY_BASE_REQUEST_API, VITE_PORT, VITE_SOURCE_MAP, VITE_GZIP, VITE_REPORT } = toTransformConfig(viteEnv);
  const packTime = new Date().getTime();

  return {
    base: VITE_PUBLIC_PATH || '/',
    plugins: [
      Vue(),
      VueJsx(),
      VueDevTools(),
      Unocss(),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: false,
      }),
      Components({
        resolvers: [NaiveUiResolver()],
        dts: false,
      }),
      // 自定义插件，用于生成页面文件的path，并添加到虚拟模块
      pluginPagePathes(),
      // 自定义插件，用于生成自定义icon，并添加到虚拟模块
      pluginIcons(),
      // 移除非必要的vue-router动态路由警告: No match found for location with path
      removeNoMatch(),
      createHtmlPlugin({
        inject: {
          data: {
            injectScript: `<script>
              window.packTime = parseInt(${packTime});
            </script>`,
          },
        },
      }),
      VITE_GZIP && viteCompression(),
      VITE_REPORT && visualizer(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
        '~': path.resolve(process.cwd()),
      },
    },
    server: {
      host: '0.0.0.0',
      port: VITE_PORT,
      open: false,
      proxy: {
        '/api': {
          // target: 'http://localhost:8000',
          target: VITE_PROXY_BASE_REQUEST_API,
          changeOrigin: true,
          // rewrite: path => path.replace(/^\/api/, ''),
          secure: false,
          configure: (proxy, options) => {
            // 配置此项可在响应头中看到请求的真实地址
            proxy.on('proxyRes', (proxyRes, req) => {
              proxyRes.headers['x-real-url'] = new URL(req.url || '', options.target)?.href || '';
            });
          },
        },
      },
    },
    build: {
      sourcemap: VITE_SOURCE_MAP,
      chunkSizeWarningLimit: 1024, // chunk 大小警告的限制（单位kb）
    },
  };
});
