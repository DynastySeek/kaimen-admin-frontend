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
            <NButton type="primary" @click="handleSearch">
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
      <n-data-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll-x="1400"
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
  </CommonPage>
</template>

<script setup>
import { NButton, NIcon, NSpace, NTag } from 'naive-ui';
import { computed, h, onMounted, reactive, ref } from 'vue';
import { CommonPage, FormBuilder, SelectDictionary } from '@/components';
import VideoModal from '@/components/VideoModal.vue';
import { AppraisalStatus, AppraisalStatusLabelMap } from '@/constants';
import AppraisalAction from './components/AppraisalAction.vue';
import ImagePreview from './components/ImagePreview.vue';

// Tab 选项配置
const tabs = [
  { label: '全部', value: 'all' },
  { label: '待用户完善', value: AppraisalStatus.PendingCompletion },
  { label: '已完成鉴定为真', value: AppraisalStatus.AuthenticCompleted },
  { label: '已完成鉴定为伪', value: AppraisalStatus.FakeCompleted },
  { label: '已驳回', value: AppraisalStatus.Rejected },
  { label: '已取消', value: AppraisalStatus.Cancelled },
];

const activeTab = ref('all');
const loading = ref(false);

// 视频弹窗相关状态
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');

// 搜索表单配置
const searchForm = reactive({
  appraisalId: '',
  userPhone: '',
  title: '',
  categoryId: null,
  createTimeRange: null,
  updateTimeRange: null,
  lastAppraiser: '',
});

const searchFormItems = [
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 6,
  },
  {
    prop: 'userPhone',
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
    prop: 'appraisalClass',
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
    prop: 'lastAppraiser',
    label: '最后提交鉴定师',
    type: 'input',
    placeholder: '请输入鉴定师姓名',
    span: 6,
  },
];

