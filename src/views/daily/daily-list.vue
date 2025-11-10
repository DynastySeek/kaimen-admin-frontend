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
      :fetch-data="fetchAppraisalFineList"
      :format-search-params="formatSearchParams"
      :format-response-list="formatResponseList"
      @update:total-data="handleTotalDataChange"
      :row-key="item => item.appraisal_id"
      @update:checked-row-keys="handleCheckedRowKeysChange"
    >
      <template #header>
        <NSpace>
          <NButton
            v-if="totalData>0"
            type="primary"
            @click="handleBatchUpdate"
          >{{ 
           batchAppraisalModalTitle
          }}
          </NButton>
    
          <NButton
          >
          {{ totalData>0?"已评选":"未评选"  }}
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
import { cloneDeep, omit, filter } from 'lodash-es';
import { NButton, NIcon, NSpace, NTag } from 'naive-ui';
import { computed, ref, watch } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, VideoModal } from '@/components';;
import { fetchAppraisalFineList, fetchAppraisalUpdate } from '@/services';
import BatchUpdateDrawer from './BatchUpdateDrawer.vue';
import ImagePreview from './ImagePreview.vue';
import dayjs from 'dayjs';
const proTableRef = ref();
const batchAppraisalModalTitle = ref('修改');
const batchAppraisalModalVisible = ref(false);
const videoModalVisible = ref(false);
const currentVideoSrc = ref('');
const currentVideoTitle = ref('');
const isEditing = ref(false);
const checkedRowKeys = ref([]);
const tableData = ref([]); // 存储表格数据
const originData = ref([]);
const totalData = ref(0);
const checkedRows = ref([]);
// 默认值常量
const DEFAULT_DATE = dayjs().format('YYYY-MM-DD');

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
    // fineClass: activeTab.value,
    createStartTime: startOfRange ? startOfRange.format('YYYY-MM-DD HH:mm:ss') : null,
    createEndTime: endOfRange ? endOfRange.format('YYYY-MM-DD HH:mm:ss') : null,
    appraisalResult:1,
  }, ['selectedDate']);
}

/**
 * 响应数据格式化函数
 * @param {Array} list - 原始数据列表
 * @returns {Array} 格式化后的数据列表
//  */
async function formatResponseList(list) {
  if(isEditing.value){
    return list;
  }
  checkedRowKeys.value = []
  try {
    const clonedList = cloneDeep(list);
    const allCloudImages = clonedList?.reduce((acc, d) => acc.concat(d.images || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudVideos = clonedList?.reduce((acc, d) => acc.concat(d.videos || []), []).filter(v => v.startsWith('cloud://'));
    const allCloudUrl = [...allCloudImages, ...allCloudVideos];
    if (allCloudUrl.length > 0) {
      const tempFileUrls = await getTempFileUrls(allCloudUrl);
      // console.log('1111', tempFileUrls)
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
    const temp =  list.filter(item=>{
      if(item.fine_class === 1){
        return {
          ...item,
        }
      }
    })
    originData.value = temp;
    // 保存表格数据供后续使用
    tableData.value =  clonedList;
    return  totalData.value>0&&!isEditing.value?  originData.value :  clonedList;
  } catch (error) {
    return list;
  }
}

const searchFormItems = computed(() => [
  {
    prop: 'selectedDate',
    label: '评选日期',
    type: 'date',
    placeholder: '请选择评选日期',
    span: 10,
    width:500,
    value: DEFAULT_DATE, // 设置默认值为今天
  },
  {
  prop: 'firstClass',
  label: '类目',
  type: 'select',
  placeholder: '请选择类目',
  span: 8,
  props: {
    options: [
      { label: '银元', value: '1' },
      { label: '古钱', value: '2' },
      { label: '杂项', value: '4' },
      { label: '趣物', value: '5' },
    ],
  },
  value:'1',
  width: 500,

},
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    span: 10,
    width: 500,
  },
  {
    prop: 'desc',
    label: '描述',
    type: 'input',
    placeholder: '请输入描述',
    span: 8,
    width: 500,
  },
 
].filter(item => !item.hidden));

// 计算选中的完整行数据
const columns = computed(() => [
  {
    type: 'selection',
    fixed: 'left',
    hidden:! (batchAppraisalModalVisible.value || totalData.value<=0)
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

watch(batchAppraisalModalVisible, (visible) => {
  if (!visible) {
    checkedRowKeys.value = [];
    isEditing.value = false;
    batchAppraisalModalTitle.value = '修改';
  }
});
/**
 * 
 * 处理选中行变化，限制最多选5个
 */
watch([checkedRowKeys, tableData], () => {
  checkedRows.value = tableData.value.filter(row => checkedRowKeys.value.includes(row.appraisal_id));
});
function handleTotalDataChange(payload) {
  totalData.value = payload?.done ?? 0;
}
function handleCheckedRowKeysChange(keys) {
  batchAppraisalModalVisible.value = !batchAppraisalModalVisible.value || keys.length>0
  if (keys.length > 5) {
    $message.warning('最多只能选择5个项目');
    return;
  }
  checkedRowKeys.value = keys;
}
function handleBatchUpdate() {
  proTableRef.value?.reload(); 
  checkedRowKeys.value = tableData.value.map(item => {
    if(item.fine_class === 1){
      return item.appraisal_id
    }})
    isEditing.value = !isEditing.value;
    batchAppraisalModalTitle.value = isEditing.value ? '取消修改' : '修改';
    batchAppraisalModalVisible.value = isEditing.value;
    batchAppraisalModalVisible.value = batchAppraisalModalTitle.value ==='取消修改'?true:false
    formatResponseList(tableData.value)
    
}

async function handleBatchAppraisalSubmit(submitData) {
  const data = new Set([
  ...submitData.filter(item => item != null),  // 过滤 null 和 undefined
  ...checkedRowKeys.value.filter(item => item != null)  // 过滤 null 和 undefined
]);
  try {
    const updateData =Array.from(data) ?.map(item => {
      console.log('1111',item)
      if(item) {
     
        return {
        id: item,
        fine_class: 1
        }
      }
    });
   await fetchAppraisalUpdate(updateData);
    // TODO: 调用实际批量更新接口
    $message.success('更新成功');
    proTableRef.value?.refresh();
    checkedRowKeys.value = [];
  } catch (error) {
    console.error('更新失败:', error);
  }
}

</script>
