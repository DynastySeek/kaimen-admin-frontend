<template>
  <n-select
    :value="modelValue"
    :placeholder="placeholder"
    :options="options"
    :clearable="clearable"
    :loading="loading"
    :style="{ width }"
    @update:value="handleUpdateValue"
  />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { fetchUserList } from '@/services';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  width: {
    type: String,
    default: '100%',
  },
  modelValue: {
    type: [String, Number, Boolean],
    default: undefined,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  labelField: {
    type: String,
    default: 'label',
  },
  valueField: {
    type: String,
    default: 'value',
  },
});

const emit = defineEmits(['update:modelValue']);

const loading = ref(false);
const remoteData = ref([]);

/**
 * 远程数据映射配置
 */
const RemoteDataMap = {
  user: {
    fetchFn: fetchUserList,
    labelField: 'name',
    valueField: 'name',
    params: { page: 1, pageSize: 100 }, // 获取所有用户
  },
};

/**
 * 处理选择值更新事件
 * @param {string | number | boolean} value - 更新后的值
 */
function handleUpdateValue(value) {
  emit('update:modelValue', value);
}

/**
 * 获取远程数据
 */
async function fetchRemoteData() {
  const config = RemoteDataMap[props.name];
  if (!config) {
    console.error(`未找到远程数据配置 ${props.name}`);
    return;
  }

  try {
    loading.value = true;
    const { data } = await config.fetchFn(config.params);
    remoteData.value = data?.list || data || [];
  } catch (error) {
    console.error(`获取远程数据失败 ${props.name}:`, error);
    remoteData.value = [];
  } finally {
    loading.value = false;
  }
}

/**
 * 下拉选项列表
 */
const options = computed(() => {
  const config = RemoteDataMap[props.name];
  if (!config || !remoteData.value.length) {
    return [];
  }

  const labelField = props.labelField !== 'label' ? props.labelField : config.labelField;
  const valueField = props.valueField !== 'value' ? props.valueField : config.valueField;

  return remoteData.value.map(item => ({
    ...item,
    value: item[valueField],
    label: item[labelField] || item[valueField],
  }));
});

onMounted(() => {
  fetchRemoteData();
});
</script>
