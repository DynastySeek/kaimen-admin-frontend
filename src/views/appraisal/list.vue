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
            <NButton type="primary" :loading="loading" @click="reload">
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
      <div id="appraisal-table-container">
        <n-data-table
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :scroll-x="1400"
          :row-key="item => item.appraisal_id"
          :checked-row-keys="checkedRowKeys"
          @update:checked-row-keys="handleCheckChange"
        />
      </div>
      <n-flex class="mt-10" justify="end">
        <n-pagination
          :item-count="total"
          :page="page"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :page-slot="6"
          show-size-picker
          :prefix="({ itemCount }) => `共 ${itemCount} 条`"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-flex>
    </n-card>

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
import { usePagination } from 'alova/client';
import { cloneDeep } from 'lodash-es';
import { NButton, NIcon, NSpace, NTag } from 'naive-ui';
import { h, reactive, ref } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, FormBuilder, SelectDictionary, VideoModal } from '@/components';
import { AppraisalStatus, AppraisalStatusLabelMap } from '@/constants';
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
const tableData = ref([]);
const resultLoading = ref(false);

const userStore = useUserStore();

const batchAppraisalModalVisible = ref(false);

const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');

const checkedRowKeys = ref([]);

const defaultSearchForm = {
  appraisalId: '',
  userPhone: '',
  title: '',
  firstClass: null,
  createTimeRange: null,
  updateTimeRange: null,
  lastAppraiserId: null,
};
const searchForm = reactive({ ...defaultSearchForm });

const {
  page,
  pageSize,
  total,
  loading: listLoading,
  refresh,
  reload,
  onSuccess: handleAppraisalListSuccess,
} = usePagination(
  (page, pageSize) => fetchAppraisalList({
    page,
    pageSize,
    ...(activeTab.value || {}),
    createStartTime: searchForm.createTimeRange?.[0] ? formatDateTime(searchForm.createTimeRange?.[0]) : null,
    createEndTime: searchForm.createTimeRange?.[1] ? formatDateTime(searchForm.createTimeRange?.[1]) : null,
    updateStartTime: searchForm.updateTimeRange?.[0] ? formatDateTime(searchForm.updateTimeRange?.[0]) : null,
    updateEndTime: searchForm.updateTimeRange?.[1] ? formatDateTime(searchForm.updateTimeRange?.[1]) : null,
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
    prop: 'firstClass',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  {
    prop: 'userPhone',
    label: '用户手机号',
    type: 'input',
    placeholder: '请输入用户手机号',
    span: 6,
    hidden: !userStore.isAdmin,
  },
  {
    prop: 'title',
    label: '标题',
    type: 'input',
    placeholder: '请输入标题',
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
].filter(item => !item.hidden);

const loading = computed(() => listLoading.value || resultLoading.value);

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
              { size: 4, wrap: false },
              row.videos.map((video, index) =>
                h(
                  NButton,
                  {
                    strong: true,
                    secondary: true,
                    size: 'medium',
                    style: 'width: 110px; height: 68px;',
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

handleAppraisalListSuccess(async ({ data }) => {
  resultLoading.value = true;
  try {
    const { list } = cloneDeep(data.data);
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
  } finally {
    resultLoading.value = false;
  }
});

function handleCheckChange(rowKeys) {
  checkedRowKeys.value = rowKeys;
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
  refresh();
}

function handleBatchAppraisal() {
  batchAppraisalModalVisible.value = true;
}

async function handleBatchAppraisalSubmit() {
  refresh();
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
    refresh();
  } catch (error) {
    console.error('分类更新失败:', error);
    $message.error('分类更新失败');
  }
}
</script>
