
<template>
  <div style="display: flex; gap: 8px;">
    <n-popconfirm positive-text="确认服务完成" @positive-click="onEdit(row)" :show-icon="false">
      <template #trigger>
        <n-button text size="small" type="primary">服务完成</n-button>
      </template>
      确定操作服务完成？
    </n-popconfirm>
    <n-popconfirm  ref="closePop" positive-text="确认服务关闭" :positive-button-props="{disabled: !closeReason}"  @positive-click="handleClose" :show-icon="false">
      <template #trigger>
        <n-button text size="small" type="error">服务关闭</n-button>
      </template>
      <template #default>
        <n-space vertical :size="8">
          <div>
            <span style="color: red">*</span>
            服务关闭原因
          </div>
        <n-input v-model:value="closeReason" type="textarea" placeholder="请输入原因"/>
        <div v-if="errorMsg" style="color: red; font-size: 12px;">
            {{ errorMsg }}
          </div>
      </n-space>
      </template>
    </n-popconfirm>
  </div>
</template>
<script setup>
import { NButton, NPopconfirm } from 'naive-ui'
import { computed, ref } from 'vue';
const props = defineProps({
  row: { type: Object, required: true },
  onEdit: { type: Function, required: true },
  onClose: { type: Function, required: true }
})
const closeReason = ref('')
const closePop = ref(null)
const errorMsg = computed(() => {
  
  return closeReason.value.trim() ? '' : '请输入服务关闭原因';
});
const handleClose = () => {
  if (errorMsg.value) {
    return;
  }
  props.onClose(props.row, closeReason.value)
  closeReason.value = ''
}

</script>

