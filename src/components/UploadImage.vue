<template>
  <div class="upload-image">
    <n-upload
      v-model:file-list="fileList"
      :custom-request="customRequest"
      :show-file-list="false"
      accept="image/*"
      list-type="image-card"
      class="upload-demo"
      @before-upload="beforeUpload"
    >
      <div v-if="!imageUrl" class="h-full flex flex-col items-center justify-center">
        <n-icon v-if="loading" class="is-loading">
          <Loader />
        </n-icon>
        <n-icon v-else>
          <PlusCircle />
        </n-icon>
        <div class="mt-2 text-gray-500">
          上传图片
        </div>
      </div>
      <img v-else :src="$imageUrl(imageUrl)" class="h-full w-full object-contain">
    </n-upload>
  </div>
</template>

<script setup>
import { Loader, PlusCircle } from 'lucide-vue-next';
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
});

/**
 * 组件事件定义
 * @typedef {object} Emits
 * @property {Function} update:modelValue - 更新v-model值的事件
 * @property {Function} change - 图片变更事件
 */
const emit = defineEmits(['update:modelValue', 'change']);

const authStore = useAuthStore();

// 组件状态
const loading = ref(false);
const imageUrl = ref('');
const fileList = ref([]);

/**
 * 监听父组件传入的modelValue变化
 */
watch(
  () => props.modelValue,
  (newVal) => {
    imageUrl.value = newVal;
  },
  { immediate: true },
);

/**
 * 上传前校验
 * @param {object} options - 上传选项
 * @param {File} options.file - 待上传的文件
 * @returns {boolean|Promise<boolean>} 是否允许上传
 */
function beforeUpload({ file }) {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    window.$message.error('只能上传图片文件！');
    return false;
  }

  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    window.$message.error('图片大小不能超过2MB！');
    return false;
  }

  return true;
}
/**
 * 自定义上传请求
 * @param {object} options - 上传选项
 * @param {File} options.file - 待上传的文件
 */
async function customRequest({ file }) {
  try {
    const token = authStore.token;

    loading.value = true;
    const formData = new FormData();
    formData.append('file', file.file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData, // 自动设置 Content-Type 和 boundary
      // 如需认证头：
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then(response => response.json());
    const url = response.data.url; // 假设后端返回的数据中包含url字段

    imageUrl.value = url;
    emit('update:modelValue', url);
    emit('change', { file, url });
    window.$message.success('上传成功');
  } catch (error) {
    window.$message.error('上传失败');
    console.error('Upload error:', error);
  } finally {
    loading.value = false;
  }
}
</script>
