<template>
  <n-modal
    v-model:show="visible"
    preset="dialog"
    title="批量鉴定"
    :show-icon="false"
    :mask-closable="false"
    style="width: 500px"
  >
    <n-space vertical class="text-[12px]">
      <!-- 第一步：确定结果 -->
      <div class="text-[#1560FA] font-bold">
        第一步：确定结果
      </div>
      <n-space>
        <n-button
          v-for="option in resultOptions"
          :key="option.value"
          class="text-[12px]"
          size="small"
          round
          :ghost="formData.result !== option.value"
          :color="option.color"
          @click="formData.result = option.value"
        >
          {{ option.label }}
        </n-button>
      </n-space>

      <!-- 第二步：评语 -->
      <div class="text-[#1560FA] font-bold">
        第二步：评语（选填）
      </div>
      <n-input
        v-model:value="formData.comment"
        type="textarea"
        placeholder="请输入评语"
        :autosize="{
          minRows: 2,
          maxRows: 3,
        }"
        size="small"
      />

      <!-- 选中的数据信息 -->
      <div class="text-[12px] text-[#666]">
        已选中 {{ checkedRowKeys.length }} 条数据
      </div>
    </n-space>

    <template #action>
      <n-space>
        <n-button @click="handleCancel">
          取消
        </n-button>
        <n-button
          type="primary"
          :disabled="!formData.result"
          :loading="isSubmitting"
          @click="handleSubmit"
        >
          确认提交
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { AppraisalResult, AppraisalStatus } from '@/constants';
import { fetchAppraisalResultAdd, fetchAppraisalUpdate } from '@/services';

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
});

const emit = defineEmits(['update:show', 'submit']);

// 弹窗显示状态
const visible = computed({
  get: () => props.show,
  set: value => emit('update:show', value),
});

// 结果选项配置
const resultOptions = [
  {
    label: '真',
    value: AppraisalResult.Authentic,
    color: '#21D476',
  },
  {
    label: '伪',
    value: AppraisalResult.Fake,
    color: '#FD4648',
  },
  {
    label: '存疑',
    value: AppraisalResult.Doubt,
    color: '#FD9E28',
  },
  {
    label: '驳回',
    value: AppraisalResult.Rejected,
    color: '#555555',
  },
];

// 表单数据
const formData = reactive({
  result: null,
  comment: '',
});

// 提交状态
const isSubmitting = ref(false);

/**
 * 重置表单
 */
function resetForm() {
  formData.result = null;
  formData.comment = '';
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
  if (!formData.result) {
    return;
  }

  isSubmitting.value = true;

  try {
    // 构建批量鉴定结果数据
    const resultItems = props.checkedRowKeys.map(id => ({
      orderid: id,
      appraisalResult: formData.result,
      comment: formData.comment,
      reasons: [],
      customReason: '',
    }));

    // 构建批量状态更新数据
    let appraisal_status = null;
    if (formData.result === AppraisalResult.Authentic) {
      appraisal_status = AppraisalStatus.Completed;
    } else if (formData.result === AppraisalResult.Fake) {
      appraisal_status = AppraisalStatus.Completed;
    } else if (formData.result === AppraisalResult.Doubt) {
      appraisal_status = AppraisalStatus.PendingCompletion;
    } else if (formData.result === AppraisalResult.Rejected) {
      appraisal_status = AppraisalStatus.Rejected;
    }

    const updateItems = props.checkedRowKeys.map(id => ({
      id,
      appraisal_status,
    }));

    // 批量更新鉴定状态
    await fetchAppraisalUpdate(updateItems);

    // 批量添加鉴定结果
    await fetchAppraisalResultAdd({ items: resultItems });

    const submitData = {
      ids: props.checkedRowKeys,
      result: formData.result,
      comment: formData.comment,
    };

    emit('submit', submitData);
    $message.success('批量鉴定提交成功');

    // 重置表单并关闭弹窗
    resetForm();
    visible.value = false;
  } catch (error) {
    $message.error('批量鉴定提交失败');
    console.error('批量鉴定提交失败:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
