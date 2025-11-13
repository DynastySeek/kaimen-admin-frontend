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

    <ProTable
      ref="proTableRef"
      label-width="140px"
      :columns="columns"
      :checked-row-keys="checkedRowKeys"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalList"
      :format-search-params="formatSearchParams"
      :format-response-list="formatResponseList"
      :row-key="item => item.appraisal_id"
      @update:checked-row-keys="keys => checkedRowKeys = keys"
    >
      <template #header>
        <NSpace>
          <NButton
            type="primary"
            @click="batchAppraisalModalVisible = true"
          >
            批量鉴定
          </NButton>
        </NSpace>
      </template>
    </ProTable>

    <!-- 视频播放弹窗 -->
    <VideoModal v-model:show="videoModalVisible" :src="currentVideoSrc" :title="currentVideoTitle" />

    <!-- 批量鉴定弹窗 -->
    <BatchAppraisalDrawer
      v-model:show="batchAppraisalModalVisible"
      :checked-row-keys="checkedRowKeys"
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
import { AppraisalStatus, AppraisalStatusLabelMap, AppraisalBusinessTypeLabelMap } from '@/constants';
import { fetchAppraisalList, fetchAppraisalUpdate } from '@/services';
import { useUserStore } from '@/stores';
import { formatDateTime } from '@/utils';
import AppraisalAction from './components/AppraisalAction.vue';
import BatchAppraisalDrawer from './components/BatchAppraisalDrawer.vue';
import ImagePreview from './components/ImagePreview.vue';

const tabs = [
  { label: '全部', value: null },
  { label: '待鉴定', value: { appraisalStatus: AppraisalStatus.PendingAppraisal } },
  { label: '待用户完善', value: { appraisalStatus: AppraisalStatus.PendingCompletion } },
  { label: '已完成，鉴定为真', value: { appraisalStatus: AppraisalStatus.Completed, appraisalResult: AppraisalStatus.PendingAppraisal } },
  { label: '已完成，鉴定为伪', value: { appraisalStatus: AppraisalStatus.Completed, appraisalResult: AppraisalStatus.InProgress } },
  { label: '已驳回', value: { appraisalStatus: AppraisalStatus.Rejected } },
  { label: '已取消', value: { appraisalStatus: AppraisalStatus.Cancelled } },
];

const activeTab = ref(null);
const userStore = useUserStore();
const proTableRef = ref();

const batchAppraisalModalVisible = ref(false);
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');
const checkedRowKeys = ref([]);

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
    return clonedList;
  } catch (error) {
    console.error('获取鉴定详情失败:', error);
    $message.error('获取鉴定列表数据失败');
    return list;
  }
}

const searchFormItems = computed(() => [
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 6,
  },
  {
    prop: 'appraisalBusinessType',
    label: '鉴定类型',
    type: 'selectDictionary',
    name: 'AppraisalBusinessType',
    placeholder: '请选择鉴定类型',
    span: 6,
  },
  {
    prop: 'firstClass',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  {
    prop: 'userPhone',
    label: '登录授权手机号',
    type: 'input',
    placeholder: '请输入登录授权手机号',
    span: 6,
    hidden: !userStore.isAdmin,
  },
  {
    prop: 'desc',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 6,
  },
  {
    prop: 'createTimeRange',
    label: '创建时间',
    type: 'datetimerange',
    placeholder: '请选择创建时间范围',
    span: 6,
  },
  {
    prop: 'updateTimeRange',
    label: '最后修改时间',
    type: 'datetimerange',
    placeholder: '请选择修改时间范围',
    span: 6,
  },
  {
    prop: 'lastAppraiserId',
    label: '最后提交鉴定师',
    type: 'selectRemote',
    name: 'user',
    placeholder: '请选择鉴定师',
    span: 6,
  },
  {
    prop: 'phone',
    label: '联系方式（手机号）',
    type: 'input',
    placeholder: '请输入手机号',
    span: 6,
    hidden: !userStore.isAdmin,
  },
  {
    prop: 'wechatId',
    label: '联系方式（微信号）',
    type: 'input',
    placeholder: '请输入微信号',
    span: 6,
    hidden: !userStore.isAdmin,
  },
].filter(item => !item.hidden));

