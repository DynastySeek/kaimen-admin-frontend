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
      <div class="mb-4">
        <NButton v-if="actionButtons.includes('add')" type="primary" @click="handleAdd">
          {{ addButtonText }}
        </NButton>
      </div>
      <NDataTable
        :data="data"
        :loading="loading"
        :columns="columns"
        :scroll-x="1200"
      >
        <template #empty>
          <NEmpty description="暂无数据" />
        </template>
      </NDataTable>

      <!-- 保留原有表格插槽，用于兼容 -->
      <div style="display: none;">
        <slot name="table" />
        <slot name="action" />
      </div>

      <div class="mt-4 flex justify-end">
        <NPagination
          v-model:page="page"
          v-model:page-size="size"
          :item-count="total"
          :page-sizes="[10, 20, 50]"
          show-size-picker
          show-quick-jumper
        />
      </div>
    </n-card>

    <!-- 详情弹窗 -->
    <NModal v-model:show="detailVisible" :title="detailTitle" :style="{ width: detailWidth }">
      <NDescriptions :column="1" bordered>
        <NDescriptionsItem v-for="item in detailItems" :key="item.prop" :label="item.label">
          <slot :name="`detail-${item.prop}`" :item="item" :data="currentData">
            {{ currentData?.[item.prop] }}
          </slot>
        </NDescriptionsItem>
      </NDescriptions>
    </NModal>

    <!-- 表单弹窗 -->
    <NModal v-model:show="formVisible" :title="formTitle" :style="{ width: formWidth }">
      <FormBuilder ref="formBuilderRef" v-model="formData" :form-items="formItems" :label-width="formLabelWidth" />
      <template #footer>
        <div class="dialog-footer">
          <NButton @click="handleFormCancel">
            取消
          </NButton>
          <NButton type="primary" :loading="formLoading" @click="handleFormSubmit">
            确定
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup>
import { usePagination } from 'alova/client';
import { NButton, NDataTable, NDescriptions, NDescriptionsItem, NEmpty, NModal, NPagination, NPopconfirm, NSpace } from 'naive-ui';
import { computed, h, reactive, ref, useSlots, watch } from 'vue';
import FormBuilder from '@/components/FormBuilder.vue';

