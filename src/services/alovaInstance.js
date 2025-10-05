import { createAlovaMockAdapter } from '@alova/mock';
import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import vueHook from 'alova/vue';
import { VITE_USE_MOCK } from '@/config/env';
import { cleanParams, getToken, sleep } from '@/utils';
import mockGroups from './mocks';

// 创建 mock 适配器
const mockAdapter = createAlovaMockAdapter(mockGroups, {
  // 全局控制是否启用 mock 接口，可以通过环境变量控制
  enable: VITE_USE_MOCK,
  // 非模拟请求适配器，用于未匹配 mock 接口时发送请求
  httpAdapter: adapterFetch(),
  // mock 接口响应延迟，单位毫秒
  sleep: 500,
  // 是否打印 mock 接口请求信息
  mockRequestLogger: true,
  // 模拟接口回调，构造适合 fetch 适配器的响应数据
  onMockResponse: (data) => {
    return { response: data };
  },
});

const alovaInstance = createAlova({
  requestAdapter: VITE_USE_MOCK ? mockAdapter : adapterFetch(),
  statesHook: vueHook,
  cacheFor: null,
  timeout: 10000,
  beforeRequest: (method) => {
    const token = getToken();

    if (method.type === 'GET' && method.config.params) {
      method.config.params = cleanParams(method.config.params);
    }

    if (method.data && typeof method.data === 'object') {
      method.data = cleanParams(method.data);
    }

    if (token) {
      method.config.headers = {
        ...method.config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  },
  responded: {
    // 成功响应处理
    onSuccess: async (response) => {
      if (VITE_USE_MOCK) {
        return { code: 200, success: true, data: response.body };
      }
      const json = await response.json();

      if (response.status >= 400 || json.success === false) {
        if (response.status === 401) {
          // 清除 token
          window.localStorage.clear();
          // 使用 window 跳转到登录页
          window.$message?.error(json.message || '登录失效，请重新登录');
          await sleep(1000);
          window.location.href = '/login';
        }
        throw new Error(json.message || '请求失败');
      }

      return json.data;
    },
  },
});

export default alovaInstance;
