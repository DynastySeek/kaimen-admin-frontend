<template>
  <div class="">
    <!-- 搜索表单 -->
    <n-card v-if="searchFormItems && searchFormItems.length > 0" class="card-container">
      <FormBuilder v-model="searchForm" :form-items="computedSearchFormItems" label-width="80px" :actions-span="6" :gutter="20">
        <template #actions>
          <NSpace>
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
        <n-data-table
          :columns="columns"
          :data="data"
          :loading="loading"
          :scroll-x="1400"
          :row-key="item => item.id"
        />
      </div>
      <n-flex class="mt-10" justify="end">
        <n-pagination
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
import { computed, reactive, watch } from 'vue';
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
});



const searchForm = reactive({});

const {
  data,
  loading,
  total,
  page,
  pageSize,
  send: fetchList,
} = usePagination(
  (currentPage, currentSize) =>
    props.fetchData({
      page: currentPage,
      size: currentSize,
      ...searchForm,
    }),
  {
    total: response => response.data.total,
    data: response => response.data.list,
    initialData: {
      total: 0,
      data: [],
    },
    initialPage: 1,
    initialPageSize: 10,
  },
);

const computedSearchFormItems = computed(() => {
  return props.searchFormItems.map(item => ({
    ...item,
    span: item.span || 6,
  }));
});


watch(
  () => props.searchFormItems,
  () => {
    initSearchForm();
  },
  { immediate: true, deep: true },
);

function initSearchForm() {
  props.searchFormItems.forEach((item) => {
    if (!(item.prop in searchForm)) {
      searchForm[item.prop] = '';
    }
  });
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
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = '';
  });
  handleSearch();
}

defineExpose({
  refresh: fetchList,
  searchForm,
});
</script>
