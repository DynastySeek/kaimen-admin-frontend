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
  :checked-row-keys="Array.from(checkedRowKeysCache)"
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
  
const emit = defineEmits(['update:checked-row-keys', 'update:checked-row', 'update:total-data', 'update:total', 'handle-reset']);
  
  const searchForm = reactive({});
  const tableData = ref([]);
  
  // 缓存选中的行键和行数据（跨页面保持）
  const checkedRowKeysCache = ref(new Set());
  const checkedRowCache = ref(new Map()); // 使用 Map 存储 rowKey -> rowData 的映射
  
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
    // immediate: false, 
     total: response => response.data.totalElements,
     data: response => response.data.content|| [],
     initialPage: 1,
     initialPageSize: 20,
   },
  );
  handleSuccess(async ({data}) => {
    const rawData = data?.data ?? null;
    emit('update:total-data', data.data);
    emit('update:total', data.data.totalElements);
    let tableList = data?.data?.content || rawData || [];
    if (props.formatResponseList) {
      tableList = await props.formatResponseList(tableList);
    }

    tableData.value = tableList;
    
    // 数据更新后，从缓存中恢复当前页面的选中状态
    restoreCheckedRowsFromCache();
  });
  
  /**
   * 从缓存中恢复当前页面的选中状态
   */
  function restoreCheckedRowsFromCache() {
    const currentPageKeys = [];
    const currentPageRows = [];
    
    // 遍历当前页面的数据，检查哪些在缓存中
    tableData.value.forEach((row) => {
      const key = props.rowKey(row);
      if (checkedRowKeysCache.value.has(key)) {
        currentPageKeys.push(key);
        // 优先使用缓存中的行数据，如果没有则使用当前行的数据
        const cachedRow = checkedRowCache.value.get(key);
        currentPageRows.push(cachedRow || row);
      }
    });
    
    // 合并当前页面的选中状态和缓存中其他页面的选中状态
    const allCheckedKeys = Array.from(checkedRowKeysCache.value);
    const allCheckedRows = Array.from(checkedRowCache.value.values());
    
    // 触发更新事件，通知父组件
    emit('update:checked-row-keys', allCheckedKeys, allCheckedRows, { source: 'restore' });
    emit('update:checked-row', allCheckedRows, { source: 'restore' });
  }
  
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
    // 触发 handle-reset 事件，让父组件可以自定义重置逻辑
    // 如果事件处理函数返回 false，则跳过默认重置
    const result = emit('handle-reset');
    const shouldSkipDefault = Array.isArray(result) && result.includes(false);
    
    if (!shouldSkipDefault) {
      // 默认重置所有字段
      props.searchFormItems.forEach((item) => {
        const defaultValue = item.value !== undefined ? item.value : null;
        searchForm[item.prop] = defaultValue;
      });
      // 重置时清空选中缓存
      clearCheckedCache();
      handleSearch();
    }
  }
  
  /**
   * 清空选中缓存
   */
  function clearCheckedCache() {
    checkedRowKeysCache.value.clear();
    checkedRowCache.value.clear();
    emit('update:checked-row-keys', [], [], { source: 'clear' });
    emit('update:checked-row', [], { source: 'clear' });
  }
  
function handleCheckedRowKeysChange(keys, rows, meta) {
  // 更新缓存
  const keySet = new Set(keys);
  
  // 更新 checkedRowKeysCache：添加新选中的，移除取消选中的
  // 先移除当前页面中不在 keys 中的项
  tableData.value.forEach((row) => {
    const key = props.rowKey(row);
    if (!keySet.has(key) && checkedRowKeysCache.value.has(key)) {
      // 取消选中：从缓存中移除
      checkedRowKeysCache.value.delete(key);
      checkedRowCache.value.delete(key);
    } else if (keySet.has(key)) {
      // 选中：添加到缓存（使用当前页面的最新数据）
      checkedRowKeysCache.value.add(key);
      checkedRowCache.value.set(key, row);
    }
  });
  
  // 如果传入了 rows 参数，使用它来更新缓存（确保使用最新的行数据）
  if (rows && Array.isArray(rows) && rows.length > 0) {
    rows.forEach((row) => {
      const key = props.rowKey(row);
      if (keySet.has(key)) {
        checkedRowKeysCache.value.add(key);
        checkedRowCache.value.set(key, row);
      }
    });
  }
  
  // 合并所有页面的选中状态（包括当前页面和其他页面的缓存）
  const allCheckedKeys = Array.from(checkedRowKeysCache.value);
  const allCheckedRows = Array.from(checkedRowCache.value.values());
  
  // 触发更新事件
  emit('update:checked-row-keys', allCheckedKeys, allCheckedRows, meta);
  emit('update:checked-row', allCheckedRows, meta);
}
  
  // 监听外部传入的 checkedRowKeys 变化，同步到缓存（用于外部清空等操作）
  watch(
    () => props.checkedRowKeys,
    (newKeys) => {
      if (newKeys && newKeys.length === 0 && checkedRowKeysCache.value.size > 0) {
        // 如果外部传入空数组，清空缓存
        clearCheckedCache();
      } else if (newKeys && newKeys.length > 0) {
        // 如果外部传入新的选中项，更新缓存（但不覆盖已有的）
        const newKeySet = new Set(newKeys);
        newKeySet.forEach((key) => {
          if (!checkedRowKeysCache.value.has(key)) {
            checkedRowKeysCache.value.add(key);
          }
        });
      }
    },
    { immediate: true }
  );
  
  defineExpose({
   refresh: fetchList,
   reload,
   searchForm,
   clearCheckedCache, // 暴露清空缓存的方法
   getCheckedCache: () => ({
     keys: Array.from(checkedRowKeysCache.value),
     rows: Array.from(checkedRowCache.value.values())
   }), // 暴露获取缓存的方法
  });
  </script>