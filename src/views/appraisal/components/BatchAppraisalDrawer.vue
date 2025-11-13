<template>
  <n-drawer
    v-model:show="visible"
    :width="360"
    :block-scroll="true"
    :show-mask="false"
    :mask-closable="false"
  >
    <n-drawer-content title="批量鉴定" closable>
      <n-space vertical class="text-[12px]">
        <!-- 第一步：确定结果 -->
        <div class="text-[#1560FA] font-bold">
          第一步：确定结果
        </div>
        <n-grid :y-gap="8" :x-gap="8" :cols="2">
          <n-gi
            v-for="option in resultOptions"
            :key="option.value"
          >
            <n-button
              class="text-[12px]"
              size="small"
              round
              :ghost="formData.result !== option.value"
              :color="option.color"
              @click="formData.result = option.value"
            >
              {{ option.label }}
            </n-button>
          </n-gi>
        </n-grid>

        <!-- 第二步：原因（选填） - 存疑状态 -->
        <template v-if="[AppraisalResult.Doubt].includes(formData.result)">
          <div class="text-[#1560FA] font-bold">
            第二步：原因（选填）
          </div>
          <!-- 原因选项 -->
          <n-checkbox-group v-model:value="formData.reasons" class="mb-2">
            <n-grid :y-gap="8" :cols="1">
              <n-gi v-for="option in doubtReasonOptions" :key="option.value">
                <n-checkbox :value="option.value" :label="option.label" size="small" />
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
              <n-gi v-for="option in rejectReasonOptions" :key="option.value">
                <n-checkbox :value="option.value" :label="option.label" size="small" />
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

        <!-- 选中的数据信息 -->
        <div class="text-[12px] text-[#666]">
          已选中 {{ checkedRowKeys.length }} 条数据
        </div>
      </n-space>

      <template #footer>
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
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { AppraisalResult, AppraisalResultLabelMap, AppraisalStatus } from '@/constants';
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

// 弹窗显示状态
const visible = computed({
  get: () => props.show,
  set: value => emit('update:show', value),
});

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

// 提交状态
const isSubmitting = ref(false);

/**
 * 重置表单
 */
function resetForm() {
  formData.result = null;
  formData.comment = '';
  formData.reasons = [];
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
      appraisalId: id,
      appraisalResult: formData.result,
      comment: formData.comment,
      reasons: formData.reasons,
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
    $message.success(`已对 ${resultItems.length} 条数据进行批量鉴定`);

    // 重置表单并关闭弹窗
    resetForm();
    // visible.value = false;
  } catch (error) {
    $message.error('批量鉴定提交失败');
    console.error('批量鉴定提交失败:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
