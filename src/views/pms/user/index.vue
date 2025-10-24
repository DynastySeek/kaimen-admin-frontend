<template>
  <CommonPage>
    <template #action />
    <ProTable
      ref="proTableRef"
      detail-title="用户详情"
      detail-width="700px"
      form-width="500px"
      form-label-width="80px"
      :search-form-items="searchFormItems"
      :detail-items="detailItems"
      :form-items="formItems"
      :fetch-data="fetchUserList"
      :fetch-detail-data="row => fetchUserInfoById(row.id)"
      :fetch-delete-item="row => fetchDeleteUser(row.id)"
      :action-buttons="['view', 'delete']"
      :columns="columns"
    >
      <!-- 自定义操作按钮插槽 -->
      <template #action="{ row }">
        <n-button
          :type="row?.status === UserStatus.Active ? 'warning' : 'success'"
          quaternary
          size="small"
          @click="handleToggleStatus(row)"
        >
          {{ row?.status === UserStatus.Active ? '禁用' : '启用' }}
        </n-button>
      </template>

      <!-- 详情插槽 -->
      <template #detail-userType="{ data }">
        <n-tag type="primary">
          {{ UserTypeLabelMap[data?.userType] }}
        </n-tag>
      </template>
      <template #detail-status="{ data }">
        <n-tag :type="data?.status === UserStatus.Active ? 'success' : 'error'">
          {{ UserStatusLabelMap[data?.status] }}
        </n-tag>
      </template>
      <template #detail-createTime="{ data }">
        {{ formatDateTime(data?.createTime) }}
      </template>
      <template #detail-updateTime="{ data }">
        {{ formatDateTime(data?.updateTime) }}
      </template>
    </ProTable>
  </CommonPage>
</template>

<script setup>
import { computed, h, inject, ref } from 'vue';
import { CommonPage, ProTable } from '@/components';
import { UserStatus, UserStatusLabelMap, UserTypeLabelMap } from '@/constants';
import { fetchDeleteUser, fetchDisableUser, fetchEnableDisableUser, fetchUserInfoById, fetchUserList } from '@/services';
import { formatDateTime } from '@/utils';

const $message = inject('message');
const proTableRef = ref();

// 表格列定义
const columns = computed(() => [
  { title: '用户名', key: 'username' },
  { title: '姓名', key: 'realName' },
  { title: '手机号', key: 'phone' },
  { title: '邮箱', key: 'email' },
  {
    title: '角色',
    key: 'userType',
    render: (row) => {
      return h('n-tag', { type: 'primary' }, () => UserTypeLabelMap[row.userType]);
    },
  },
  {
    title: '状态',
    key: 'status',
    render: (row) => {
      return h('n-tag', { type: row.status === UserStatus.Active ? 'success' : 'error' }, () => UserStatusLabelMap[row.status]);
    },
  },
  {
    title: '创建时间',
    key: 'createTime',
    render: row => formatDateTime(row.createTime),
  },
]);

/**
 * 处理用户状态切换（启用/禁用）
 * @param {object} row - 用户行数据
 */
async function handleToggleStatus(row) {
  try {
    if (row.status === UserStatus.Active) {
      await fetchDisableUser(row.id);
      $message.success('用户已禁用');
    } else {
      await fetchEnableDisableUser(row.id);
      $message.success('用户已启用');
    }
    // 刷新表格数据
    proTableRef.value?.refresh();
  } catch (error) {
    console.error('切换用户状态失败:', error);
    $message.error('操作失败');
  }
}

// 搜索表单项配置
const searchFormItems = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    props: {
      clearable: true,
    },
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    props: {
      clearable: true,
    },
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    props: {
      clearable: true,
    },
  },
];

// 详情项配置
const detailItems = [
  { prop: 'username', label: '用户名' },
  { prop: 'realName', label: '姓名' },
  { prop: 'phone', label: '手机号' },
  { prop: 'email', label: '邮箱' },
  { prop: 'userType', label: '角色' },
  { prop: 'status', label: '状态' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '更新时间' },
];

// 表单项配置
const formItems = [
  {
    prop: 'username',
    label: '用户名',
    type: 'input',
    placeholder: '请输入用户名',
    props: {
      clearable: true,
    },
    rules: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  },
  {
    prop: 'realName',
    label: '姓名',
    type: 'input',
    placeholder: '请输入姓名',
    props: {
      clearable: true,
    },
    rules: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    props: {
      clearable: true,
    },
    rules: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
  },
  {
    prop: 'email',
    label: '邮箱',
    type: 'input',
    placeholder: '请输入邮箱',
    props: {
      clearable: true,
    },
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
  },
  {
    prop: 'userType',
    label: '角色',
    type: 'selectDictionary',
    name: 'UserType',
    valueType: 'number',
    rules: [{ required: true, message: '请选择角色', trigger: 'change' }],
  },
  {
    prop: 'status',
    label: '状态',
    type: 'selectDictionary',
    name: 'UserStatus',
    valueType: 'number',
    rules: [{ required: true, message: '请选择状态', trigger: 'change' }],
  },
];
</script>