const props = defineProps({
  // 搜索表单项配置
  searchFormItems: {
    type: Array,
    default: () => [],
  },
  // 详情项配置
  detailItems: {
    type: Array,
    default: () => [],
  },
  // 表单项配置
  formItems: {
    type: Array,
    default: () => [],
  },
  // 操作按钮配置
  actionButtons: {
    type: Array,
    default: () => ['add', 'edit', 'view', 'delete'],
  },
  // 数据获取函数
  fetchData: {
    type: Function,
    required: true,
  },
  // 详情数据获取函数
  fetchDetailData: {
    type: Function,
    default: null,
  },
  // 删除函数
  fetchDeleteItem: {
    type: Function,
    default: null,
  },
  // 新增数据函数
  fetchCreateData: {
    type: Function,
    default: null,
  },
  // 更新数据函数
  fetchUpdateData: {
    type: Function,
    default: null,
  },
  // 新增按钮文本
  addButtonText: {
    type: String,
    default: '新增',
  },
  // 详情弹窗标题
  detailTitle: {
    type: String,
    default: '详情',
  },
  // 新增弹窗标题
  addTitle: {
    type: String,
    default: '新增',
  },
  // 编辑弹窗标题
  editTitle: {
    type: String,
    default: '编辑',
  },
  // 删除确认文本
  deleteConfirmText: {
    type: String,
    default: '确定要删除吗？',
  },
  // 详情弹窗宽度
  detailWidth: {
    type: String,
    default: '600px',
  },
  // 表单弹窗宽度
  formWidth: {
    type: String,
    default: '600px',
  },
  // 表单标签宽度
  formLabelWidth: {
    type: String,
    default: '100px',
  },
  // 表格列配置
  columns: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['add', 'edit', 'detail', 'delete']);

const $slots = useSlots();

const searchForm = reactive({});
const detailVisible = ref(false);
const currentData = ref(null);
const formVisible = ref(false);
const formData = reactive({});
const formLoading = ref(false);
const isEdit = ref(false);
const editingRow = ref(null);
const formBuilderRef = ref();
const actionButtons = computed(() => props.actionButtons);
const deleteConfirmText = computed(() => props.deleteConfirmText);

const columns = computed(() => {
  const baseColumns = props.columns || [];

  // 如果需要操作列，添加操作列
  if (actionButtons.value.length > 0 || $slots.action) {
    baseColumns.push({
      title: '操作',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      render: (row) => {
        const buttons = [];

        if (actionButtons.value.includes('view') && props.fetchDetailData) {
          buttons.push(
            h(NButton, {
              size: 'small',
              type: 'primary',
              text: true,
              onClick: () => handleDetail(row),
            }, { default: () => '查看' }),
          );
        }

        if (actionButtons.value.includes('edit')) {
          buttons.push(
            h(NButton, {
              size: 'small',
              type: 'primary',
              text: true,
              onClick: () => handleEdit(row),
            }, { default: () => '编辑' }),
          );
        }

        if (actionButtons.value.includes('delete') && props.fetchDeleteItem) {
          buttons.push(
            h(NPopconfirm, {
              onPositiveClick: () => handleDelete(row),
            }, {
              default: () => deleteConfirmText.value,
              trigger: () => h(NButton, {
                size: 'small',
                type: 'error',
                text: true,
              }, { default: () => '删除' }),
            }),
          );
        }

        return h(NSpace, { justify: 'center' }, buttons);
      },
    });
  }

  return baseColumns;
});

const {
  data,
  loading,
  total,
  page,
  pageSize: size,
  send: fetchList,
} = usePagination(
  (currentPage, currentSize) =>
    props.fetchData({
      page: currentPage,
      size: currentSize,
      ...searchForm,
    }),
  {
    total: response => response.total,
    data: response => response.list,
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

const formTitle = computed(() => {
  return isEdit.value ? props.editTitle : props.addTitle;
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

function initFormData() {
  Object.keys(formData).forEach((key) => {
    delete formData[key];
  });
  props.formItems.forEach((item) => {
    formData[item.prop] = '';
  });
}

function handleAdd() {
  if (props.formItems.length > 0) {
    isEdit.value = false;
    editingRow.value = null;
    initFormData();
    formVisible.value = true;
  }
  emit('add');
}

async function handleDetail(row) {
  if (props.fetchDetailData) {
    try {
      const res = await props.fetchDetailData(row);
      currentData.value = res;
    } catch (_error) {
      currentData.value = row;
    }
  } else {
    currentData.value = row;
  }
  detailVisible.value = true;
  emit('detail', row);
}

function handleEdit(row) {
  if (props.formItems.length > 0) {
    isEdit.value = true;
    editingRow.value = row;
    initFormData();
    props.formItems.forEach((item) => {
      if (row[item.prop] !== undefined) {
        formData[item.prop] = row[item.prop];
      }
    });
    formVisible.value = true;
  }
  emit('edit', row);
}

async function handleDelete(row) {
  if (props.fetchDeleteItem) {
    try {
      await props.fetchDeleteItem(row);
      fetchList();
      $message.success('删除成功');
    } catch (_error) {
      $message.error('删除失败');
    }
  }
  emit('delete', row);
}

function handleFormCancel() {
  formVisible.value = false;
  initFormData();
}

async function handleFormSubmit() {
  try {
    formLoading.value = true;

    // 表单校验
    const valid = await formBuilderRef.value?.validate();
    if (!valid) {
      return;
    }

    if (isEdit.value && props.fetchUpdateData) {
      await props.fetchUpdateData({
        ...editingRow.value,
        ...formData,
      });
      $message.success('更新成功');
    } else if (!isEdit.value && props.fetchCreateData) {
      await props.fetchCreateData(formData);
      $message.success('创建成功');
    }

    formVisible.value = false;
    fetchList();
    initFormData();
  } catch (_error) {
    $message.error(isEdit.value ? '更新失败' : '创建失败');
  } finally {
    formLoading.value = false;
  }
}

defineExpose({
  refresh: fetchList,
  searchForm,
  openAddForm: handleAdd,
  openEditForm: handleEdit,
});
</script>
