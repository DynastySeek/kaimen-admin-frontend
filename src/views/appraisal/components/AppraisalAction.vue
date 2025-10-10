<template>
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

    <!-- 第二步：原因（选填） - 存疑状态 -->
    <template v-if="[AppraisalResult.Doubt].includes(formData.result)">
      <div class="text-[#1560FA] font-bold">
        第二步：原因（选填）
      </div>
      <!-- 原因选项 -->
      <n-checkbox-group v-model:value="formData.reasons" class="mb-2">
        <n-grid :y-gap="8" :cols="2">
          <n-gi
            v-for="option in doubtReasonOptions"
            :key="option.value"
          >
            <n-checkbox
              :value="option.value"
              :label="option.label"
              size="small"
            />
          </n-gi>
        </n-grid>
      </n-checkbox-group>
      <n-input
        v-model:value="formData.comment"
        type="textarea"
        placeholder="其他问题可详细描述"
        :autosize="{
          minRows: 2,
          maxRows: 3,
        }"
        size="small"
      />
    </template>

    <template v-else-if="[AppraisalResult.Rejected].includes(formData.result)">
      <div class="text-[#1560FA] font-bold">
        第二步：原因（选填）
      </div>
      <!-- 原因选项 -->
      <n-checkbox-group v-model:value="formData.reasons" class="mb-2">
        <n-grid :y-gap="8" :cols="1">
          <n-gi
            v-for="option in rejectReasonOptions"
            :key="option.value"
          >
            <n-checkbox
              :value="option.value"
              :label="option.label"
              size="small"
            />
          </n-gi>
        </n-grid>
      </n-checkbox-group>
      <n-input
        v-model:value="formData.comment"
        type="textarea"
        placeholder="其他问题可详细描述"
        :autosize="{
          minRows: 2,
          maxRows: 3,
        }"
        size="small"
      />
    </template>

    <!-- 第二步：评语 -->
    <template v-else>
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
    </template>

    <!-- 第三步：确认操作 -->
    <div class="text-[#1560FA] font-bold">
      第三步：确认操作
    </div>
    <n-button
      type="primary"
      class="text-[12px]"
      round
      :disabled="!formData.result"
      :loading="isSubmitting"
      @click="handleSubmit"
    >
      提交
    </n-button>
  </n-space>
</template>

<script setup>
import { reactive, watch } from 'vue';
import { AppraisalResult, AppraisalResultLabelMap, AppraisalStatus } from '@/constants';
import { fetchAppraisalResultAdd, fetchAppraisalUpdate } from '@/services';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['submit']);

// 原因选项配置
const doubtReasonOptions = [
  { label: '需补充正面图片', value: '需补充正面图片' },
  { label: '需补充侧面图片', value: '需补充侧面图片' },
  { label: '需补充背面图片', value: '需补充背面图片' },
  { label: '需补充孔道图片', value: '需补充孔道图片' },
  { label: '图片不清晰', value: '图片不清晰' },
];

// 驳回原因选项配置
const rejectReasonOptions = [
  { label: '请勿上传与鉴定无关的图片或视频', value: '请勿上传与鉴定无关的图片或视频' },
];

// 结果选项配置
const resultOptions = [
  {
    label: AppraisalResultLabelMap[AppraisalResult.Authentic],
    value: AppraisalResult.Authentic,
    color: '#21D476',
  },
  {
    label: AppraisalResultLabelMap[AppraisalResult.Fake],
    value: AppraisalResult.Fake,
    color: '#FD4648',
  },
  {
    label: AppraisalResultLabelMap[AppraisalResult.Doubt],
    value: AppraisalResult.Doubt,
    color: '#FD9E28',
  },
  {
    label: AppraisalResultLabelMap[AppraisalResult.Rejected],
    value: AppraisalResult.Rejected,
    color: '#555555',
  },
];

// 表单数据
const formData = reactive({
  result: null,
  comment: '',
  reasons: [],
});

// 监听 props.data 变化，初始化表单数据
watch(() => props.data, initFormData, { immediate: true, deep: true });

/**
 * 根据传入的 data 初始化表单数据
 */
function initFormData() {
  const { result, notes } = props.data?.appraisal_result || {};
  if (result && !formData.result) {
    formData.result = result;

    // 处理 notes 字段，可能包含评语和原因
    if (notes) {
      const parts = notes.split(' | 原因: ');
      if (parts.length === 2) {
        // 有原因部分
        formData.comment = parts[0].trim();
        const reasonsText = parts[1].trim();
        if (reasonsText) {
          // 将原因字符串按逗号分割并去除空格
          formData.reasons = reasonsText.split(',').map(reason => reason.trim()).filter(reason => reason);
        }
      } else {
        // 没有原因部分，全部作为评语
        formData.comment = notes;
      }
    }
  }
}
/**
 * 重置表单
 */
function resetForm() {
  formData.result = null;
  formData.comment = '';
  formData.reasons = [];
}

/**
 * 处理表单提交
 */
async function handleSubmit() {
  if (!formData.result) {
    return;
  }

  try {
    const params = {
      appraisalId: props.data.appraisal_id,
      appraisalResult: formData.result,
      comment: formData.comment,
      reasons: formData.reasons,
    };

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

    await fetchAppraisalResultAdd({ items: [params] });
    await fetchAppraisalUpdate([{ id: props.data.appraisal_id, appraisal_status }]);

    emit('submit', params);
    $message.success('鉴定结果提交成功');
    // 重置表单
    resetForm();
  } catch (error) {
    $message.error('提交鉴定结果失败');
    console.error('提交鉴定结果失败:', error);
  }
}
</script>
