<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      :editor="editorRef"
      :default-config="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      v-model="valueHtml"
      style="height: 400px; overflow-y: hidden"
      :mode="mode"
      :default-config="editorConfig"
      @on-created="handleCreated"
      @on-change="handleChange"
      @on-destroyed="handleDestroyed"
    />
  </div>
</template>

<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import { fetchUploadImage } from '@/services';
import '@wangeditor/editor/dist/css/style.css';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: '请输入内容...',
  },
});

const emit = defineEmits(['update:modelValue', 'update:value', 'change']);

const editorRef = shallowRef();
const valueHtml = ref(props.modelValue || '');

/**
 * 处理图片上传
 * @param {File} file - 图片文件
 * @param {Function} insertFn - 插入图片的回调函数
 */
async function handleUploadImage(file, insertFn) {
  console.log('🍈 -> handleUploadImage -> file:', file);
  try {
    const response = await fetchUploadImage(file);
    if (response?.data?.url) {
      // 插入图片到编辑器
      insertFn(response.data.url, file.name, response.data.url);
    } else {
      console.error('图片上传失败：响应数据格式错误');
    }
  } catch (error) {
    console.error('图片上传失败:', error);
  }
}

const toolbarConfig = {};
const editorConfig = computed(() => ({
  placeholder: props.placeholder,
  readOnly: props.disabled,
  MENU_CONF: {
    uploadImage: {
      customUpload: handleUploadImage,
      // 限制图片大小为 10M
      maxFileSize: 10 * 1024 * 1024,
      // 限制图片类型
      allowedFileTypes: ['image/*'],
    },
  },
}));
const mode = 'default';

watch(
  () => props.value,
  (newValue) => {
    if (newValue !== valueHtml.value) {
      valueHtml.value = newValue || '';
      // 如果编辑器已经创建，同步更新编辑器内容
      if (editorRef.value) {
        editorRef.value.setHtml(newValue || '');
      }
    }
  },
);

watch(
  () => props.disabled,
  (newDisabled) => {
    const editor = editorRef.value;
    if (editor) {
      if (newDisabled) {
        editor.disable();
      } else {
        editor.enable();
      }
    }
  },
);

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) {
    return;
  }
  editor.destroy();
});

function handleCreated(editor) {
  editorRef.value = editor;
  if (props.disabled) {
    editor.disable();
  }
}

function handleChange(editor) {
  const html = editor.getHtml();
  valueHtml.value = html;
  emit('update:modelValue', html);
  emit('update:value', html);
  emit('change', html);
}

function handleDestroyed(editor) {
  console.log('destroyed', editor);
}
</script>