// 表格列配置
const columns = [
  {
    title: '鉴定ID',
    key: 'id',
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
    key: 'categoryName',
    width: 100,
    render: (row) => {
      return h(SelectDictionary, {
        'name': 'AppraisalClass',
        'modelValue': row.categoryName,
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
    key: 'userPhone',
    width: 120,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 160,
  },
  {
    title: '最后修改时间',
    key: 'updateTime',
    width: 160,
  },
  {
    title: '最后提交鉴定师',
    key: 'lastAppraiser',
    width: 140,
  },
  {
    title: '状态',
    key: 'status',
    width: 120,
    render: (row) => {
      const statusConfig = {
        [AppraisalStatus.PendingCompletion]: { type: 'warning' },
        [AppraisalStatus.AuthenticCompleted]: { type: 'success' },
        [AppraisalStatus.FakeCompleted]: { type: 'error' },
        [AppraisalStatus.Rejected]: { type: 'error' },
        [AppraisalStatus.Cancelled]: { type: 'default' },
      };
      return h(NTag, {
        type: statusConfig[row.status]?.type || 'default',
      }, {
        default: () => AppraisalStatusLabelMap[row.status] || '未知',
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

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
});

// 表格数据
const tableData = ref([]);

// 演示数据
const mockData = [
  {
    id: 'AP001',
    images: [
      'cloud://cloudbase-3g9zthei11410463.636c-cloudbase-3g9zthei11410463-1360990667/images/20250606_214423_707.png',
      'cloud://cloudbase-3g9zthei11410463.636c-cloudbase-3g9zthei11410463-1360990667/images/20250606_214416_752.png',
    ],
    videos: ['https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4'],
    categoryId: 1,
    categoryName: '珠宝首饰',
    title: '翡翠手镯鉴定',
    description: '这是一只传家宝翡翠手镯，需要专业鉴定真伪',
    userPhone: '138****1234',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-16 14:20:00',
    lastAppraiser: '张鉴定师',
    status: AppraisalStatus.PendingCompletion,
  },
  {
    id: 'AP002',
    images: [
      'https://picsum.photos/200/200?random=2',
      'https://picsum.photos/200/200?random=3',
      'https://picsum.photos/200/200?random=21',
      'https://picsum.photos/200/200?random=22',
    ],
    videos: [],
    categoryId: 2,
    categoryName: '古董文玩',
    title: '明代青花瓷鉴定',
    description: '家传明代青花瓷器，希望确认年代和价值',
    userPhone: '139****5678',
    createTime: '2024-01-14 09:15:00',
    updateTime: '2024-01-17 16:45:00',
    lastAppraiser: '李鉴定师',
    status: AppraisalStatus.DoubtCompleted,
  },
  {
    id: 'AP003',
    images: [
      'https://picsum.photos/200/200?random=4',
      'https://picsum.photos/200/200?random=31',
      'https://picsum.photos/200/200?random=32',
      'https://picsum.photos/200/200?random=33',
      'https://picsum.photos/200/200?random=34',
      'https://picsum.photos/200/200?random=35',
      'https://picsum.photos/200/200?random=36',
    ],
    videos: [
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
    ],
    categoryId: 3,
    categoryName: '艺术品',
    title: '油画作品鉴定',
    description: '疑似名家油画作品，需要专业鉴定',
    userPhone: '136****9012',
    createTime: '2024-01-13 15:20:00',
    updateTime: '2024-01-18 11:30:00',
    lastAppraiser: '王鉴定师',
    status: AppraisalStatus.FakeCompleted,
  },
  {
    id: 'AP004',
    images: [],
    videos: [],
    categoryId: 4,
    categoryName: '奢侈品',
    title: '名牌包包鉴定',
    description: '购买的二手名牌包包，需要验证真伪',
    userPhone: '137****3456',
    createTime: '2024-01-12 13:45:00',
    updateTime: '2024-01-19 09:15:00',
    lastAppraiser: '赵鉴定师',
    status: AppraisalStatus.Rejected,
  },
  {
    id: 'AP005',
    images: [
      'https://picsum.photos/200/200?random=5',
      'https://picsum.photos/200/200?random=51',
    ],
    videos: [
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
    ],
    categoryId: 1,
    categoryName: '珠宝首饰',
    title: '钻石戒指鉴定',
    description: '求婚钻戒，需要确认钻石等级和真伪',
    userPhone: '135****7890',
    createTime: '2024-01-11 16:00:00',
    updateTime: '2024-01-20 14:30:00',
    lastAppraiser: '陈鉴定师',
    status: AppraisalStatus.Cancelled,
  },
  {
    id: 'AP006',
    images: [
      'https://picsum.photos/200/200?random=6',
      'https://picsum.photos/200/200?random=61',
      'https://picsum.photos/200/200?random=62',
    ],
    videos: [
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
      'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4',
    ],
    categoryId: 2,
    categoryName: '古董文玩',
    title: '古代字画鉴定',
    description: '收藏的古代字画，需要确认真伪和价值',
    userPhone: '134****2468',
    createTime: '2024-01-10 11:20:00',
    updateTime: '2024-01-21 15:40:00',
    lastAppraiser: '孙鉴定师',
    status: AppraisalStatus.PendingCompletion,
  },
];

/**
 * 根据当前 Tab 过滤数据
 */
const filteredData = computed(() => {
  if (activeTab.value === 'all') {
    return mockData;
  }
  return mockData.filter(item => item.status === activeTab.value);
});

/**
 * Tab 切换处理
 */
function handleTabChange(value) {
  activeTab.value = value;
  loadData();
}

/**
 * 搜索处理
 */
function handleSearch() {
  // 搜索条件处理逻辑
  loadData();
}

/**
 * 重置搜索表单
 */
function handleReset() {
  Object.keys(searchForm).forEach((key) => {
    if (Array.isArray(searchForm[key])) {
      searchForm[key] = null;
    } else {
      searchForm[key] = '';
    }
  });
  loadData();
}

/**
 * 分页处理
 */
function handlePageChange(page) {
  pagination.page = page;
  loadData();
}

function handlePageSizeChange(pageSize) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  loadData();
}

/**
 * 编辑处理
 */
function handleAppraisalSubmit(_data) {
  $message.success('鉴定操作提交成功');
  // TODO: 刷新列表数据
}

/**
 * 编辑鉴定单处理（保留原有功能）
 */
function _handleEdit(row) {
  // 编辑鉴定单逻辑
  $message.info(`编辑鉴定单: ${row.id}`);
}

/**
 * 视频播放处理
 */
function handleVideoPlay(row, videoIndex = 0) {
  if (row.videos && row.videos.length > 0) {
    // 使用指定索引的视频 URL，如果没有则使用测试视频
    currentVideoSrc.value = row.videos[videoIndex] || 'https://cdn.jsdelivr.net/gh/xdlumia/files/video-play/IronMan.mp4';
    currentVideoTitle.value = `${row.title} - 视频${videoIndex + 1}`;
    videoModalVisible.value = true;
  }
}

/**
 * 加载数据
 */
function loadData() {
  loading.value = true;

  // 模拟异步加载
  setTimeout(() => {
    const data = filteredData.value;
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;

    tableData.value = data.slice(start, end);
    pagination.itemCount = data.length;
    loading.value = false;
  }, 500);
}

/**
 * 处理类目选择变更事件
 * @param {string} _value - 选中的类目值
 * @param {object} _row - 当前行数据
 */
function handleCategoryChange(_value, _row) {
  // TODO: 实现类目变更逻辑
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.card-container {
  margin-bottom: 16px;
}
</style>
