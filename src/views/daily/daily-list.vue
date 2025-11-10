<template>
  <CommonPage>
    <n-card class="mb-4">
      <n-space vertical :size="12">
        <div class="text-7xl font-bold" style="font-weight: 700;">每日精品评选</div>
        <n-alert type="info" :bordered="false">
          <n-space vertical :size="8">
            <div>1. 21:00前发布的鉴定参与当日精品评选，之后则计入次日</div>
            <div>2. 每个类目每天最多将选出5个精品内容，若类目单日发布量不足5个，或达标内容不满5个，精品数量将根据实际情况减少。</div>
          </n-space>
        </n-alert>
      </n-space>
    </n-card>
    <ProTable
      ref="proTableRef"
      label-width="120px"
      :columns="columns"
      :checked-row-keys="checkedRowKeys"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalList"
      :format-search-params="formatSearchParams"
      :format-response-list="formatResponseList"
      :row-key="item => item.appraisal_id"
      @update:checked-row-keys="handleCheckedRowKeysChange"
    >
      <template #header>
        <NSpace>
          <NButton
            v-if="activeTab === 0"
            type="primary"
            @click="handleBatchUpdate"
          >
            修改
          </NButton>
    
      <n-radio-group v-model:value="activeTab" name="appraisal-status" @update:value="handleTabChange">
        <n-radio-button
          v-for="tab in tabs"
          :key="tab.id"
          :value="tab.id"
        >
          {{ `${tab.label}` }}
        </n-radio-button>
      </n-radio-group>
        </NSpace>
      </template>
    </ProTable>

    <!-- 视频播放弹窗 -->
    <VideoModal v-model:show="videoModalVisible" :src="currentVideoSrc" :title="currentVideoTitle" />
    <!-- 批量鉴定弹窗 -->
    <BatchUpdateDrawer
      v-model:show="batchAppraisalModalVisible"
      :checked-row-keys="checkedRowKeys"
      :checked-rows="checkedRows"
      @update:checked-row-keys="keys => checkedRowKeys = keys"
      @submit="handleBatchAppraisalSubmit"
    />
  </CommonPage>
</template>

<script setup>
import { cloneDeep, omit } from 'lodash-es';
import { NButton, NIcon, NSpace, NTag } from 'naive-ui';
import { computed, ref, watch } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, VideoModal } from '@/components';;
import { fetchAppraisalList, fetchAppraisalUpdate } from '@/services';
import BatchUpdateDrawer from './BatchUpdateDrawer.vue';
import ImagePreview from './ImagePreview.vue';
import dayjs from 'dayjs';

const tabs = [
  { label: '已评选', id: 1,value: 1 },
  { label: '未评选', id: 0,value: 0 },
];
const activeTab = ref(1);
const proTableRef = ref();

const batchAppraisalModalVisible = ref(false);
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');

const checkedRowKeys = ref([]);
const tableData = ref([]); // 存储表格数据
const forceShowSelection = ref(false);
const checkedRows = ref([]);

// 默认值常量
const DEFAULT_DATE = dayjs().format('YYYY-MM-DD');
const DEFAULT_CATEGORY = '1';

/**
 * 搜索参数格式化函数
 * @param {object} params - 搜索参数
 * @returns {object} 格式化后的参数
 */
function formatSearchParams(params) {
  const selectedDate = params.selectedDate ? dayjs(params.selectedDate) : null;
  const startOfRange = selectedDate
    ? selectedDate.subtract(1, 'day').hour(21).minute(0).second(0)
    : null;
  const endOfRange = selectedDate
    ? selectedDate.hour(21).minute(0).second(0)
    : null;

  return omit({
    ...params,
    fine_class: activeTab.value,
    createStartTime: startOfRange ? startOfRange.format('YYYY-MM-DD HH:mm:ss') : null,
    createEndTime: endOfRange ? endOfRange.format('YYYY-MM-DD HH:mm:ss') : null,
  }, ['selectedDate']);
}

