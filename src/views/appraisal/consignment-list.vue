<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      label-width="140px"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalConsignmentList"
      :columns="columns"
      :format-search-params="formatSearchParams"
    />
  </CommonPage>
</template>

<script setup>
import { computed, h, ref } from 'vue';
import { CommonPage, ProTable } from '@/components';
import { fetchAppraisalConsignmentList } from '@/services';
import { useUserStore } from '@/stores';
import { formatDateTime } from '@/utils';


const proTableRef = ref();
const userStore = useUserStore();

// 已移除视频相关状态与组件

// 表格列定义（调整为：id, 描述，联系方式，授权登录手机号，创建时间）
const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80 },
  { title: '描述', key: 'description', width: 200, ellipsis: { tooltip: true } },
  {
    title: '联系方式',
    key: 'contact',
    width: 200,
    hidden: !userStore.isAdmin,
    render: (row) => {
      const phone = row.phone || '';
      const wechat = row.wechatId || row.wechat_id || '';
      return h(
        'div',
        null,
        [
          h('div', null, `手机号：${phone || '-'}`),
          h('div', null, `微信号：${wechat || '-'}`),
        ],
      );
    },
  },
  { title: '授权登录手机号', key: 'phone', width: 140, render: row => row.phone || '-', hidden: !userStore.isAdmin },
  { title: '创建时间', key: 'created_at', width: 180, render: row => formatDateTime(row.created_at) },
].filter(column => !column.hidden));

// 搜索表单项配置（调整为：id，phone（手机号），wechatId（微信号），描述；两个联系方式仅管理员可见）
const searchFormItems = [
  {
    prop: 'id',
    label: '求购ID',
    type: 'input',
    placeholder: '请输入求购ID',
    span: 6,
    width:300,
  },
  {
    prop: 'phone',
    label: '联系方式（手机号）',
    type: 'input',
    placeholder: '请输入手机号',
    span: 18,
    width: 300,
    hidden: !userStore.isAdmin,
  },
  {
    prop: 'wechatId',
    label: '联系方式（微信号）',
    type: 'input',
    placeholder: '请输入微信号',
    span: 6,
    width: 300,
    hidden: !userStore.isAdmin,
  },
  {
    prop: 'keyword',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 8,
    width: 300,
  },
];

/**
 * 格式化搜索参数
 * @param {Object} params - 原始搜索参数
 * @returns {Object} 格式化后的参数对象
 */
function formatSearchParams(params) {
  return {
   ...params
  };
}
</script>
