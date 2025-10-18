<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      label-width="100px"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalConsignmentList"
      :columns="columns"
      :format-search-params="formatSearchParams"
    />
  </CommonPage>
</template>

<script setup>
import { computed, ref } from 'vue';
import { CommonPage, ProTable } from '@/components';
import { AppraisalClassLabelMap, PriceRangeValueMap } from '@/constants';
import { fetchAppraisalConsignmentList } from '@/services';
import { formatDateTime } from '@/utils';
import { omit } from 'lodash-es';

const proTableRef = ref();

// 表格列定义
const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80 },
  { title: '宝贝类型', key: 'type', width: 100, render: row => AppraisalClassLabelMap[row.type] || '-' },
  { title: '描述', key: 'desc', width: 200, ellipsis: { tooltip: true } },
  { title: '手机号', key: 'phone', width: 120 },
  { title: '心理价位', key: 'expected_price', width: 120 },
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
    prop: 'expectedPrice',
    label: '心理价位',
    type: 'selectDictionary',
    name: 'PriceRange',
    placeholder: '请选择价格区间',
    span: 6,
  },
  {
    prop: 'userPhone',
    label: '授权手机号',
    type: 'input',
    placeholder: '请输入授权手机号',
    span: 6,
  },
  {
    prop: 'phone',
    label: '联系方式',
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

// 搜索参数格式化函数
function formatSearchParams(params) {
  console.log("🍈 -> formatSearchParams -> params:", params)
  const [minExpectedPrice, maxExpectedPrice] = PriceRangeValueMap[params.expectedPrice] || [null, null];
  return omit({
    ...params,
    minExpectedPrice,
    maxExpectedPrice,
    userPhone: params.userPhone,
    createStartTime: params.createTimeRange?.[0] ? formatDateTime(params.createTimeRange?.[0]) : null,
    createEndTime: params.createTimeRange?.[1] ? formatDateTime(params.createTimeRange?.[1]) : null,
  }, ['expectedPrice', 'createTimeRange']);
}
</script>
