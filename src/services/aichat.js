import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import vueHook from 'alova/vue';
import { cleanParams,isObject, getToken } from '@/utils';
import { isLocal, VITE_PROXY_BASE_REQUEST_AI_API } from '@/config/env';
const alovaInstance = createAlova({
  baseURL: isLocal ? '/aichat' : VITE_PROXY_BASE_REQUEST_AI_API,
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


    method.config.headers = {
      ...method.config.headers,
      Authorization: "Bearer app-s8l0tNc5oPbHVJBeoLCXoPMg",
    };
  },
  responded: {
    // 成功响应处理
    onSuccess: async (response) => {
      const json = await response.json();
      return json;
    },
  },
});

export default alovaInstance;
