<template>
  <n-drawer
    v-model:show="visible"
    :width="500"
    :block-scroll="true"
    :show-mask="false"
    :mask-closable="false"
  >
    <n-drawer-content :title="`已选中${checkedRows.length}${totalCount > 0 ? `/${totalCount}` : ''}项`" closable>
      <!-- 可滚动列表 -->
      <div class="drawer-content-scroll">
        <div
          v-for="(row, index) in checkedRows"
          :key="row.appraisal_id"
          class="appraisal-item"
        >
        <div class="appraisal-item-content">
          <!-- 鉴定ID -->
          <div class="appraisal-item1">
            <label>鉴定ID</label>
            <div>{{ row.appraisal_id }}</div> 
          </div>
          <div class="appraisal-item1">
            <label>图片</label>
            <ImagePreview
            :images="row.images || []"
            :width="80"
            :height="80"
            :max-display="3"
            />
          </div>
          <div class="appraisal-item1">
            <label> 描述</label>
            <div>{{ row.description }}</div> 
          </div>
          <div class="appraisal-item1">
            <label class="required">奖励</label>
            <div class="input-wrapper">
              <n-input 
                v-model:value="row.fine_tips" 
                type="number"
                placeholder="请输入1-500的整数"
                :min="0"
                :max="500"
                :step="1"
                :status="getFineTipsStatus(row.appraisal_id)"
                @blur="validateFineTips(row)"
              />
              <div v-if="getFineTipsError(row.appraisal_id)" class="error-tip">{{ getFineTipsError(row.appraisal_id) }}</div>
            </div>
          </div>
        </div>
        <div class="appraisal-actions">
          <n-button text type="error" @click="handleDelete(row)">删除</n-button>
        </div>
      </div>
    </div>
      <!-- 底部警告文字 -->
      <div class="drawer-warning">
        <n-gradient-text type="error">请确认信息后点击提交，提交后不可修改
        </n-gradient-text>
      </div>
      
      <template #footer>
        <n-space justify="end">
          <n-button @click="handleCancel">
            取消
          </n-button>
          <n-button
            type="success"
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
import { computed, reactive, ref, watch } from 'vue';

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
  /**
   * 总数量（用于显示 已选中X/总数项）
   */
  totalCount: {
    type: Number,
    default: 0,
  },
});
const fineTipsValidation = reactive({})


// 校验单个奖励输入
const validateFineTips = (row) => {
  const value = row.fine_tips
  const id = row.appraisal_id
  
  if (value === '' || value === null || value === undefined) {
    fineTipsValidation[id] = { status: 'error', message: '奖励不能为空' }
    return false
  }
  
  const numValue = Number(value)
  if (!Number.isInteger(numValue)) {
    fineTipsValidation[id] = { status: 'error', message: '必须为整数' }
    return false
  }
  
  if (numValue <= 0 || numValue > 500) {
    fineTipsValidation[id] = { status: 'error', message: '必须在0-500之间' }
    return false
  }
  
  fineTipsValidation[id] = { status: 'success', message: '' }
  return true
}

// 获取校验状态
const getFineTipsStatus = (id) => {
  return fineTipsValidation[id]?.status || ''
}

// 获取错误信息
const getFineTipsError = (id) => {
  return fineTipsValidation[id]?.message || ''
}

// 暴露批量校验方法
const validateAllFineTips = (rows) => {
  let isValid = true
  rows.forEach(row => {
    if (!validateFineTips(row)) {
      isValid = false
    }
  })
  return isValid
}

const emit = defineEmits(['update:show', 'submit', 'update:checked-row-keys']);

// 弹窗显示状态
const visible = computed({
  get: () => props.show,
  set: value => emit('update:show', value),
});

// 每个项的描述输入框值
const itemDescriptions = reactive({});

// 提交状态
const isSubmitting = ref(false);

// 监听 checkedRows 变化，初始化描述值
watch(
  () => props.checkedRows,
  (newRows) => {
    console.log('props.checkedRows', props.checkedRows)
    // 初始化新项的描述为空
    newRows.forEach((row) => {
      if (!(row.appraisal_id in itemDescriptions)) {
        itemDescriptions[row.appraisal_id] = row.description || '';
      }
    });
    // 清理已删除项的描述
    const currentIds = newRows.map((row) => row.appraisal_id);
    Object.keys(itemDescriptions).forEach((id) => {
      if (!currentIds.includes(id)) {
        delete itemDescriptions[id];
      }
    });
  },
  { immediate: true }
);

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
    // 删除对应的描述
    delete itemDescriptions[row.appraisal_id];
  }
}

/**
 * 处理取消操作
 */
function handleCancel() {
  visible.value = false;
}

/**
 * 处理表单提交
 */
async function handleSubmit() {
  if (!validateAllFineTips(props.checkedRows)) {
    return
  }
  isSubmitting.value = true;
  try {
    // 准备提交数据，包含描述信息
    const submitData = props.checkedRows.map((row) => ({
      ...row,
      description: itemDescriptions[row.appraisal_id] || '',
    }));
    
    // TODO: 这里调用实际的批量更新 API
    // await fetchBatchUpdate(submitData);
    localStorage.setItem("STORAGE_KEY", JSON.stringify(submitData));
    emit('submit', props.checkedRows);
    
    // 关闭弹窗
    visible.value = false;
  } catch (error) {
    $message.error('批量操作失败');
    console.error('批量操作失败:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* 可滚动内容区域 */
.drawer-content-scroll {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 16px 0;
  min-height: 200px;
  position: relative;
}

/* 每个鉴定项 */
.appraisal-item {
  display: flex;
  /* flex-direction: column; */
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}
.appraisal-item-content {
  display: flex;
  flex-direction: column;
}
.appraisal-item1 {
  width: 300px;
  display: flex;
  align-items: center;
  label{
    width: 60px;
  }
  div{
    width: 300;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  padding: 10px;
}

.appraisal-item:last-child {
  border-bottom: none;
}

/* 鉴定ID */
.appraisal-id {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 500;
}

/* 内容区域（图片、描述、操作） */
.appraisal-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

/* 图片区域 */
.appraisal-images {
  flex-shrink: 0;
}

/* 描述输入框 */
.appraisal-description {
  flex: 1;
  min-width: 0;
}

/* 操作按钮区域 */
.appraisal-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

/* 底部警告文字 */
.drawer-warning {
  position: absolute;
  bottom: 70px;
  left: 0;
  right: 0;

  padding: 12px;
  background-color: #fff7e6;
  border-radius: 4px;
}

/* 滚动条样式 */
.drawer-content-scroll::-webkit-scrollbar {
  width: 6px;
}

.drawer-content-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.drawer-content-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.drawer-content-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.required::before {
  content: "*";
  color: #d03050;
  margin-right: 4px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.error-tip {
  position: absolute;
  bottom: -18px;
  left: 0;
  font-size: 12px;
  color: #d03050;
  white-space: nowrap;
}
</style>
