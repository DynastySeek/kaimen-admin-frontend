<template>
  <div class="upload-image">
    <n-upload
      action="/api/upload/image"
      list-type="image-card"
      response-type="json"
      :max="max"
      :disabled="disabled"
      :multiple="multiple"
      :file-list="fileList"
      :headers="{ Authorization: `Bearer ${getToken()}` }"
      @update:file-list="handleFileListChange"
      @finish="handleFinish"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
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

/**
 * 将URL转换为文件对象
 * @param {string} url - 图片URL
 * @param {number} index - 索引
 * @returns {Object} 文件对象
 */
function createFileFromUrl(url, index = 0) {
  if (!url) {
    return null;
  }

  const fileName = url.split('/').pop() || `image_${index}.jpg`;
  return {
    id: `file_${Date.now()}_${index}`,
    name: fileName,
    status: 'finished',
    url,
    thumbnailUrl: url,
  };
}

/**
 * 将URL数组转换为文件列表
 * @param {string|Array} value - URL或URL数组
 * @returns {Array} 文件列表
 */
function createFileListFromValue(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(url => url).map((url, index) => createFileFromUrl(url, index));
  } else {
    const fileObj = createFileFromUrl(value, 0);
    return fileObj ? [fileObj] : [];
  }
}

// 文件列表
const fileList = ref([]);

// 监听modelValue变化，更新fileList
watch(
  () => props.modelValue || props.value,
  (newValue) => {
    console.log('🍈 -> modelValue changed:', newValue);
    fileList.value = createFileListFromValue(newValue);
  },
  { immediate: true },
);

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
  // 更新文件列表
  fileList.value = newFileList;

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
