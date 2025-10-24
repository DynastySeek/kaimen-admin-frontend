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
          @update:checked-row-keys="handleCheckedRowKeysChange"
        />
      </div>
      <n-flex class="mt-10" justify="end">
        <NPagination
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
  // 行数据的 key，用于表格行的唯一标识
  rowKey: {
    type: Function,
    default: item => item.id,
  },

});

const emit = defineEmits(['update:checked-row-keys']);

const searchForm = reactive({});
const tableData = ref([]);

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
    total: response => response.data.total,
    data: response => response.data.list || [],
    initialPage: 1,
    initialPageSize: 20,
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

handleSuccess(async ({ data }) => {
  let tableList = data?.data?.list || [];
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
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = '';
  });
  handleSearch();
}

function handleCheckedRowKeysChange(keys) {
  emit('update:checked-row-keys', keys);
}

defineExpose({
  refresh: fetchList,
  reload,
  searchForm,
});
</script>
