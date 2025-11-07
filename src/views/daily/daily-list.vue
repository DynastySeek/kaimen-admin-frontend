<template>
  <CommonPage>
    <template #action>
      <n-radio-group v-model:value="activeTab" name="appraisal-status" @update:value="handleTabChange">
        <n-radio-button
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :label="tab.label"
        />
      </n-radio-group>
    </template>
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
            type="primary"
            @click="handleBatchUpdate"
          >
            修改
          </NButton>
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
import { computed, ref } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, SelectDictionary, VideoModal } from '@/components';
import { AppraisalStatus, AppraisalStatusLabelMap } from '@/constants';
import { fetchAppraisalList, fetchAppraisalUpdate } from '@/services';
import { useUserStore } from '@/stores';
import { formatDateTime } from '@/utils';
import AppraisalAction from '../appraisal/components/AppraisalAction.vue';
import BatchUpdateDrawer from './BatchUpdateDrawer.vue';
import ImagePreview from '../appraisal/components/ImagePreview.vue';

const tabs = [
  { label: '银元:', value: { appraisalStatus: AppraisalStatus.PendingAppraisal } },
  { label: '古钱:', value: { appraisalStatus: AppraisalStatus.PendingCompletion } },
  { label: '杂项:', value: { appraisalStatus: AppraisalStatus.Completed, appraisalResult: AppraisalStatus.PendingAppraisal } },
  { label: '纸币:', value: { appraisalStatus: AppraisalStatus.Completed, appraisalResult: AppraisalStatus.InProgress } },
];

const activeTab = ref(null);
const userStore = useUserStore();
const proTableRef = ref();

const batchAppraisalModalVisible = ref(false);
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');
const checkedRowKeys = ref([]);
const tableData = ref([]); // 存储表格数据

/**
 * 搜索参数格式化函数
 * @param {object} params - 搜索参数
 * @returns {object} 格式化后的参数
 */
function formatSearchParams(params) {
  return omit({
    ...params,
    ...(activeTab.value || {}),
    createStartTime: params.createTimeRange?.[0] ? formatDateTime(params.createTimeRange?.[0]) : null,
    createEndTime: params.createTimeRange?.[1] ? formatDateTime(params.createTimeRange?.[1]) : null,
    updateStartTime: params.updateTimeRange?.[0] ? formatDateTime(params.updateTimeRange?.[0]) : null,
    updateEndTime: params.updateTimeRange?.[1] ? formatDateTime(params.updateTimeRange?.[1]) : null,
  }, ['createTimeRange', 'updateTimeRange']);
}

/**
 * 响应数据格式化函数
 * @param {Array} list - 原始数据列表
 * @returns {Array} 格式化后的数据列表
 */
async function formatResponseList(list) {
  try {
    const clonedList = cloneDeep(list);
    const allCloudImages = clonedList.reduce((acc, d) => acc.concat(d.images || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudVideos = clonedList.reduce((acc, d) => acc.concat(d.videos || []), []).filter(v => v.startsWith('cloud://'));
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
    span: 6,
    value: new Date().getTime(), // 设置默认值为今天
  },
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 6,
  },
  {
    prop: 'title',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 6,
  },
 
].filter(item => !item.hidden));

// 计算选中的完整行数据
const checkedRows = computed(() => {
  return tableData.value.filter(row => checkedRowKeys.value.includes(row.appraisal_id));
});

console.log('checkedRows', checkedRows)
const columns = computed(() => [
  {
    type: 'selection',
    fixed: 'left',
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
        images: row.images,
        width: 110,
        height: 68,
        maxDisplay: 4,
      });
    },
  },
  {
    title: '描述',
    key: 'user_phone',
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
function handleCheckedRowKeysChange(keys) {
  if (keys.length > 5) {
    $message.warning('最多只能选择5个项目');
    return;
  }
  checkedRowKeys.value = keys;
}
function handleBatchUpdate() {
  const count = checkedRowKeys.value.length;
  if (count > 0 && count <= 5) {
    batchAppraisalModalVisible.value = true;
  } else if (count === 0) {
    $message.warning('请先选择项目');
  }
}
function handleAppraisalSubmit(_data) {
  proTableRef.value?.refresh();
}

async function handleBatchAppraisalSubmit() {
  proTableRef.value?.refresh();
  checkedRowKeys.value = [];
}

function handleVideoPlay(row, videoIndex = 0) {
  if (row.videos && row.videos.length > 0) {
    currentVideoSrc.value = row.videos[videoIndex];
    currentVideoTitle.value = `${row.title} - 视频${videoIndex + 1}`;
    videoModalVisible.value = true;
  }
}

async function handleCategoryChange(value, row) {
  try {
    const updateData = [{
      id: row.appraisal_id,
      appraisal_class: String(value),
    }];

    await fetchAppraisalUpdate(updateData);
    $message.success('分类更新成功');
    proTableRef.value?.refresh();
  } catch (error) {
    console.error('分类更新失败:', error);
    $message.error('分类更新失败');
  }
}
</script>
