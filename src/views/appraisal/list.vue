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
    <AppCard style="padding-left:20px;height: 60px;line-height: 60px;margin-bottom: 10px;">
      <n-radio-group v-model:value="moneyTab"name="appraisal-status"  @update:value="handleMoneyTabChange">
        <n-radio-button
          v-for="tab in moneyList"
          :key="tab.value"  
          :value="tab.value"
          :label="`${tab.label} ${activeTab?.status==1||activeTab==null?`（待鉴定${tab.length}单）`:''}`"
        />
      </n-radio-group>
    </AppCard>
    <ProTable
      ref="proTableRef"
      label-width="140px"
      :columns="columns"
      :checked-row-keys="checkedRowKeys"
      :checked-row="checkedRows"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalList"
      :format-search-params="formatSearchParams"
      :format-response-list="formatResponseList"
      :row-key="item => item.id"
      @update:checked-row-keys="keys => checkedRowKeys = keys"
      @update:checked-row="rows => checkedRows = rows"
    >
      <template #header>
        <NSpace v-if="!(activeTab==null||activeTab?.status==6)">
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
      :checked-rows="checkedRows"
      @submit="handleBatchAppraisalSubmit"
    />
  </CommonPage>
</template>

<script setup>
import { cloneDeep, omit } from 'lodash-es';
import { NButton, NSpace, NTag } from 'naive-ui';
import { computed, h, ref, onMounted } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, SelectDictionary, VideoModal } from '@/components';
import { AppraisalStatus, AppraisalStatusLabelMap, AppraisalBusinessTypeLabelMap,LevelLabelMap,LevelType } from '@/constants';
import { fetchAppraisalList, fetchAppraisalUpdate,fetchUserInfoById } from '@/services';
import { useUserStore } from '@/stores';
import { formatDateTime } from '@/utils';
import AppraisalAction from './components/AppraisalAction.vue';
import BatchAppraisalDrawer from './components/BatchAppraisalDrawer.vue';
import ImagePreview from './components/ImagePreview.vue';
import { reactive, watch } from 'vue';
import dayjs from 'dayjs';
const tabs = [
  { label: '全部', value: null },
  { label: '待鉴定', value: { status: AppraisalStatus.PendingAppraisal } },
  { label: '待用户完善', value: { status: AppraisalStatus.PendingCompletion } },
  { label: '已完成，鉴定为真', value: { status: AppraisalStatus.Completed, resultList: AppraisalStatus.PendingAppraisal } },
  { label: '已完成，鉴定为伪', value: { status: AppraisalStatus.Completed, resultList: AppraisalStatus.InProgress } },
  { label: '已驳回', value: { status: AppraisalStatus.Rejected } },
  { label: '已取消', value: { status: AppraisalStatus.Cancelled } },
];
const moneyList = reactive([
  { label: '光速鉴定', value: 1, length:0},
  { label: '普通鉴定', value: 0, length:0 },
]);
const payResultList = {
  1:'已支付',
  2:'已退款',
  0:'异常'
}



const activeTab = ref(null);
const userStore = useUserStore();
const moneyTab = ref(1);
const proTableRef = ref();
const batchAppraisalModalVisible = ref(false);
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');
const checkedRowKeys = ref([]);
const checkedRows = ref([]);
// 用户信息缓存
const userInfoCache = ref(new Map());
const fechTotal =async () => {
  try {
   const data1 =  await  fetchAppraisalList({pageSize:1,page:1,light:1, status:1})
   const data2 =  await  fetchAppraisalList({pageSize:1,page:1,light:0, status:1})
   moneyList[0].length = data1.data.totalElements;
   moneyList[1].length = data2.data.totalElements;}
   catch (error) {
    console.error('获取鉴定列表失败:', error);
   }
} 

/**
 * 搜索参数格式化函数
 * @param {object} params - 搜索参数
 * @returns {object} 格式化后的参数
 */

