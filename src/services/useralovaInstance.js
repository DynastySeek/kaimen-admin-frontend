import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import vueHook from 'alova/vue';
import { isLocal, VITE_PROXY_BASE_REQUEST_User_API } from '@/config/env';
import { cleanParams, getToken, isObject, sleep } from '@/utils';

const alovaInstance = createAlova({
  baseURL: isLocal ? '/aiuser' : VITE_PROXY_BASE_REQUEST_User_API,
  requestAdapter: adapterFetch(),
  statesHook: vueHook,
  cacheFor: null,
  timeout: 10000,
  beforeRequest: (method) => {
    const token = getToken();
    if (method.type === 'GET' && method.config.params) {
      method.config.params = cleanParams(method.config.params);
    }

    if (method.data && isObject(method.data)) {
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
      const json = await response.json();;
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

      return json;
    },
  },
});

export default alovaInstance;
