<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      label-width="100px"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalConsignmentList"
      :columns="columns"
      :format-search-params="formatSearchParams"
      :format-response-list="handleConsignmentListSuccess"
    />

    <!-- 视频播放弹窗 -->
    <VideoModal v-model:show="videoModalVisible" :src="currentVideoSrc" :title="currentVideoTitle" />
  </CommonPage>
</template>

<script setup>
import { computed, ref } from 'vue';
import { NButton, NIcon, NSpace } from 'naive-ui';
import { h } from 'vue';
import { cloneDeep } from 'lodash-es';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, VideoModal } from '@/components';
import { AppraisalClassLabelMap, PriceRangeValueMap } from '@/constants';
import { fetchAppraisalConsignmentList } from '@/services';
import { useUserStore } from '@/stores';
import { formatDateTime } from '@/utils';
import { omit } from 'lodash-es';
import ImagePreview from './components/ImagePreview.vue';

const proTableRef = ref();
const userStore = useUserStore();

// 视频播放相关状态
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');

// 表格列定义
const columns = computed(() => [
  { title: 'ID', key: 'id', width: 80 },

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
  { title: '宝贝类型', key: 'type', width: 100, render: row => AppraisalClassLabelMap[row.type] || '-' },
  { title: '描述', key: 'desc', width: 200, ellipsis: { tooltip: true } },
  ...(userStore.isAdmin
    ? [{ title: '手机号', key: 'phone', width: 120 }]
    : []),
  { title: '心理价位', key: 'expected_price', width: 120 },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render: row => formatDateTime(row.created_at),
  },
  {
    title: '更新时间',
    key: 'updated_at',
    width: 180,
    render: row => formatDateTime(row.updated_at),
  },
]);

// 搜索表单项配置
const searchFormItems = [
  {
    prop: 'id',
    label: '求购ID',
    type: 'input',
    placeholder: '请输入求购ID',
    span: 6,
  },
  {
    prop: 'type',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  {
    prop: 'desc',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 6,
  },
  {
    prop: 'expectedPrice',
    label: '心理价位',
    type: 'selectDictionary',
    name: 'PriceRange',
    placeholder: '请选择价格区间',
    span: 6,
  },
  ...(userStore.isAdmin
    ? [{
        prop: 'userPhone',
        label: '授权手机号',
        type: 'input',
        placeholder: '请输入授权手机号',
        span: 6,
      }]
    : []),
  ...(userStore.isAdmin
    ? [{
        prop: 'phone',
        label: '联系方式',
        type: 'input',
        placeholder: '请输入联系方式',
        span: 6,
      }]
    : []),
  {
    prop: 'createTimeRange',
    label: '创建时间',
    type: 'datetimerange',
    placeholder: '请选择创建时间范围',
    span: 6,
  },
];

// 搜索参数格式化函数
function formatSearchParams(params) {
  const [minExpectedPrice, maxExpectedPrice] = PriceRangeValueMap[params.expectedPrice] || [null, null];
  return omit({
    ...params,
    minExpectedPrice,
    maxExpectedPrice,
    userPhone: params.userPhone,
    createStartTime: params.createTimeRange?.[0] ? formatDateTime(params.createTimeRange?.[0]) : null,
    createEndTime: params.createTimeRange?.[1] ? formatDateTime(params.createTimeRange?.[1]) : null,
  }, ['expectedPrice', 'createTimeRange']);
}

/**
 * 处理视频播放
 * @param {Object} row - 行数据
 * @param {number} videoIndex - 视频索引，默认为0
 */
function handleVideoPlay(row, videoIndex = 0) {
  if (row.videos && row.videos.length > 0) {
    currentVideoSrc.value = row.videos[videoIndex];
    currentVideoTitle.value = `${row.desc || '视频'} - 视频${videoIndex + 1}`;
    videoModalVisible.value = true;
  }
}

/**
 * 处理委托列表数据成功回调，转换云存储文件URL
 * @param {Object} response - 响应数据
 */
async function handleConsignmentListSuccess(list) {
  if (!list) {
    return [];
  }
  try {
    const cloneList = cloneDeep(list);
    const allCloudImages = cloneList.reduce((acc, d) => acc.concat(d.images || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudVideos = cloneList.reduce((acc, d) => acc.concat(d.videos || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudUrl = [...allCloudImages, ...allCloudVideos];

    if (allCloudUrl.length > 0) {
      const tempFileUrls = await getTempFileUrls(allCloudUrl);
      cloneList.forEach((item) => {
        if (item.images) {
          item.images = item.images.map((img) => {
            const tempFile = tempFileUrls.find(file => file.fileID === img);
            return tempFile ? tempFile.tempFileURL : img;
          });
        }
        if (item.videos) {
          item.videos = item.videos.map((vid) => {
            const tempFile = tempFileUrls.find(file => file.fileID === vid);
            return tempFile ? tempFile.tempFileURL : vid;
          });
        }
      });
    }
    return cloneList
  } catch (error) {
    console.error('处理委托列表数据失败:', error);
    return [];
  }
}
</script>
