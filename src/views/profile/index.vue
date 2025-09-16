<template>
  <AppPage>
    <n-card class="card-container">
      <FormBuilder ref="formRef" v-model="formState" :form-items="formItems" label-width="120px">
        <template #userType>
          <NTag type="primary">
            {{ UserTypeLabelMap[formState.userType] }}
          </NTag>
        </template>

        <template #status>
          <NTag :type="formState.status === UserStatus.Active ? 'success' : 'error'">
            {{ UserStatusLabelMap[formState.status] }}
          </NTag>
        </template>
        <template #createTime>
          <span>{{ formatDateTime(formState.createTime) }}</span>
        </template>
        <template #updateTime>
          <span>{{ formatDateTime(formState.updateTime) }}</span>
        </template>
      </FormBuilder>
      <NButton @click="handleCancel">
        返回
      </NButton>
      <NButton type="primary" @click="handleSubmit">
        保存
      </NButton>
      <NButton @click="showPasswordModal">
        修改密码
      </NButton>
    </n-card>

    <NModal v-model:show="passwordModalVisible" title="修改密码" style="width: 500px">
      <FormBuilder ref="passwordFormRef" v-model="passwordFormState" :form-items="passwordFormItems" label-width="120px">
        <template #smsCode>
          <div class="flex gap-x-4">
            <NInput v-model:value="passwordFormState.smsCode" placeholder="请输入邮箱验证码" />
            <NButton :disabled="remaining" @click="sendEmailCode">
              {{ remaining ? `${remaining}秒后重新发送` : '发送验证码' }}
            </NButton>
          </div>
        </template>
      </FormBuilder>
      <template #footer>
        <div class="flex justify-end gap-2">
          <NButton @click="handlePasswordCancel">
            取消
          </NButton>
          <NButton type="primary" @click="handlePasswordSubmit">
            确定
          </NButton>
        </div>
      </template>
    </NModal>
  </AppPage>
</template>

<script setup>
import { useCountdown } from '@vueuse/core';
import { NButton, NInput, NModal, NTag } from 'naive-ui';
import { computed, reactive, ref, shallowRef } from 'vue';
import { useRouter } from 'vue-router';
import FormBuilder from '@/components/FormBuilder.vue';
import { UserStatus, UserStatusLabelMap, UserTypeLabelMap } from '@/constants';
import { fetchChangePassword, fetchCurrentUserInfo, fetchUpdateUserInfo } from '@/services';
import { useAuthStore } from '@/store';
import { formatDateTime } from '@/utils';

const router = useRouter();
const authStore = useAuthStore();

// 表单相关
const formRef = ref();
const formState = reactive({
  id: '',
  username: '',
  realName: '',
  userType: '',
  gender: '',
  email: '',
  phone: '',
  avatar: '',
  status: '',
  createTime: '',
  updateTime: '',
});

const formItems = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    disabled: true,
    rules: [{ required: true, message: '请输入用户名' }],
  },
  {
    prop: 'realName',
    label: '真实姓名',
    type: 'input',
    rules: [{ required: true, message: '请输入真实姓名' }],
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    rules: [
      { required: true, message: '请输入手机号' },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的11位手机号',
        trigger: 'blur',
      },
    ],
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    rules: [
      { required: true, message: '请输入邮箱' },
      {
        type: 'email',
        message: '请输入有效的邮箱地址（如：user@example.com）',
        trigger: 'blur',
      },
    ],
  },
  {
    prop: 'avatar',
    label: '头像',
    type: 'upload',
  },
  {
    prop: 'userType',
    label: '用户类型',
    type: 'custom',
  },
  {
    prop: 'gender',
    label: '性别',
    type: 'selectDictionary',
    name: 'Gender',
    valueType: 'number',
  },
  {
    prop: 'status',
    label: '状态',
    type: 'custom',
  },
  {
    prop: 'createTime',
    label: '创建时间',
    type: 'custom',
  },
  {
    prop: 'updateTime',
    label: '更新时间',
    type: 'custom',
  },
];

// 密码修改相关
const passwordModalVisible = ref(false);
const passwordFormRef = ref();
const passwordFormState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  smsCode: '',
});

const passwordFormItems = [
  {
    prop: 'oldPassword',
    label: '原密码',
    type: 'password',
    placeholder: '请输入原密码',
    rules: [{ required: true, message: '请输入原密码' }],
  },
  {
    prop: 'newPassword',
    label: '新密码',
    type: 'password',
    placeholder: '请输入新密码',
    rules: [{ required: true, message: '请输入新密码' }],
  },
  {
    prop: 'confirmPassword',
    label: '确认密码',
    type: 'password',
    placeholder: '请再次输入新密码',
    rules: [
      { required: true, message: '请再次输入新密码' },
      {
        validator: (rule, value) => {
          if (value !== passwordFormState.newPassword) {
            return Promise.reject('两次输入的密码不一致');
          }
          return Promise.resolve();
        },
      },
    ],
  },
  {
    prop: 'smsCode',
    label: '邮箱验证码',
    type: 'custom',
    rules: [{ required: true, message: '请输入邮箱验证码' }],
  },
];

/**
 * 获取用户信息
 */
async function fetchUserInfoData() {
  try {
    const data = await fetchCurrentUserInfo();
    Object.assign(formState, data);
  } catch (_error) {
    $message.error('获取用户信息失败');
  }
}

/**
 * 处理表单提交
 */
async function handleSubmit() {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) {
      return;
    }
    await fetchUpdateUserInfo({
      realName: formState.realName,
      phone: formState.phone,
      email: formState.email,
      gender: formState.gender,
      avatar: formState.avatar,
    });
    $message.success('修改成功');
    router.push('/');
  } catch (error) {
    $message.error(error.message || '修改失败');
  }
}

/**
 * 处理取消
 */
function handleCancel() {
  router.back();
}

/**
 * 显示修改密码弹窗
 */
function showPasswordModal() {
  passwordModalVisible.value = true;
}

const countdown = shallowRef(0);
const { remaining, start } = useCountdown(countdown, {});
const isCounting = computed(() => countdown.value > 0);

/**
 * 发送邮箱验证码
 */
async function sendEmailCode() {
  try {
    if (isCounting.value) {
      return;
    }

    // await fetchSendEmailCode({ email: formState.email });
    $message.success('验证码已发送');

    start(60);
  } catch (_error) {
    $message.error('验证码发送失败');
  }
}

/**
 * 处理密码修改提交
 */
async function handlePasswordSubmit() {
  try {
    const valid = await passwordFormRef.value?.validate();
    if (!valid) {
      return;
    }
    await fetchChangePassword(passwordFormState);
    // 这里调用修改密码的API
    $message.success('密码修改成功，请重新登录');
    authStore.updateToken('');
    router.push('/login');
  } catch (error) {
    $message.error(error.message || '密码修改失败');
  }
}

/**
 * 处理密码修改取消
 */
function handlePasswordCancel() {
  passwordModalVisible.value = false;
}

// 初始化获取用户信息
fetchUserInfoData();
</script>
