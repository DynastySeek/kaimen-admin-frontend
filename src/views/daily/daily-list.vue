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
      class="table"
      ref="proTableRef"
      label-width="120px"
      :columns="columns"
      :checked-row-keys="checkedRowKeys"
      :search-form-items="searchFormItems"
      :fetch-data="fetchAppraisalFineList"
      :format-search-params="formatSearchParams"
      :format-response-list="formatResponseList"
      @update:total-data="handleTotalDataChange"
      :row-key="item => item.id"
      @update:checked-row-keys="handleCheckedRowKeysChange"
      :virtual-scroll="true"
      :max-height="650"
      @handle-reset="handleReset"
      @update:checked-row="handleCheckedRowsChange"
    >
      <template #header>
        <NSpace>
          <!-- <NButton
            v-if="totalData>0"
            type="primary"
            @click="handleBatchUpdate"
          >{{ 
           batchAppraisalModalTitle
          }}
          </NButton> -->
    
          <span
          class="text-[#316C72] cursor-pointer"
          style="height: 34px;line-height: 34px;"
          >
          {{ totalData>0?"已评选":"未评选"  }}
          </span>
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
      @update:checked-row="row => checkedRows = row"
      @submit="handleBatchAppraisalSubmit"
    />
  </CommonPage>
</template>

<script setup>
import { cloneDeep, omit, filter } from 'lodash-es';
import { NButton, NIcon, NSpace, NTag } from 'naive-ui';
import { computed, ref, watch, nextTick } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, VideoModal } from '@/components';;
import { fetchAppraisalFineList, fetchAppraisalUpdate } from '@/services';
import BatchUpdateDrawer from './BatchUpdateDrawer.vue';
import ImagePreview from './ImagePreview.vue';
import dayjs from 'dayjs';
import { LevelLabelMap } from '@/constants';
import { onMounted } from 'vue';
const proTableRef = ref();
const batchAppraisalModalTitle = ref('重新评选');
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
    startCreateDate: startOfRange ? startOfRange.format('YYYY-MM-DD HH:mm:ss') : null,
    endCreateDate: endOfRange ? endOfRange.format('YYYY-MM-DD HH:mm:ss') : null,
    resultList:1,
    pageSize:10000,
  }, ['selectedDate',]);
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
 
  // checkedRowKeys.value = []
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
    const temp =  list.filter(item=>{
      if(item.tags === 1){
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
    span: 6,
    width:300,
    value: DEFAULT_DATE, // 设置默认值为今天
  },
  {
  prop: 'mainCategory',
  label: '类目',
  type: 'select',
  placeholder: '请选择类目',
  span: 6,
  width:300,
  props: {
    options: [
      { label: '银元', value: '1' },
      { label: '古钱', value: '2' },
      { label: '杂项', value: '4' },
      { label: '趣物', value: '6' },
    ],
  },
  value:'1',
},
  {
    prop: 'appraisalId',
    label: '鉴定ID',
    type: 'input',
    placeholder: '请输入鉴定ID',
    width:300,
    span: 6,
  },
  {
    prop: 'keyword',
    label: '描述',
    type: 'input',
    span: 6,
    width:300,
    placeholder: '请输入描述',
  },
  {
    prop: 'grade',
    label: '藏品价值等级',
    type: 'selectDictionary',
    name: 'LevelType',
    placeholder: '请选择藏品价值等级',
    width:300,
    span: 6,
  },
].filter(item => !item.hidden));

// 计算选中的完整行数据
const columns = computed(() => [
  {
    type: 'selection',
    fixed: 'left',
    hidden:! (isEditing.value || totalData.value<=0)
  },
  {
    title: '鉴定ID',
    key: 'id',
    width: 200,
  },
  {
    title: '图片',
    key: 'images',
    width: 300,
    render: (row) => {
      return h(ImagePreview, {
        images: row?.pictures?.map(item=>item.url) || [],
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
  },
  {
    title: '描述',
    width: 200,
    key: 'description',
  },
  {
    title: '奖励',
    key: 'fineTips',

    render: (row) => {
      return row?.otherAttributes?.fine_tips??'-';
    },
  },
 
].filter(column => !column.hidden));

/**
 * 
 * 处理选中行变化，限制最多选5个
 */
watch([checkedRows], () => {
  // if(checkedRowKeys.value.length > 0){
  checkedRowKeys.value = checkedRows.value.map(item => item.id);
});

function handleCheckedRowsChange(rows, meta) {
  const { row } = meta
  if (meta.action === 'check') {
    if (!checkedRows.value.some(item => item.id === row.id)) {
    checkedRows.value.push(row)
  }
} else {
  // 取消勾选：按 id 删除 rows 中的项
  checkedRows.value = checkedRows.value.filter(item => item.id !== row.id)
}

}
function handleTotalDataChange(payload) {
  totalData.value = payload?.done ?? 0;
}
function handleCheckedRowKeysChange(temp,rows, meta) {
  const keys = temp.filter(item => item != null);
  batchAppraisalModalVisible.value = keys.length>=0
  if (meta.action=='check'&&keys.length > 5) {
    // 想增加时候提示
    $message.warning('最多只能选择5个项目');
    return;
  }
  // 如果是最后一个
  checkedRowKeys.value = keys;
}
// let originFineclass = []
// function handleBatchUpdate() {
//   proTableRef.value?.reload(); 
//   originFineclass = tableData.value.filter(item => item.tags === 1)
//     isEditing.value = !isEditing.value;
//     batchAppraisalModalTitle.value = isEditing.value ? "取消重新评选" : "重新评选"
//     if(!isEditing.value) {
//       batchAppraisalModalVisible.value = false;
//     }
//     formatResponseList(tableData.value)
// }

async function handleBatchAppraisalSubmit(submitData) {
  // 精品有200个 需要比较 如果原来有 则将fine_class 设置为1 如果原来没有 则添加到精品中
  // const result = [
  // ...submitData
  // ...originFineclass
  //   .filter(originItem => !submitData.some(submitItem => submitItem.id === originItem.id))
  //   .map(item => ({ ...item, tags: -1 }))
// ];
  try {
    const updateData =Array.from(submitData) ?.map(item => {
      if(item) {
        return {
        appraisalId: item.id,
        tags: 1,
        fineTips: String(item.fineTips)
        }
      }
    });
   await fetchAppraisalUpdate({items:updateData});
    // TODO: 调用实际批量更新接口
    $message.success('更新成功');
    proTableRef.value?.refresh();
    checkedRowKeys.value = [];
    checkedRows.value = [];
  } catch (error) {
    console.error('更新失败:', error);
  }
}

function handleReset() {
  // 保存需要保留的字段值（selectedDate 和 mainCategory）
  const searchForm = proTableRef.value?.searchForm;
  if (!searchForm) return;
  const savedSelectedDate = searchForm.selectedDate;
  const savedMainCategory = searchForm.mainCategory;
  // 等待 ProTable 完成默认重置后，恢复需要保留的字段，并只重置指定的三个字段
  nextTick(() => {
    if (searchForm) {
      // 恢复需要保留的字段
      searchForm.selectedDate = savedSelectedDate;
      searchForm.mainCategory = savedMainCategory;
      
      // 只重置指定的三个字段
      searchForm.appraisalId = null;
      searchForm.keyword = null;
      searchForm.grade = null;
      
      // 触发搜索
      proTableRef.value?.refresh();
    }
  });
}

</script>
<style>
.table {
 .search{
  .n-space {
    justify-content: flex-start !important;
  }
}
.n-data-table .n-data-table-thead  {
  .n-checkbox{
    display: none;
  }

}

}

</style>