function formatSearchParams(params) {
  return omit({
    ...params,
    // orderByField:'updated_at',
    // order:'asc',
    ...(activeTab.value || {}),
    light:moneyTab.value,
    startCreateDate: params.createTimeRange?.[0] ? formatDateTime(params.createTimeRange?.[0]) : null,
    endCreateDate: params.createTimeRange?.[1] ? formatDateTime(params.createTimeRange?.[1]) : null,
    startUpdateDate: params.updateTimeRange?.[0] ? formatDateTime(params.updateTimeRange?.[0]) : null,
    endUpdateDate: params.updateTimeRange?.[1] ? formatDateTime(params.updateTimeRange?.[1]) : null,
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

// async function userNameById(params) {
  
//   return data?.nickName || data?.name 
// }

const searchFormItems = computed(() => [
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 6,
  },
  {
    prop: 'grade',
    label: '藏品价值等级',
    type: 'selectDictionary',
    name: 'LevelType',
    placeholder: '请选择藏品价值等级',
    span: 6,
    hidden: !(activeTab?.value?.status==3||activeTab.value==null)
  },
  {
    prop: 'businessType',
    label: '鉴定类型',
    type: 'selectDictionary',
    name: 'AppraisalBusinessType',
    placeholder: '请选择鉴定类型',
    span: 6,
  },
  {
    prop: 'mainCategory',
    label: '类目',
    type: 'selectDictionary',
    name: 'AppraisalClass',
    placeholder: '请选择类目',
    span: 6,
  },
  // {
  //   prop: 'phone',
  //   label: '登录授权手机号',
  //   type: 'input',
  //   placeholder: '请输入登录授权手机号',
  //   span: 6,
  //   hidden: !userStore.isAdmin,
  // },
  {
    prop: 'keyword',
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
    disabled(row) {
      return !(row.status==1 || row?.modifyDeadLine)
    }
  },
  {
    title: '鉴定ID',
    key: 'id',
    width: 100,
    fixed: 'left',
  },
  {
    title: '鉴定截止时间',
    key: 'time',
    width: 200,
    hidden:moneyTab.value==0,
    render:(row)=>{
      return h('div',  row.appraisalDeadLine? dayjs(row.appraisalDeadLine).format('YYYY-MM-DD HH:mm:ss'):'-');
    }
  },
  {
    title: '钱款信息',
    key: 'payOrRefund',
    width: 100,
    hidden:moneyTab.value==0,
    render:(row)=>{
      return h('div', payResultList[row.payOrRefund]);
    }
  },
  {
    title: '图片',
    key: 'images',
    width: 420,
    render: (row) => {
      return h(ImagePreview, {
        images: row.pictures.map(item=>item.url),
        width: 110,
        height: 68,
        maxDisplay: 4,
      });
    },
  },
  {
    title: '藏品价值等级',
    key: 'grade',
    width: 200,
    render: (row) => {
      return h('div', LevelLabelMap[row.grade]);
    },
    hidden: !(activeTab?.value?.status==3||activeTab.value==null)
  },
  {
    title: '类目',
    key: 'mainCategory',
    width: 100,
    render: (row) => {
      return h(SelectDictionary, {
        'name': 'AppraisalClass',
        'modelValue': row.mainCategory ? Number(row.mainCategory) : null,
        'clearable': false,
        'onUpdate:modelValue': value => handleCategoryChange(value, row),
      });
    },
  },
  {
    title: '描述',
    key: 'description',
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
    key: 'businessType',
    width: 120,
    render: (row) => AppraisalBusinessTypeLabelMap[row.businessType] || '-',
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
    key: 'userPhone',
    width: 140,
    hidden: !userStore.isAdmin,
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 160,
    render: ({ createdAt }) =>createdAt ? formatDateTime(createdAt):'-',
    sorter: (row1, row2) => {
    const t1 = row1.createdAt ? new Date(row1.createdAt).getTime() : 0
    const t2 = row2.createdAt ? new Date(row2.createdAt).getTime() : 0
    return t1 - t2
  },
  defaultSortOrder: 'ascend',
  customNextSortOrder: (order) => {
    if (order === 'ascend') return 'descend'
    return 'ascend'
  }
  },
  {
    title: '最后修改时间',
    key: 'updatedAt',
    width: 160,
    render: ({ updatedAt }) => updatedAt ? formatDateTime(updatedAt) : '-',
    sorter: (row1, row2) => {
    const t1 = row1.updatedAt ? new Date(row1.updatedAt).getTime() : 0
    const t2 = row2.updatedAt ? new Date(row2.updatedAt).getTime() : 0
    return t1 - t2
  },
  defaultSortOrder: 'ascend',
  customNextSortOrder: (order) => {
    if (order === 'ascend') return 'descend'
    return 'ascend'
  }
  },
  {
    title: '最后提交鉴定师',
    key: 'lastSubmitUser',
    width: 140,
    render: (row) => {
      const userid = row?.results?.[0]?.appraiserId;
      
      if (!userid) {
        return h('span', '-');
      }
      // 如果缓存中有，直接返回
      if (userInfoCache.value.has(userid)) {
        const userName = userInfoCache.value.get(userid);
        return h('span', userName || '-');
      }
      // 如果缓存中没有，发起请求并更新缓存
      fetchUserInfoById(userid).then(({ data }) => {
        const userName = data?.nickName || data?.name || '-';
        userInfoCache.value.set(userid, userName);
        // 触发表格重新渲染
        // proTableRef.value?.refresh();
      }).catch(() => {
        userInfoCache.value.set(userid, '-');
        // proTableRef.value?.refresh();
      });
      
      // 返回加载中的占位符
      return h('span', '加载中...');
    }
  },
  {
    title: '状态',
    key: 'status',
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
    hidden: activeTab.value?.appraisalStatus === AppraisalStatus.Cancelled,
    render: (row) => {
      // if(!row.modifyDeadLine){
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
function handleMoneyTabChange(value) {
  moneyTab.value = value;
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
      appraisalId: row.id,
      mainCategory:value,
      status: row.status,
    }];

    await fetchAppraisalUpdate({items:updateData});
    $message.success('分类更新成功');
    proTableRef.value?.refresh();
  } catch (error) {
    console.error('分类更新失败:', error);
    $message.error('分类更新失败');
  }
}
onMounted(() => {
  // 延迟执行，避免与 ProTable 的初始化请求冲突
  // 使用 setTimeout 确保在 ProTable 的初始化请求完成后再执行

    if (activeTab.value?.status === 1 || activeTab.value === null) {
      fechTotal();
    }
 
});
</script>
