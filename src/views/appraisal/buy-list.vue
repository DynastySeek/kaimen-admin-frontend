<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      :action-buttons="[]"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalBuyList"
      :columns="columns"
    />
  </CommonPage>
</template>

<script setup>
import { computed, ref } from 'vue';
import { CommonPage, ProTable } from '@/components';
import { AppraisalClassLabelMap } from '@/constants';
import { fetchAppraisalBuyList } from '@/services';
import { formatDateTime } from '@/utils';

const proTableRef = ref();

// 表格列定义
const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80 },
  { title: '类型', key: 'type', width: 100, render: row => AppraisalClassLabelMap[row.type] || '-' },
  { title: '描述', key: 'desc', width: 200, ellipsis: { tooltip: true } },
  { title: '手机号', key: 'phone', width: 120 },
  { title: '期望价格', key: 'expected_price', width: 120 },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render: row => formatDateTime(row.created_at),
  },
  {
    title: '更新时间',
    key: 'updated_at',
    width: 180,
    render: row => formatDateTime(row.updated_at),
  },
]);

// 搜索表单项配置
const searchFormItems = [
  {
    prop: 'type',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  {
    prop: 'phone',
    label: '手机号',
    type: 'input',
    placeholder: '请输入手机号',
    span: 6,
  },
  // {
  //   prop: 'createStartTime',
  //   label: '创建开始时间',
  //   type: 'datetime',
  //   placeholder: '请选择创建开始时间',
  //   span: 6,
  // },
  // {
  //   prop: 'createEndTime',
  //   label: '创建结束时间',
  //   type: 'datetime',
  //   placeholder: '请选择创建结束时间',
  //   span: 6,
  // },
];
</script>
