// 内核
import cloudbase from '@cloudbase/js-sdk/app';
// 登录模块
import '@cloudbase/js-sdk/auth';
// 云函数模块
import '@cloudbase/js-sdk/functions';
// 云存储模块
import '@cloudbase/js-sdk/storage';

const app = cloudbase.init({
  // env: 'lowcode-3gkr3shu8224cfca',
  env: 'cloudbase-3g9zthei11410463',
});

const auth = app.auth();

async function login() {
  await auth.signInAnonymously();
  // 匿名登录成功检测登录状态isAnonymous字段为true
  await auth.getLoginState();
}

login();

export default app;
