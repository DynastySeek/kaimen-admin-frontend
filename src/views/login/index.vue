<template>
  <div class="wh-full flex-col bg-[url(@/assets/images/login_bg.webp)] bg-cover">
    <div class="m-auto max-w-700 min-w-345 f-c-c rounded-8 auto-bg bg-opacity-20 bg-cover p-12 card-shadow">
      <div class="hidden w-380 px-20 py-35 md:block">
        <img src="@/assets/images/login_banner.webp" class="w-full" alt="login_banner">
      </div>

      <div class="w-320 flex-col px-20 py-32">
        <h2 class="f-c-c text-24 text-#6a6a6a font-normal">
          <img src="@/assets/images/logo.png" class="mr-12 h-50">
          {{ title }}
        </h2>
        <n-input
          v-model:value="loginInfo.username" autofocus class="mt-32 h-40 items-center" placeholder="请输入用户名"
          :maxlength="20"
        >
          <template #prefix>
            <i class="i-fe:user mr-12 opacity-20" />
          </template>
        </n-input>
        <n-input
          v-model:value="loginInfo.password" class="mt-20 h-40 items-center" type="password"
          show-password-on="mousedown" placeholder="请输入密码" :maxlength="20" @keydown.enter="handleLogin()"
        >
          <template #prefix>
            <i class="i-fe:lock mr-12 opacity-20" />
          </template>
        </n-input>

        <!-- 验证码功能已注释
        <div class="mt-20 flex items-center">
          <n-input
            v-model:value="loginInfo.captcha"
            class="h-40 items-center"
            palceholder="请输入验证码"
            :maxlength="4"
            @keydown.enter="handleLogin()"
          >
            <template #prefix>
              <i class="i-fe:key mr-12 opacity-20" />
            </template>
          </n-input>
          <img
            v-if="captchaUrl"
            :src="captchaUrl"
            alt="验证码"
            height="40"
            class="ml-12 w-80 cursor-pointer"
            @click="initCaptcha"
          >
        </div>
        -->

        <div class="mt-20 flex items-center">
          <n-button class="h-40 flex-1 rounded-5 text-16" type="primary" :loading="loading" @click="handleLogin()">
            登录
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { VITE_APP_TITLE } from '@/config/env';
import { fetchLogin } from '@/services';
import { useAuthStore } from '@/store';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const title = VITE_APP_TITLE;

const loginInfo = ref({
  username: 'charlie',
  password: 'charlie123',
});

// 验证码功能已注释
// const captchaUrl = ref('');
// const initCaptcha = throttle(() => {
//   captchaUrl.value = `${VITE_BASE_REQUEST_API}/auth/captcha?${Date.now()}`;
// }, 500);
// initCaptcha();

const loading = ref(false);
async function handleLogin() {
  const { username, password } = loginInfo.value;
  if (!username || !password) {
    return $message.warning('请输入用户名和密码');
  }
  // 验证码验证已注释
  // if (!captcha) {
  //   return $message.warning('请输入验证码');
  // }
  try {
    loading.value = true;
    $message.loading('正在验证，请稍后...', { key: 'login' });
    // 移除验证码参数和isQuick参数
    const { data } = await fetchLogin({ username, password: password.toString() });
    console.log('🍈 -> handleLogin -> data:', data);
    onLoginSuccess(data);
  } catch (error) {
    // 验证码相关逻辑已注释
    // if (error?.code === 10003) {
    //   initCaptcha();
    // }
    $message.destroy('login');
    console.error(error);
  }
  loading.value = false;
}

async function onLoginSuccess(data = {}) {
  authStore.setToken(data);
  $message.loading('登录中...', { key: 'login' });
  try {
    $message.success('登录成功', { key: 'login' });
    if (route.query.redirect) {
      const path = route.query.redirect;
      delete route.query.redirect;
      router.push({ path, query: route.query });
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error(error);
    $message.destroy('login');
  }
}
</script>
