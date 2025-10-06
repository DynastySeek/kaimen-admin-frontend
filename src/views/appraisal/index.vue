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

    <!-- 搜索表单 -->
    <n-card v-if="searchFormItems && searchFormItems.length > 0" class="mt-10">
      <FormBuilder
        v-model="searchForm"
        :form-items="searchFormItems"
        label-width="120px"
        :actions-span="6"
        :gutter="20"
      >
        <template #actions>
          <NSpace class="w-full" justify="end">
            <NButton type="primary" @click="reload">
              搜索
            </NButton>
            <NButton @click="handleReset">
              重置
            </NButton>
          </NSpace>
        </template>
      </FormBuilder>
    </n-card>

    <!-- 数据表格 -->
    <n-card class="mt-10">
      <NSpace class="mb-10">
        <NButton type="primary" @click="handleBatchAppraisal">
          批量鉴定
        </NButton>
      </NSpace>
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="{
          total,
          page,
          pageSize,
          showSizeChanger: true,
          pageSizes: [10, 20, 50, 100],
        }"
        :scroll-x="1400"
        :row-key="item => item.appraisal_id"
        @update:checked-row-keys="handleCheckChange"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </n-card>

    <!-- 视频播放弹窗 -->
    <VideoModal
      v-model:show="videoModalVisible"
      :src="currentVideoSrc"
      :title="currentVideoTitle"
    />

    <!-- 批量鉴定弹窗 -->
    <BatchAppraisalModal
      v-model:show="batchAppraisalModalVisible"
      :checked-row-keys="checkedRowKeysRef"
      @submit="handleBatchAppraisalSubmit"
    />
  </CommonPage>
</template>

<script setup>
import { usePagination } from 'alova/client';
import { cloneDeep } from 'lodash-es';
import { NButton, NIcon, NSpace, NTag } from 'naive-ui';
import { h, reactive, ref } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, FormBuilder, SelectDictionary, VideoModal } from '@/components';
import { AppraisalStatus, AppraisalStatusLabelMap } from '@/constants';
import { fetchAppraisalDetail, fetchAppraisalList, fetchAppraisalUpdate } from '@/services';

import { formatDateTime } from '@/utils';
import AppraisalAction from './components/AppraisalAction.vue';
import BatchAppraisalModal from './components/BatchAppraisalModal.vue';
import ImagePreview from './components/ImagePreview.vue';

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待鉴定', value: AppraisalStatus.PendingAppraisal },
  { label: '鉴定中', value: AppraisalStatus.InProgress },
  { label: '已完结', value: AppraisalStatus.Completed },
  { label: '待完善', value: AppraisalStatus.PendingCompletion },
  { label: '已退回', value: AppraisalStatus.Rejected },
  { label: '已取消', value: AppraisalStatus.Cancelled },
];

const activeTab = ref('all');
const tableData = ref([]);

const batchAppraisalModalVisible = ref(false);

const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');

const checkedRowKeysRef = ref([]);

const defaultSearchForm = {
  appraisalId: '',
  phone: '',
  title: '',
  firstClass: null,
  createTimeRange: null,
  updateTimeRange: null,
  lastAppraiser: '',
};
const searchForm = reactive({ ...defaultSearchForm });

const {
  loading,
  page,
  pageSize,
  total,
  refresh,
  reload,
  onSuccess: handleAppraisalListSuccess,
} = usePagination(
  (page, pageSize) => fetchAppraisalList({
    page,
    pageSize,
    appraisalStatus: activeTab.value === 'all' ? null : activeTab.value,
    ...searchForm,
  }),
  {
    total: response => response.data.total,
    data: response => response.data.list,
    initialData: {
      total: 0,
      data: [],
    },
    initialPage: 1,
    initialPageSize: 10,
    immediate: true,
  },
);

const searchFormItems = [
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 6,
  },
  {
    prop: 'phone',
    label: '用户手机号',
    type: 'input',
    placeholder: '请输入用户手机号',
    span: 6,
  },
  {
    prop: 'title',
    label: '标题',
    type: 'input',
    placeholder: '请输入标题',
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
    prop: 'appraiserId',
    label: '最后提交鉴定师',
    type: 'input',
    placeholder: '请输入鉴定师姓名',
    span: 6,
  },
];

