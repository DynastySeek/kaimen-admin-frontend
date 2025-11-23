<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      label-width="100px"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalBuyList"
      :columns="columns"
      :format-search-params="formatSearchParams"
    />
  </CommonPage>
</template>

<script setup>
import { omit } from 'lodash-es';
import { computed, ref } from 'vue';
import { CommonPage, ProTable } from '@/components';
import { AppraisalClassLabelMap, PriceRangeValueMap } from '@/constants';
import { fetchAppraisalBuyList } from '@/services';
import { useUserStore } from '@/stores';
import { formatDateTime } from '@/utils';

const proTableRef = ref();
const userStore = useUserStore();

/**
 * 搜索参数格式化函数
 * @param {object} params - 搜索参数
 * @returns {object} 格式化后的参数
 */
function formatSearchParams(params) {
  const [minPrice, maxPrice] = PriceRangeValueMap[params.expectedPrice] || [null, null];
  return omit({
    ...params,
    minPrice,
    maxPrice,
    startDate: params.createTimeRange?.[0] ? formatDateTime(params.createTimeRange?.[0]) : null,
    endDate: params.createTimeRange?.[1] ? formatDateTime(params.createTimeRange?.[1]) : null,
  }, ['expectedPrice', 'createTimeRange']);
}

// 表格列定义
const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80 },
  { title: '类型', key: 'mainCategory', width: 100, render: row => AppraisalClassLabelMap[row.mainCategory] || '-' },
  { title: '描述', key: 'description', width: 200, ellipsis: { tooltip: true } },
  { title: '授权手机号', key: 'phone', width: 120, render: row => row.phone || '-', hidden: !userStore.isAdmin },
  { title: '联系方式', key: 'phone', width: 120, render: row => row.phone || '-', hidden: !userStore.isAdmin },
  { title: '期望价格', key: 'expected_price', width: 120, render: row => `${row.minPrice} - ${row.maxPrice}` },
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
].filter(column => !column.hidden));

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
    prop: 'mainCategory',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  {
    prop: 'keyword',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 6,
  },
  {
    prop: 'expected_price',
    label: '心理价位',
    type: 'selectDictionary',
    name: 'PriceRange',
    placeholder: '请选择价格区间',
    span: 6,
  },
  {
    prop: 'auth_phone',
    label: '授权手机号',
    type: 'input',
    placeholder: '请输入授权手机号',
    span: 6,
    hidden: !userStore.isAdmin,
  },
  {
    prop: 'phone',
    label: '联系方式',
    type: 'input',
    placeholder: '请输入联系方式',
    span: 6,
    hidden: !userStore.isAdmin,
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
