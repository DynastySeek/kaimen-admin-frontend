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
import { useRequest } from 'alova/client';
import { reactive } from 'vue';
import { AppraisalStatus } from '@/constants';
import { fetchAppraisalUpdate } from '@/services';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['submit']);

// 原因选项配置
const reasonOptions = [
  { label: '需补充正面图片', value: 'need_front_image' },
  { label: '需补充侧面图片', value: 'need_side_image' },
  { label: '需补充背面图片', value: 'need_back_image' },
  { label: '需补充孔道图片', value: 'need_hole_image' },
  { label: '图片不清晰', value: 'image_unclear' },
];

// 结果选项配置
const resultOptions = [
  {
    label: '真',
    value: AppraisalStatus.AuthenticCompleted,
    color: '#21D476',
  },
  {
    label: '伪',
    value: AppraisalStatus.FakeCompleted,
    color: '#FD4648',
  },
  {
    label: '存疑',
    value: AppraisalStatus.DoubtCompleted,
    color: '#FD9E28',
  },
  {
    label: '驳回',
    value: AppraisalStatus.Rejected,
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

// 使用 alova 的 useRequest 处理鉴定更新
const { send: submitAppraisal, loading: isSubmitting } = useRequest(
  data => fetchAppraisalUpdate(data.id, data),
  {
    immediate: false,
  },
);

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
    const submitData = {
      id: props.data.id,
      result: formData.result,
      comment: formData.comment,
      reasons: formData.reasons,
      customReason: formData.customReason,
    };

    // 使用 alova 的 useRequest 提交数据
    await submitAppraisal(submitData);

    emit('submit', submitData);

    // 重置表单
    resetForm();
  } catch (error) {
    console.error('提交鉴定结果失败:', error);
  }
}
</script>
