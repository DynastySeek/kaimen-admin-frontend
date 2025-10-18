<template>
  <div style="border: 1px solid #ccc">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      v-model="valueHtml"
      style="height: 400px; overflow-y: hidden"
      :mode="mode"
      :defaultConfig="editorConfig"
      @onCreated="handleCreated"
      @onChange="handleChange"
      @onDestroyed="handleDestroyed"
    />
  </div>
</template>

<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import { computed, onBeforeUnmount, ref, shallowRef, watch } from 'vue';
import '@wangeditor/editor/dist/css/style.css';

const props = defineProps({
  modelValue: {
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

const emit = defineEmits(['update:modelValue']);

const editorRef = shallowRef();
const valueHtml = ref(props.modelValue || '');

const toolbarConfig = {};
const editorConfig = computed(() => ({
  placeholder: props.placeholder,
  readOnly: props.disabled,
}));
const mode = 'default';

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== valueHtml.value) {
      valueHtml.value = newValue || '';
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
}

function handleDestroyed(editor) {
  console.log('destroyed', editor);
}
</script>
