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
    <template v-if="[AppraisalStatus.DoubtCompleted, AppraisalStatus.Rejected].includes(formData.result)">
      <div class="text-[#1560FA] font-bold">
        第二步：原因（选填）
      </div>
      <!-- 原因选项 -->
      <n-checkbox-group v-model:value="formData.reasons" class="mb-2">
        <n-grid :y-gap="8" :cols="2">
          <n-gi
            v-for="option in reasonOptions"
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
        placeholder="照片质量过低，导致细节模糊不清"
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
import { reactive } from 'vue';
import { AppraisalResult, AppraisalStatus } from '@/constants';
import { fetchAppraisalResultAdd, fetchAppraisalUpdate } from '@/services';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['submit']);

// 原因选项配置
const reasonOptions = [
  { label: '需补充正面图片', value: '需补充正面图片' },
  { label: '需补充侧面图片', value: '需补充侧面图片' },
  { label: '需补充背面图片', value: '需补充背面图片' },
  { label: '需补充孔道图片', value: '需补充孔道图片' },
  { label: '图片不清晰', value: '图片不清晰' },
];

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
  reasons: [],
  customReason: '',
});

/**
 * 重置表单
 */
function resetForm() {
  formData.result = null;
  formData.comment = '';
  formData.reasons = [];
  formData.customReason = '';
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
      orderid: props.data.appraisal_id,
      appraisalSesult: formData.result,
      comment: formData.comment,
      reasons: formData.reasons,
      customReason: formData.customReason,
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

    console.log('🍈 -> handleSubmit -> props:', props);
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
