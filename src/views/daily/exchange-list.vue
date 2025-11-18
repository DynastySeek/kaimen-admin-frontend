<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      label-width="140px"
      :columns="columns"
      :checked-row-keys="checkedRowKeys"
      :search-form-items="searchFormItems"
      :fetch-data="fetchUserGoldList"
      :format-search-params="formatSearchParams"
      :format-response-list="formatResponseList"
      :row-key="item => item._id"
      @update:checked-row-keys="keys => checkedRowKeys = keys"
      />
      <n-modal v-model:show="showModal" 
      preset="card"
      title="明细"
      style="width: 600px;">
        <n-data-table
        :max-height="440"
        :virtual-scroll="true"
        :columns="detailscolumns"
        :data="detailsData"
        :pagination="false"
        :bordered="false"
        />
    </n-modal>
    <n-modal
      v-model:show="exchangeModalVisible"
      preset="card"
      title="兑换黄金"
      style="width: 600px;"
      >
      <FormBuilder
        ref="formRef"
        v-model="formState"
        :form-items="formItems"
        label-width="100px"
      />
     
      <template #footer>
      
        <n-flex justify="end" align="center">
          <n-gradient-text type="error">请确认信息后点击提交，提交后不可修改
          </n-gradient-text>
          <n-button type="primary" @click="handledSubmit">
            确定提交
          </n-button>
        </n-flex>
      </template>
    </n-modal>
  </CommonPage>
</template>

<script setup>
import { cloneDeep, omit } from 'lodash-es';
import { computed, ref, reactive, onMounted, h } from 'vue';
import { getTempFileUrls } from '@/cloud';
import { CommonPage, ProTable, FormBuilder, VideoModal } from '@/components';
import { NButton, NSpace, NModal, NTable } from 'naive-ui';
import {goldXchangelist,  goldXchange,  fetchUserinfoList,fetchUserGoldList,fetchAppraisalFineList} from '@/services';
import dayjs from 'dayjs';
import { render } from 'less';

const proTableRef = ref();
const formRef = ref();
const checkedRowKeys = ref([]);
const showModal = ref(false);
const formState = reactive({
  _id: '',
  remain_tips: 0,
  gold: '',
  price: ''
})
const detailsData = ref([]);
const exchangeModalVisible = ref(false);
/**
 * 搜索参数格式化函数
 * @param {object} params - 搜索参数
 * @returns {object} 格式化后的参数
 */
function formatSearchParams(params) {
  return omit({
    ...params,
    size:params?.pageSize,
  },(['pageSize']));
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
const formItems = [
  {
    prop: 'remain_tips',
    label: '当前余额',
    type: 'input',
    disabled: true,
  },
  {
    
    prop: 'gold',
    label: '金额(￥)',
    type: 'input',
    placeholder: '请输入金额',
    rules: [
    {
        validator: (rule, value) => {
          if (value === '' || value === null || value === undefined) {
            return Promise.reject('请输入金额');
          }
          // 判断数字格式，最多2位小数
          const reg = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
          if (!reg.test(value)) {
            return Promise.reject('请输入合法金额，最多2位小数');
          }
          // 判断是否大于当前余额
          if (parseFloat(value) > formState.remain_tips) {
            return Promise.reject('金额不能超过当前余额');
          }
          return Promise.resolve();
        }
      }
    ],
  
  },
  {
    prop: 'price',
    label: '重量(g)',
    type: 'input',
    placeholder: '请输入重量',
    rules: [
      {
        validator: (rule, value) => {
          if (value === '' || value === null || value === undefined) {
            return Promise.reject('请输入重量');
          }
          if (!/^[1-9]\d*$/.test(value)) {
            return Promise.reject('重量必须为正整数');
          }
          return Promise.resolve();
        },
      },
    ],
  
  },
]

const searchFormItems =  [
  {
    prop: 'phone',
    label: '登录授权手机号',
    type: 'input',
    placeholder: '请输入登录授权手机号',
    span: 6,
  }
]
const detailscolumns = [
  {
    title: '时间',
    key: 'created_at',
    render: (row) => {
      return h('div', dayjs(row.created_at).format('YYYY-MM-DD HH:mm:ss'));
    },
  },
  {
    title: '类型',
    key: 'type',
    render: (row) => {
      return h('div',row.type === 1 ? "黄金" :  "精品奖励" );
    },
  },
  {
    title: '详情',
    key: 'gold_gram',
    render: (row) => {
      return h('div',row.type === 1 ? `${row.gold_gram}g` :  row.gold_gram );
    },
  },
  {
    title: '金额',
    key: 'remain_tips',
  },
];

const columns = [
{
    title: '授权登录手机号',
    key: 'phone',
    width: 140,
  },
  {
    title: '当前余额',
    key: 'remain_tips',
    width: 100,
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render: (row) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            quaternary: true,
            size: 'small',
            type: 'primary',
            onClick: () => handledDetails(row),
          }, { default: () => '明细' }),
          h(NButton, {
            quaternary: true,
            size: 'small',
            type: 'primary',
            onClick: () => {
              // 重置表单并赋值
              Object.assign(formState, {
                _id: row._id,
                remain_tips: row.remain_tips || 0,
                gold: '',
                price: ''
              });
              exchangeModalVisible.value = true;
            },
          }, { default: () => '兑换黄金' })
        ],
      });
    },
  },
];
async function handledDetails(row) {
  showModal.value = true
  try {
    const { data } = await goldXchangelist({userinfoid:row._id});
    detailsData.value = data
  } catch (error) {
    console.error('获取明细失败:', error);
  }
}
async function handledSubmit(_data) {
  try{
    const valid = await formRef.value?.validate();
    if (!valid) {
      return;
    }
    await goldXchange({userInfoId:formState._id, gold:Number(formState.gold),price:Number(formState.price)});
    $message.success('兑换成功');
    exchangeModalVisible.value = false
    proTableRef.value?.refresh();
  }
  catch (error) {
    console.error('兑换黄金失败:', error);
  }
}

async function searchList() {
  // await fetchUserGoldList({page:1,size:20});
}

onMounted(()=>{
  // searchList()
})

</script>
