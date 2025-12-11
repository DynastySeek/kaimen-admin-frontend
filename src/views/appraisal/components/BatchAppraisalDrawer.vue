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
        <div v-if="isQuWu" class="text-[12px] text-[#666] mb-2">
          勾选鉴定单中有趣物类目，鉴定结果为有趣/无聊
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
        <template v-if="[AppraisalResult.Authentic, QuWuInterest.Interesting].includes(formData.result)">
          <div class="text-[#1560FA] font-bold">
            第二步：请选择藏品价值等级 
          </div>
          <n-radio-group v-model:value="formData.grade" class="mb-2">
            <n-grid :y-gap="8" :cols="3">
              <n-gi v-for="option in levelOptions" :key="option.value">
                <n-radio
                :value="option.value"
                :label="option.label"
                size="small"/>
              </n-gi>
            </n-grid>
          </n-radio-group>
          <div v-if="levelError" class="text-red-500 text-[12px] mt-1">
            {{ levelError }}
          </div>
        </template>
        <!-- 第二步：原因（选填） - 存疑状态 -->
        <template v-if="[AppraisalResult.Doubt].includes(formData.result)">
          <div class="text-[#1560FA] font-bold">
            第二步：原因
            {{ isRequired ? '' : '(选填)' }} 
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
            maxlength="30"
            show-count
            clearable 
          />
          <div v-if="reasonError" class="text-red-500 text-[12px] mt-1">
            {{ reasonError }}
          </div>
        </template>
        <template v-else-if="[AppraisalResult.Rejected].includes(formData.result)">
          <div class="text-[#1560FA] font-bold">
            第二步：原因
            {{ isRequired ? '' : '(选填)' }} 
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
            maxlength="30"
            show-count
            clearable 
          />
          <div v-if="reasonError" class="text-red-500 text-[12px] mt-1">
        {{ reasonError }}
      </div>
        </template>
        <!-- 第二步：评语 -->
        <template v-else>
          <div class="text-[#1560FA] font-bold">
            {{ 
          [AppraisalResult.Authentic, QuWuInterest.Interesting].includes(formData.result)?"第三步:评语":"第二步:评语"
         }}
            {{ isRequired ? '' : '(选填)' }} 
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
            maxlength="200"
            show-count
            clearable 
          />
          <div v-if="commentError" class="text-red-500 text-[12px] mt-1">{{ commentError }}</div>
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
import { computed, reactive, ref, watch } from 'vue';
import { AppraisalClass,AppraisalResult, AppraisalResultLabelMap, AppraisalStatus, QuWuInterest, QuWuInterestLabelMap, LevelType, LevelLabelMap } from '@/constants';
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
  checkedRows: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:show', 'submit']);
const levelOptions =[{
  label: LevelLabelMap[LevelType.SLevel],
  value: LevelType.SLevel,
}, {
  label: LevelLabelMap[LevelType.ALevel],
  value: LevelType.ALevel,
}, {
  label: LevelLabelMap[LevelType.NORMAL],
  value: LevelType.NORMAL,  
}]
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
const isRequired = ref(false)

const commentError = computed(() => {
  if (!isRequired.value) return '';
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

const levelError = computed(() => {
  if (formData.result === AppraisalResult.Authentic ||
      formData.result === QuWuInterest.Interesting) {
    return formData.grade ? '' : '请选择藏品价值等级';
  }
  return '';
});
const reasonError = computed(() => {
  if (!isRequired.value) return '';

  if (formData.result === AppraisalResult.Doubt ||
  formData.result === AppraisalResult.Rejected ||
  formData.result === AppraisalResult.Doubt ||
  formData.result === AppraisalResult.Rejected
    ) {
    return formData.reasons.length ? '' : '请输入原因';
  }
  return '';
});

// 弹窗显示状态
const visible = computed({
  get: () => props.show,
  set: value => emit('update:show', value),
});
let isQuWu =ref(false)

watch(() => props.checkedRowKeys, (newVal) => {
  console.log('checkedRowKeys', props.checkedRowKeys)
}, { deep: true, immediate: true })

watch(() => props.checkedRows, (newVal) => {
  console.log('newVal', props.checkedRows)
  isQuWu.value =  newVal?.some(row => Number(row?.mainCategory) == Number(AppraisalClass?.QuWu))
  isRequired.value = newVal?.some(row => row?.light == 1)
}, { deep: true, immediate: true })

// const resultLabelMap = computed(() => (isQuWu.value ? QuWuInterestLabelMap : AppraisalResultLabelMap));
// 结果选项配置
const resultOptions = computed(() => {
  if (isQuWu.value) {
    return [
      { label: `${AppraisalResultLabelMap[AppraisalResult.Authentic]}/${QuWuInterestLabelMap[QuWuInterest.Interesting]}` , value: QuWuInterest.Interesting, color: '#21D476' },
      { label: `${AppraisalResultLabelMap[AppraisalResult.Fake]}/${QuWuInterestLabelMap[QuWuInterest.Boring]}` , value: QuWuInterest.Boring, color: '#FD4648' },
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
// 表单数据
const formData = reactive({
  result: null,
  comment: '',
  reasons: [],
  grade: null,
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
  if (commentError.value) {
    return;
  }
  // 校验原因
  if (reasonError.value) {
    return;
  }
  if(levelError.value) {
    return;
  }
  isSubmitting.value = true;
  try {
    console.log('props.checkedRows', props.checkedRows)
    // 构建批量鉴定结果数据
    const resultItems = props.checkedRows.map(item => ({
      appraisalId: item?.id,
      result: Number(formData.result),
      comment: formData.comment,
      reason: formData.reasons,
      customReason: '',
      userId: item?.userId,
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
  
    const updateItems = props.checkedRows.map(item => ({
      appraisalId: item?.id,
      mainCategory: item?.mainCategory,
      status: appraisal_status,
      grade: Number(formData.grade),
    }));
   

    try {
      await fetchAppraisalResultAdd({ items: resultItems });
    } catch (error) {
      console.error('批量更新鉴定状态失败:', error);
    }
    try {
      await fetchAppraisalUpdate({items:updateItems});
    } catch (error) {
      console.error('批量更新鉴定状态失败:', error);
    }
   
    // 批量更新鉴定状态
  
    // 批量添加鉴定结果
   
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
