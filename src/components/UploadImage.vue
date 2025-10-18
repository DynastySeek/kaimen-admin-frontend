<template>
  <div class="upload-image">
    <n-upload
      action="/api/upload/image"
      list-type="image-card"
      response-type="json"
      :max="max"
      :disabled="disabled"
      :multiple="multiple"
      :default-file-list="defaultFileList"
      :headers="{ Authorization: `Bearer ${getToken()}` }"
      @update:file-list="handleFileListChange"
      @finish="handleFinish"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getToken } from '@/utils';

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: '',
  },
  value: {
    type: [String, Array],
    default: '',
  },
  max: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'update:value', 'change']);

const defaultFileList = ref([]);

function handleFinish({
  file,
  event,
}) {
  const { success, message, data } = event.target.response;
  if (success) {
    $message.success(message);
    file.url = data.url;
  } else {
    $message.error(message);
  }
  return file;
}

function handleFileListChange(newFileList) {
  const finishedFiles = newFileList.filter(file => file.status === 'finished');

  const urls = finishedFiles.map(file => file.url);

  if (props.max === 1) {
    const url = urls.length > 0 ? urls[0] : '';
    emit('update:modelValue', url);
    emit('update:value', url);
    emit('change', url);
  } else {
    emit('update:modelValue', urls);
    emit('update:value', urls);
    emit('change', urls);
  }
}
</script>