const columns = [
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
    width: 320,
    render: (row) => {
      return h(ImagePreview, {
        images: row.images,
        imageSize: 80,
        maxDisplay: 3,
      });
    },
  },
  {
    title: '视频',
    key: 'videos',
    width: 200,
    render: (row) => {
      if (row.videos && row.videos.length > 0) {
        return h(
          'div',
          { style: 'max-width: 180px; overflow-x: auto;' },
          [
            h(
              NSpace,
              { size: 4 },
              row.videos.map((video, index) =>
                h(
                  NButton,
                  {
                    strong: true,
                    secondary: true,
                    size: 'medium',
                    onClick: () => handleVideoPlay(row, index),
                  },
                  {
                    icon: () => h(NIcon, null, {
                      default: () => h('i', { class: 'i-fe:play-circle' }),
                    }),
                  },
                ),
              ),
            ),
          ],
        );
      }
      return '-';
    },
  },
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
    title: '标题和描述',
    key: 'title',
    width: 200,
    render: (row) => {
      return h('div', [
        h('div', { style: 'font-weight: bold; margin-bottom: 4px;' }, row.title),
        h('div', { style: 'color: #666; font-size: 12px;' }, row.description),
      ]);
    },
  },
  {
    title: '用户手机号',
    key: 'user_phone',
    width: 120,
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
    render: (row) => {
      return h(AppraisalAction, {
        data: row,
        onSubmit: handleAppraisalSubmit,
      });
    },
  },
];

handleAppraisalListSuccess(async ({ data }) => {
  try {
    const { list } = cloneDeep(data.data);
    const ids = list.map(item => item.appraisal_id);
    const { data: detailList } = await fetchAppraisalDetail({ ids });
    list.forEach((item) => {
      const detail = detailList.find(d => d.order_id === item.appraisal_id);
      if (detail) {
        item.user_phone = detail.user_phone || '-';
        item.latest_appraisal = detail.latest_appraisal;
      }
    });
    const allCloudImages = list.reduce((acc, d) => acc.concat(d.images || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudVideos = list.reduce((acc, d) => acc.concat(d.videos || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudUrl = [...allCloudImages, ...allCloudVideos];
    if (allCloudUrl.length > 0) {
      const tempFileUrls = await getTempFileUrls(allCloudUrl);
      list.forEach((item) => {
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
    tableData.value = list;
  } catch (error) {
    console.error('获取鉴定详情失败:', error);
    $message.error('获取鉴定列表数据失败');
  }
});

function handleCheckChange(rowKeys) {
  checkedRowKeysRef.value = rowKeys;
}

function handleTabChange(value) {
  activeTab.value = value;
  reload();
}

function handleReset() {
  Object.assign(searchForm, defaultSearchForm);
  reload();
}

function handlePageChange(newPage) {
  page.value = newPage;
}

function handlePageSizeChange(newPageSize) {
  pageSize.value = newPageSize;
  page.value = 1;
}

function handleAppraisalSubmit(_data) {
  $message.success('鉴定操作提交成功');
  refresh();
}

function handleBatchAppraisal() {
  if (checkedRowKeysRef.value.length === 0) {
    $message.warning('请先选择要鉴定的数据');
    return;
  }
  batchAppraisalModalVisible.value = true;
}

async function handleBatchAppraisalSubmit(data) {
  console.log('批量鉴定提交数据:', data);
  $message.success(`已对 ${data.ids.length} 条数据进行批量鉴定`);
  refresh();
  checkedRowKeysRef.value = [];
}

function handleVideoPlay(row, videoIndex = 0) {
  if (row.videos && row.videos.length > 0) {
    currentVideoSrc.value = row.videos[videoIndex] || 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4';
    currentVideoTitle.value = `${row.title} - 视频${videoIndex + 1}`;
    videoModalVisible.value = true;
  }
}

async function handleCategoryChange(value, row) {
  try {
    const updateData = [{
      id: row.appraisal_id,
      appraisal_class: value,
    }];

    await fetchAppraisalUpdate(updateData);
    $message.success('分类更新成功');
    refresh();
  } catch (error) {
    console.error('分类更新失败:', error);
    $message.error('分类更新失败');
  }
}
</script>
