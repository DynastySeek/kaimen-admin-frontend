<template>
  <n-select
    v-model:value="valueModel"
    :placeholder="placeholder"
    :options="options"
    :clearable="clearable"
    :style="{ width }"
  />
</template>

<script setup>
import { computed, defineModel } from 'vue';
import {
  AppraisalClass,
  AppraisalClassLabelMap,
  AppraisalResult,
  AppraisalResultLabelMap,
  CategoryStatus,
  CategoryStatusLabelMap,
  Gender,
  GenderLabelMap,
  PriceRange,
  PriceRangeLabelMap,
  ProductStatus,
  ProductStatusLabelMap,
  PubStatus,
  PubStatusLabelMap,
  UserStatus,
  UserStatusLabelMap,
  UserType,
  UserTypeLabelMap,
} from '@/constants';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  valueType: {
    type: String,
    default: 'string',
    validator: value => ['string', 'number', 'boolean'].includes(value),
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  width: {
    type: String,
    default: '100%',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
});

// v-model:value 绑定的值
const valueModel = defineModel('value', {
  type: [String, Number, Boolean],
  default: undefined,
});

const EnumMap = {
  Gender: [Gender, GenderLabelMap],
  UserStatus: [UserStatus, UserStatusLabelMap],
  UserType: [UserType, UserTypeLabelMap],
  CategoryStatus: [CategoryStatus, CategoryStatusLabelMap],
  ProductStatus: [ProductStatus, ProductStatusLabelMap],
  AppraisalClass: [AppraisalClass, AppraisalClassLabelMap],
  AppraisalResult: [AppraisalResult, AppraisalResultLabelMap],
  PubStatus: [PubStatus, PubStatusLabelMap],
  PriceRange: [PriceRange, PriceRangeLabelMap],
};

/**
 * 转换值类型
 * @param {string} value - 原始值
 * @returns {string|number|boolean} 转换后的值
 */
function convertValueType(value) {
  switch (props.valueType) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    default:
      return value;
  }
}

/**
 * 下拉选项列表
 */
const options = computed(() => {
  const target = EnumMap[props.name];
  if (!target) {
    console.error(`未找到枚举值映射表 ${props.name}`);
    return [];
  }
  const [enumObj, labelObj] = target;
  if (!enumObj || !labelObj) {
    return [];
  }

  return Object.entries(enumObj).map(([_key, value]) => ({
    value: convertValueType(value),
    label: labelObj[value],
  }));
});
</script>