/**
 * 响应数据格式化函数
 * @param {Array} list - 原始数据列表
 * @returns {Array} 格式化后的数据列表
//  */
async function formatResponseList(list) {
  try {
    const clonedList = cloneDeep(list);
    const allCloudImages = clonedList?.reduce((acc, d) => acc.concat(d.images || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudVideos = clonedList?.reduce((acc, d) => acc.concat(d.videos || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudUrl = [...allCloudImages, ...allCloudVideos];
    if (allCloudUrl.length > 0) {
      const tempFileUrls = await getTempFileUrls(allCloudUrl);
      clonedList.forEach((item) => {
        item.images = item.images.map((img) => {
          const tempFile = tempFileUrls.find(file => file.fileID === img);
          return tempFile ? tempFile.tempFileURL : img;
        });
        item.videos = item.videos.map((vid) => {
          const tempFile = tempFileUrls.find(file => file.fileID === vid);
          return tempFile ? tempFile.tempFileURL : vid;
        });
      });
    }
    // 保存表格数据供后续使用
    tableData.value = clonedList;
    return clonedList;
  } catch (error) {
    console.error('获取鉴定详情失败:', error);
    $message.error('获取鉴定列表数据失败');
    return list;
  }
}

const searchFormItems = computed(() => [
  {
    prop: 'selectedDate',
    label: '评选日期',
    type: 'date',
    placeholder: '请选择评选日期',
    span: 8,
    value: DEFAULT_DATE, // 设置默认值为今天
  },
  {
  prop: 'first_class',
  label: '类目',
  type: 'select',
  placeholder: '请选择类目',
  span: 8,
  props: {
    options: [
      { label: '银元', value: '1' },
      { label: '古钱', value: '2' },
      { label: '杂项', value: '4' },
      { label: '纸币', value: '5' },
    ],
  },
  value:'1',

},
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 8,
  },
  {
    prop: 'description',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 8,
  },
 
].filter(item => !item.hidden));

// 计算选中的完整行数据
const columns = computed(() => [
  {
    type: 'selection',
    fixed: 'left',
    hidden: activeTab.value === 1,

  },
  {
    title: '鉴定ID',
    key: 'appraisal_id',
    width: 300,

  },
  {
    title: '图片',
    key: 'images',
    width: 320,
    render: (row) => {
      return h(ImagePreview, {
        images: row.images || [],
        width: 110,
        height: 68,
        maxDisplay: 4,
      });
    },
  },
  {
    title: '描述',
    key: 'description',
    width: 300,
  },
 
].filter(column => !column.hidden));

function handleTabChange(value) {
  activeTab.value = value;
  proTableRef.value?.reload();
}
/**
 * 处理选中行变化，限制最多选5个
 */
watch([checkedRowKeys, tableData], () => {
  checkedRows.value = tableData.value.filter(row => checkedRowKeys.value.includes(row.appraisal_id));
});

function handleCheckedRowKeysChange(keys) {
  batchAppraisalModalVisible.value = !batchAppraisalModalVisible.value || keys.length>0
  if (keys.length > 5) {
    $message.warning('最多只能选择5个项目');
    return;
  }
  checkedRowKeys.value = keys;
}
function handleBatchUpdate() {
  const cache = localStorage.getItem("STORAGE_KEY");
  if (cache) {
    checkedRows.value = JSON.parse(cache);
  }

  forceShowSelection.value = true;
  batchAppraisalModalVisible.value = true
}

async function handleBatchAppraisalSubmit(submitData) {
  try {
    const updateData = (submitData || []).map(item => ({
      id: item,
      fine_class: 1
    }));
   await fetchAppraisalUpdate(updateData);
   activeTab.value = 1
    // TODO: 调用实际批量更新接口
    $message.success('更新成功');
    proTableRef.value?.refresh();
    checkedRowKeys.value = [];
  } catch (error) {
    console.error('更新失败:', error);
    $message.error('更新失败');
  }
}

</script>
