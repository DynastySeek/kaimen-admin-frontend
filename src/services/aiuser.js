import { createAlova } from 'alova';
import adapterFetch from 'alova/fetch';
import vueHook from 'alova/vue';
import { cleanParams,isObject, } from '@/utils';
import { isLocal  } from '@/config/env';
const alovaInstance = createAlova({
  baseURL: isLocal ? '/aiuser' : 'https://kaimen-d-app-server-164046-6-1360990667.sh.run.tcloudbase.com',
  requestAdapter: adapterFetch(),
  statesHook: vueHook,
  cacheFor: null,
  timeout: 10000,
  beforeRequest: (method) => {
    if (method.type === 'GET' && method.config.params) {
      method.config.params = cleanParams(method.config.params);
    }

    if (method.data && isObject(method.data)) {
      method.data = cleanParams(method.data);
    }


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
