<template>
  <n-space v-if="!isEditing&&props.data?.results?.[0]" vertical class="text-[12px]">
    <div v-if="data?.status==6">
      -
    </div>
    <div v-else>
    <div  class="flex items-center gap-6 text-[#1560FA] font-bold">
      <span>鉴定结果</span>
      <n-button v-if="data?.modifyDeadLine" text style="font-size: 16px" @click="handleEdit">
        <n-icon color="#1560FA">
          <Edit />
        </n-icon>
      </n-button>
    </div>
    <div>
      {{ resultLabelMap[data?.results[0]?.result] }}
    </div>
    <div class="text-[#1560FA] font-bold">
      原因
    </div>
    <div>
      {{ data?.results[0]?.notes || '-' }}
    </div>
  </div>
  </n-space>

  <n-space v-else vertical class="text-[12px]">
    <!-- 第一步：确定结果 -->
    <div class="text-[#1560FA] font-bold">
      第一步：确定结果
    </div>
    <n-space>
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
    </n-space>

    <!-- 第二步：原因（选填） - 存疑状态 -->
    <template v-if="[AppraisalResult.Doubt, QuWuInterest.Doubt].includes(formData.result)">
      <div class="text-[#1560FA] font-bold">
        第二步：原因
        {{ data?.light === 1 ? '' : '(选填)' }}   
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
      <!-- 原因错误提示 -->
      <div v-if="reasonError" class="text-red-500 text-[12px] mt-1">
        {{ reasonError }}
      </div>
    </template>
    <template v-else-if="[AppraisalResult.Rejected, QuWuInterest.Rejected].includes(formData.result)">
      <div class="text-[#1560FA] font-bold">
        第二步：原因
        {{ data?.light === 1 ? '' : '(选填)' }}
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
      <div v-if="reasonError" class="text-red-500 text-[12px] mt-1">
        {{ reasonError }}
      </div>
    </template>

    <!-- 第二步：评语 -->
    <template v-else>
      <div class="text-[#1560FA] font-bold">
        第二步：评语
        {{ data?.light === 1 ? '' : '(选填)' }} 
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
      <div v-if="commentError" class="text-red-500 text-[12px] mt-1">
        {{ commentError }}
      </div>
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
import { Edit } from '@vicons/carbon';
import { isEmpty } from 'lodash-es';
import { computed, reactive, ref, watch } from 'vue';
import { AppraisalClass, AppraisalResult, AppraisalResultLabelMap, AppraisalStatus, QuWuInterest, QuWuInterestLabelMap } from '@/constants';
import { fetchAppraisalResultAdd, fetchAppraisalUpdate } from '@/services';
import { useUserStore } from '@/stores';
const userStore = useUserStore();

const props = defineProps({
  data: { type: Object, default: () => null },
});
const emit = defineEmits(['submit']);

const isEditing = ref(false);
const isSubmitting = ref(false);

const formData = reactive({
  result: null,
  comment: '',
  reasons: [],
});

const doubtReasonOptions = [
  { label: '需补充正面图片', value: '需补充正面图片' },
  { label: '需补充侧面图片', value: '需补充侧面图片' },
  { label: '需补充背面图片', value: '需补充背面图片' },
  { label: '需补充孔道图片', value: '需补充孔道图片' },
  { label: '图片不清晰', value: '图片不清晰' },
];

const rejectReasonOptions = [
  { label: '请勿上传与鉴定无关的图片或视频', value: '请勿上传与鉴定无关的图片或视频' },
];

const isRequired = computed(() => props.data?.light === 1);

const commentError = computed(() => {
  if (!isRequired.value) return '';

  // 趣物兴趣类结果也需要评语
  if (formData.result === QuWuInterest.Interesting ||
      formData.result === QuWuInterest.Boring) {
    return formData.comment.trim() ? '' : '请输入评语';
  }

  if (formData.result === AppraisalResult.Authentic ||
      formData.result === AppraisalResult.Fake) {
    return formData.comment.trim() ? '' : '请输入评语';
  }

  return '';
});

const reasonError = computed(() => {
  if (!isRequired.value) return '';

  if (formData.result === AppraisalResult.Doubt ||
      formData.result === AppraisalResult.Rejected ||
      formData.result === QuWuInterest.Doubt ||
      formData.result === QuWuInterest.Rejected) {
    return formData.reasons.length ? '' : '请输入原因';
  }
  return '';
});
/**
 * 是否为“趣物”类目。
 * @type {import('vue').ComputedRef<boolean>}
 */
