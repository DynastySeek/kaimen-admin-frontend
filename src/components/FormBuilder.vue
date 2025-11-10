<template>
  <n-form
    ref="formRef"
    :model="modelValue"
    :rules="extractedRules"
    :label-width="labelWidth"
    label-placement="left"
  >
    <n-grid :cols="24" :x-gap="gutter">
      <n-grid-item v-for="item in filterFormItems" :key="item.prop" :span="item.span || 24">
        <n-form-item :label="item.label" :path="item.prop">
          <slot :name="item.prop">
            <component :is="getComponent(item)" v-bind="getProps(item)" v-model:value="modelValue[item.prop]"
            :style="item.width
                ? {
                    width: typeof item.width === 'number'
                      ? `${item.width}px`
                      : item.width,
                  }
                : undefined"/>
          </slot>
        </n-form-item>
      </n-grid-item>
      <n-grid-item v-if="$slots.actions" :span="actionsSpan">
        <n-form-item>
          <slot name="actions" />
        </n-form-item>
      </n-grid-item>
    </n-grid>
  </n-form>
</template>

<script setup>
import { NCascader, NCheckbox, NDatePicker, NInput, NInputNumber, NRadioGroup, NSelect, NSwitch, NTimePicker } from 'naive-ui';
import { computed, defineModel, useTemplateRef } from 'vue';
import BasicEditor from './BasicEditor.vue';
import SelectDictionary from './SelectDictionary.vue';
import SelectRemote from './SelectRemote.vue';
import UploadImage from './UploadImage.vue';

const props = defineProps({
  formItems: {
    type: Array,
    required: true,
  },
  rules: {
    type: Object,
    default: () => ({}),
  },
  labelWidth: {
    type: String,
    default: '120px',
  },
  gutter: {
    type: Number,
    default: 0,
  },
  actionsSpan: {
    type: Number,
    default: 24,
  },
});

const modelValue = defineModel({ required: true });

const formRef = useTemplateRef('formRef');

const filterFormItems = computed(() => {
  return props.formItems.filter(item => !item.hidden);
});

/**
 * 从 formItems 中提取校验规则
 */
const extractedRules = computed(() => {
  const rules = {};
  props.formItems.forEach((item) => {
    if (item.rules) {
      rules[item.prop] = item.rules;
    }
  });
  // 合并传入的 rules 参数，优先级更高
  return { ...rules, ...props.rules };
});

const componentMap = {
  input: NInput,
  password: NInput,
  textarea: NInput,
  number: NInputNumber,
  select: NSelect,
  cascader: NCascader,
  date: NDatePicker,
  datetime: NDatePicker,
  datetimerange: NDatePicker,
  time: NTimePicker,
  switch: NSwitch,
  checkbox: NCheckbox,
  radio: NRadioGroup,
  uploadImage: UploadImage,
  selectDictionary: SelectDictionary,
  selectRemote: SelectRemote,
  basicEditor: BasicEditor,
};

function getComponent(item) {
  return componentMap[item.type] || 'n-input';
}

function getProps(item) {
  const baseProps = {
    placeholder: item.placeholder || `请输入${item.label}`,
    disabled: item.disabled,
    clearable: true,
    ...item.props,
  };

  switch (item.type) {
    case 'password':
      return {
        ...baseProps,
        type: 'password',
        showPasswordOn: 'mousedown',
      };
    case 'textarea':
      return {
        ...baseProps,
        type: 'textarea',
        rows: 4,
      };
    case 'number':
      return {
        ...baseProps,
        min: 0,
      };
    case 'date':
      return {
        ...baseProps,
        type: 'date',
        format: 'yyyy-MM-dd',
        valueFormat: 'yyyy-MM-dd',
      };
    case 'datetime':
      return {
        ...baseProps,
        type: 'datetime',
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      };
    case 'datetimerange':
      return {
        ...baseProps,
        type: 'datetimerange',
        clearable: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
      };
    case 'select':
      return {
        ...baseProps,
        placeholder: `请选择${item.label}`,
        clearable: true,
      };
    case 'cascader':
      return {
        ...baseProps,
        clearable: true,
        filterable: true,
      };
    case 'selectDictionary':
      return {
        ...baseProps,
        name: item.name,
        placeholder: `请选择${item.label}`,
        valueType: item.valueType || 'string',
      };
    case 'selectRemote':
      return {
        ...baseProps,
        name: item.name,
        placeholder: `请选择${item.label}`,
      };
    case 'uploadImage':
      return {
        ...baseProps,
        max: item.max || 1,
      };
    default:
      return baseProps;
  }
};

async function validate() {
  try {
    await formRef.value.validate();
    return true;
  } catch {
    $message.warning('请根据校验完善表单');
    return false;
  }
}

function resetFields() {
  formRef.value.restoreValidation();
}

function clearValidate() {
  formRef.value.restoreValidation();
}

defineExpose({
  validate,
  resetFields,
  clearValidate,
});
</script>
