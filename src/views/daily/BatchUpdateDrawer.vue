<template>
  <n-drawer
    v-model:show="visible"
    :width="800"
    :block-scroll="true"
    :show-mask="false"
    :mask-closable="false"
  >
    <n-drawer-content :title="`批量修改 - 已选中 ${checkedRows.length} 项`" closable>
      <n-space vertical :size="16">
        <!-- 选中项列表 -->
        <n-card title="选中的评选项" size="small">
          <n-data-table
            :columns="columns"
            :data="checkedRows"
            :row-key="row => row.appraisal_id"
            :scroll-x="600"
          />
        </n-card>
      </n-space>
      <n-gradient-text type="error" style="display: block; margin: 20px 0;">
      {{ "请确认信息后点击提交，提交后将短信通知用户，尽量不要修改" }}
      </n-gradient-text>
      <template #footer>
        <n-space>
          <n-button @click="handleCancel">
            取消
          </n-button>
          <n-button
            type="primary"
            :disabled="!checkedRows?.length>0"
            :loading="isSubmitting"
            @click="handleSubmit"
          >
            确认提交
          </n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
  
</template>

<script setup>
import ImagePreview from './ImagePreview.vue';
import { h } from 'vue';
import { computed, reactive, ref } from 'vue';


const props = defineProps({
  /**
   * 弹窗显示状态
   */
  show: {
    type: Boolean,
    default: false,
  },
  /**
   * 选中的行键值数组
   */
  checkedRowKeys: {
    type: Array,
    default: () => [],
  },
  /**
   * 选中的完整行数据
   */
  checkedRows: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:show', 'submit', 'update:checked-row-keys']);

// 弹窗显示状态
const visible = computed({
  get: () => props.show,
  set: value => emit('update:show', value),
});

// 操作类型选项
const actionTypeOptions = [
  { label: '设为精品', value: 'featured' },
  { label: '取消精品', value: 'unfeatured' },
  { label: '推荐', value: 'recommend' },
  { label: '取消推荐', value: 'unrecommend' },
];

// 表格列配置
const columns = [
  {
    title: '鉴定ID',
    key: 'appraisal_id',
    width: 100,
  },
  {
    title: '图片',
    key: 'images',
    width: 120,
    render: (row) => {
      return h(ImagePreview, {
        images: row.images,
        width: 110,
        height: 68,
        maxDisplay: 4,
      });
    },

  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (row) => {
      return h('span', {
        style: 'color: red; cursor: pointer;',
        onClick: () => handleDelete(row),
      }, '删除');
    },
  },
];

// 表单数据
const formData = reactive({
  actionType: null,
  comment: '',
});

// 提交状态
const isSubmitting = ref(false);

/**
 * 重置表单
 */
function resetForm() {
  formData.actionType = null;
  formData.comment = '';
}

/**
 * 处理删除单个项目
 */
function handleDelete(row) {
  // 从选中的行中移除该项
  const index = props.checkedRowKeys.indexOf(row.appraisal_id);
  if (index > -1) {
    const newKeys = [...props.checkedRowKeys];
    newKeys.splice(index, 1);
    emit('update:checked-row-keys', newKeys);
  }
}

/**
 * 处理取消操作
 */
function handleCancel() {
  resetForm();
  visible.value = false;
}

/**
 * 处理表单提交
 */
async function handleSubmit() {
  isSubmitting.value = true;
  try {
    // TODO: 这里调用实际的批量更新 API
    // await fetchBatchUpdate(submitData);
    localStorage.setItem("STORAGE_KEY",JSON.stringify(props.checkedRows));
    emit('submit', props.checkedRowKeys);
    $message.success(`已成功对 ${props.checkedRowKeys.length} 条数据执行批量操作`);
    // 重置表单并关闭弹窗
    resetForm();
    visible.value = false;
  } catch (error) {
    $message.error('批量操作失败');
    console.error('批量操作失败:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