const columns = computed(() => [
  {
    type: 'selection',
    fixed: 'left',
  },
  {
    title: '鉴定ID',
    key: 'appraisal_id',
    width: 100,
    fixed: 'left',
  },
  {
    title: '图片',
    key: 'images',
    width: 420,
    render: (row) => {
      return h(ImagePreview, {
        images: row.images,
        width: 110,
        height: 68,
        maxDisplay: 4,
      });
    },
  },
  // {
  //   title: '视频',
  //   key: 'videos',
  //   width: 200,
  //   render: (row) => {
  //     if (row.videos && row.videos.length > 0) {
  //       return h(
  //         'div',
  //         { style: 'max-width: 180px; overflow-x: auto;' },
  //         [
  //           h(
  //             NSpace,
  //             { size: 4, wrap: false },
  //             row.videos.map((video, index) =>
  //               h(
  //                 NButton,
  //                 {
  //                   strong: true,
  //                   secondary: true,
  //                   size: 'medium',
  //                   style: 'width: 110px; height: 68px;',
  //                   onClick: () => handleVideoPlay(row, index),
  //                 },
  //                 {
  //                   icon: () => h(NIcon, null, {
  //                     default: () => h('i', { class: 'i-fe:play-circle' }),
  //                   }),
  //                 },
  //               ),
  //             ),
  //           ),
  //         ],
  //       );
  //     }
  //     return '-';
  //   },
  // },
  {
    title: '类目',
    key: 'first_class',
    width: 100,
    render: (row) => {
      return h(SelectDictionary, {
        'name': 'AppraisalClass',
        'modelValue': row.first_class ? Number(row.first_class) : null,
        'clearable': false,
        'onUpdate:modelValue': value => handleCategoryChange(value, row),
      });
    },
  },
  {
    title: '描述',
    key: 'desc',
    width: 200,
    render: (row) => {
      const text = row.desc ?? row.description ?? '-';
      return h('div', [
        h('div', { style: 'color: #666; font-size: 12px;' }, text),
      ]);
    },
  },
  {
    title: '类型',
    key: 'appraisalBusinessType',
    width: 120,
    render: (row) => AppraisalBusinessTypeLabelMap[row.appraisalBusinessType] || '-',
  },
  {
    title: '联系方式',
    key: 'contact',
    width: 200,
    hidden: !userStore.isAdmin,
    render: (row) => {
      return h('div', null, [
        h('div', null, `手机号：${row.phone || '-'}`),
        h('div', null, `微信号：${row.wechatId || '-'}`),
      ]);
    },
  },
  {
    title: '授权登录手机号',
    key: 'user_phone',
    width: 140,
    hidden: !userStore.isAdmin,
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render: ({ create_time }) => formatDateTime(create_time),
  },
  {
    title: '最后修改时间',
    key: 'update_time',
    width: 160,
    render: ({ update_time }) => formatDateTime(update_time),
  },
  {
    title: '最后提交鉴定师',
    key: 'lastAppraiser',
    width: 140,
    render: ({ last_appraiser }) => last_appraiser?.nickname || '-',
  },
  {
    title: '状态',
    key: 'appraisal_status',
    width: 120,
    render: (row) => {
      const statusConfig = {
        [AppraisalStatus.PendingAppraisal]: { type: 'default' },
        [AppraisalStatus.InProgress]: { type: 'info' },
        [AppraisalStatus.Completed]: { type: 'success' },
        [AppraisalStatus.PendingCompletion]: { type: 'warning' },
        [AppraisalStatus.Rejected]: { type: 'error' },
        [AppraisalStatus.Cancelled]: { type: 'default' },
      };
      return h(NTag, {
        type: statusConfig[row.appraisal_status]?.type || 'default',
      }, {
        default: () => AppraisalStatusLabelMap[row.appraisal_status] || '未知',
      });
    },
  },
  {
    title: '操作/编辑',
    key: 'actions',
    width: 300,
    fixed: 'right',
    hidden: activeTab.value?.appraisalStatus === AppraisalStatus.Cancelled,
    render: (row) => {
      return h(AppraisalAction, {
        data: row,
        onSubmit: handleAppraisalSubmit,
      });
    },
  },
].filter(column => !column.hidden));

function handleTabChange(value) {
  activeTab.value = value;
  proTableRef.value?.reload();
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
