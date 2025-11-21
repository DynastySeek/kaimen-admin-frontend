<template>
  <div class="">
  <!-- 搜索表单 -->
  <n-card v-if="searchFormItems && searchFormItems.length > 0" class="card-container">
  <FormBuilder
  v-model="searchForm"
  :form-items="computedSearchFormItems"
  :label-width="labelWidth"
  :actions-span="6"
  :gutter="20"
  >
  <template #actions>
  <NSpace class="w-full" justify="end">
  <NButton type="primary" @click="handleSearch">
  搜索
  </NButton>
  <NButton @click="handleReset">
  重置
  </NButton>
  </NSpace>
  </template>
  </FormBuilder>
  </n-card>
  
  <!-- 表格 -->
  <n-card class="mt-10">
  <div class="mb-10">
  <slot name="header" />
  </div>
  <div id="appraisal-table-container">
  <NDataTable
  :columns="columns"
  :data="tableData"
  :loading="loading"
  :scroll-x="1400"
  :row-key="rowKey"
  :checked-row-keys="checkedRowKeys"
  :virtual-scroll="virtualScroll"
  :max-height="virtualScroll ? maxHeight : undefined"
  @update:checked-row-keys="handleCheckedRowKeysChange"
  />
  </div>
  <n-flex class="mt-10" justify="end">
  <NPagination
  v-if="!virtualScroll"
  :item-count="total"
  :page="page"
  :page-size="pageSize"
  :page-sizes="[10, 20, 50, 100]"
  :page-slot="6"
  show-size-picker
  :prefix="({ itemCount }) => `共 ${itemCount} 条`"
  @update:page="handlePageChange"
  @update:page-size="handlePageSizeChange"
  />
  </n-flex>
  </n-card>
  </div>
  </template>
  
  <script setup>
  import { usePagination } from 'alova/client';
  import { NButton, NDataTable, NPagination, NSpace } from 'naive-ui';
  import { computed, reactive, ref, watch } from 'vue';
  import FormBuilder from './FormBuilder.vue';
  
const props = defineProps({
   // 搜索表单项配置
   searchFormItems: {
     type: Array,
     default: () => [],
   },
   // 数据获取函数
   fetchData: {
     type: Function,
     required: true,
   },
   // 表格列配置
   columns: {
     type: Array,
     default: () => [],
   },
   // 表单标签宽度
   labelWidth: {
     type: String,
     default: '80px',
   },
   // 搜索参数格式化函数
   formatSearchParams: {
     type: Function,
     default: null,
   },
   // 响应数据格式化函数
   formatResponseList: {
     type: Function,
     default: null,
   },
  // 选中的行键
   checkedRowKeys: {
     type: Array,
     default: () => [],
   },
  // 选中的行数据
  checkedRow: {
    type: Array,
    default: () => [],
  },
   // 行数据的 key，用于表格行的唯一标识
   rowKey: {
     type: Function,
     default: item => item.id,
   },
   // 是否启用虚拟滚动
   virtualScroll: {
     type: Boolean,
     default: false,
   },
   // 表格最大高度（启用虚拟滚动时必须设置）
   maxHeight: {
     type: [Number, String],
     default: 600,
   },
  });
  
const emit = defineEmits(['update:checked-row-keys', 'update:checked-row', 'update:total-data']);
  
  const searchForm = reactive({});
  const tableData = ref([]);
  
  const computedSearchFormItems = computed(() => {
   return props.searchFormItems.map(item => ({
     ...item,
     span: item.span || 6,
   }));
  });
  
  // 初始化搜索表单
  function initSearchForm() {
   props.searchFormItems.forEach((item) => {
     // 如果配置了 value 属性，使用它作为默认值，否则为 null
     const defaultValue = item.value !== undefined ? item.value : null;
     if (!(item.prop in searchForm)) {
       searchForm[item.prop] = defaultValue;
     }
   });
  }
  
  // 立即初始化表单，确保在 usePagination 之前完成
  initSearchForm();
  
  watch(
   () => props.searchFormItems,
   () => {
     initSearchForm();
   },
   { deep: true },
  );

  const {
   loading,
   total,
   page,
   pageSize,
   send: fetchList,
   reload,
   onSuccess: handleSuccess,
  } = usePagination(
   (currentPage, currentPageSize) =>
     props.fetchData({
       page: currentPage,
       pageSize: currentPageSize,
       ...(props.formatSearchParams ? props.formatSearchParams(searchForm) : searchForm),
     }),
   {
  
     total: response => response.data.totalElements,
     data: response => response.data.content|| [],
     initialPage: 1,
     initialPageSize: 20,
   },
  );
  // conos
  
  handleSuccess(async ({data}) => {
    const rawData = data?.data ?? null;
    emit('update:total-data', data.data);
    let tableList = data?.data?.content || rawData || [];
    if (props.formatResponseList) {
      tableList = await props.formatResponseList(tableList);
    }
    tableData.value = tableList;
  });
  
  function handlePageChange(newPage) {
   page.value = newPage;
  }
  
  function handlePageSizeChange(newPageSize) {
   pageSize.value = newPageSize;
   page.value = 1;
  }
  
  function handleSearch() {
   page.value = 1;
   fetchList();
  }
  
  function handleReset() {
   props.searchFormItems.forEach((item) => {
     const defaultValue = item.value !== undefined ? item.value : null;
     searchForm[item.prop] = defaultValue;
   });
   handleSearch();
  }
  
function handleCheckedRowKeysChange(keys) {
 const keySet = new Set(keys);
 const selectedRows = tableData.value.filter(item => keySet.has(props.rowKey(item)));
 emit('update:checked-row-keys', keys);
 emit('update:checked-row', selectedRows);
}
  
  defineExpose({
   refresh: fetchList,
   reload,
   searchForm,
  });
  </script>