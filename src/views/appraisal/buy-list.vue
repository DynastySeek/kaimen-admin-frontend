<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      :search-form-items="searchFormItems"
      :fetch-data="handleFetchData"
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

/**
 * 处理数据获取，转换时间范围参数
 * @param {object} params - 查询参数
 * @returns {Promise} 查询结果
 */
function handleFetchData(params) {
  const { createTimeRange, ...otherParams } = params;

  return fetchAppraisalBuyList({
    ...otherParams,
    createStartTime: createTimeRange?.[0] ? formatDateTime(createTimeRange[0]) : null,
    createEndTime: createTimeRange?.[1] ? formatDateTime(createTimeRange[1]) : null,
  });
}

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
    prop: 'id',
    label: '求购ID',
    type: 'input',
    placeholder: '请输入求购ID',
    span: 6,
  },
  {
    prop: 'type',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  {
    prop: 'desc',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 6,
  },
  {
    prop: 'expected_price',
    label: '心理价位',
    type: 'input',
    placeholder: '请输入心理价位',
    span: 6,
  },
  {
    prop: 'user_phone',
    label: '用户登录授权手机号',
    type: 'input',
    placeholder: '请输入授权手机号',
    span: 6,
  },
  {
    prop: 'contact',
    label: '用户填写联系方式',
    type: 'input',
    placeholder: '请输入联系方式',
    span: 6,
  },
  {
    prop: 'createTimeRange',
    label: '创建时间',
    type: 'datetimerange',
    placeholder: '请选择创建时间范围',
    span: 6,
  },
];
</script>