const isQuWu = computed(() => Number(props.data?.mainCategory) === AppraisalClass.QuWu);

/**
 * 根据类目返回结果标签映射。
 * @type {import('vue').ComputedRef<Record<string, string>>}
 */
const resultLabelMap = computed(() => (isQuWu.value ? QuWuInterestLabelMap : AppraisalResultLabelMap));

/**
 * 鉴定结果选项列表（趣物类目仅有有趣/无聊）。
 * @type {import('vue').ComputedRef<Array<{label: string, value: string, color: string}>>}
 */
const resultOptions = computed(() => {
  if (isQuWu.value) {
    return [
      { label: QuWuInterestLabelMap[QuWuInterest.Interesting], value: QuWuInterest.Interesting, color: '#21D476' },
      { label: QuWuInterestLabelMap[QuWuInterest.Boring], value: QuWuInterest.Boring, color: '#FD4648' },
      { label: QuWuInterestLabelMap[QuWuInterest.Doubt], value: QuWuInterest.Doubt, color: '#FD9E28' },
      { label: QuWuInterestLabelMap[QuWuInterest.Rejected], value: QuWuInterest.Rejected, color: '#555555' },
    ];
  }
  return [
    { label: AppraisalResultLabelMap[AppraisalResult.Authentic], value: AppraisalResult.Authentic, color: '#21D476' },
    { label: AppraisalResultLabelMap[AppraisalResult.Fake], value: AppraisalResult.Fake, color: '#FD4648' },
    { label: AppraisalResultLabelMap[AppraisalResult.Doubt], value: AppraisalResult.Doubt, color: '#FD9E28' },
    { label: AppraisalResultLabelMap[AppraisalResult.Rejected], value: AppraisalResult.Rejected, color: '#555555' },
  ];
});

// watch(
//   () => props.data?.status,
//   (val) => {
//     // last_appraisal_result 有值 
//     isEditing.value = (props.data?.status==1)
//   },
//   { immediate: true },
// );


watch(
  () => props.data?.results?.[0],
  (val) => {
    isEditing.value = !val;
  },
  { immediate: true },
);


watch(() => props.data, initFormData, { immediate: true, deep: true });

function handleEdit() {
  isEditing.value = true;
}

function initFormData() {
  const { result, notes } = props.data?.results[0] || {};
  if (result) {
    formData.result = result;
    if (notes) {
      const parts = notes.split(' | 原因: ');
      if (parts.length === 2) {
        formData.comment = parts[0].trim();
        const reasonsText = parts[1].trim();
        if (reasonsText) {
          formData.reasons = reasonsText.split(',').map(reason => reason.trim()).filter(reason => reason);
        }
      } else {
        formData.comment = notes;
      }
    }
  }
}

function resetForm() {
  formData.result = null;
  formData.comment = '';
  formData.reasons = [];
}

async function handleSubmit() {
  if (!formData.result) {
    return;
  }

  // 校验评语
  if (commentError.value) {
    return;
  }

  // 校验原因
  if (reasonError.value) {
    return;
  }

  isSubmitting.value = true;
  try {
    const params = {
      appraisalId: props.data.id,
      result: Number(formData.result),
      comment: formData.comment,
      userId: userStore.userInfo.user_id
    };
    let appraisal_status = null;
    if (formData.result === AppraisalResult.Authentic) {
      appraisal_status = AppraisalStatus.Completed;
    } else if (formData.result === AppraisalResult.Fake) {
      appraisal_status = AppraisalStatus.Completed;
    } else if (formData.result === AppraisalResult.Doubt) {
      appraisal_status = AppraisalStatus.PendingCompletion;
      if (!isEmpty(formData.reasons)) {
        params.reasons = formData.reasons;
      }
    } else if (formData.result === AppraisalResult.Rejected) {
      appraisal_status = AppraisalStatus.Rejected;
      if (!isEmpty(formData.reasons)) {
        params.reasons = formData.reasons;
      }
    }

    await fetchAppraisalResultAdd({ items: [params] });
    await fetchAppraisalUpdate({items:[{ appraisalId: props.data.id, status: appraisal_status,mainCategory:props.data.mainCategory }]});
    emit('submit', params);
    $message.success('鉴定结果提交成功');
    resetForm();
    isEditing.value = false;
  } catch (error) {
    $message.error('提交鉴定结果失败');
    console.error('提交鉴定结果失败:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
