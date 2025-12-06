<template>
    <CommonPage>
      <ProTable
        ref="proTableRef"
        label-width="140px"
        :columns="columns"
        :checked-row-keys="checkedRowKeys"
        :checked-row="checkedRows"
        :search-form-items="searchFormItems"
        :fetch-data="fetchWashList"
        :format-search-params="formatSearchParams"
        :format-response-list="formatResponseList"
        :row-key="item => item.id"
        @update:checked-row-keys="keys => checkedRowKeys = keys"
        @update:checked-row="rows => checkedRows = rows"
      />
    </CommonPage>
  </template>
  
  <script setup>
  import { cloneDeep, omit } from 'lodash-es';
  import { NButton, NSpace, NTag } from 'naive-ui';
  import { computed, h, ref, onMounted } from 'vue';
  import { getTempFileUrls } from '@/cloud';
  import WashActions from './components/WashActions.vue'
  import { CommonPage, ProTable, SelectDictionary, VideoModal } from '@/components';
  import { AppraisalStatus, AppraisalStatusLabelMap, AppraisalBusinessTypeLabelMap, AppraisalClassLabelMap, CleansingClass, CleansingClassLabelMap} from '@/constants';
  import { fetchAppraisalList, fetchAppraisalUpdate,fetchUserInfoById, fetchWashList, fetchWashUpate} from '@/services';
  import { useUserStore } from '@/stores';
  import { formatDateTime } from '@/utils';
  import AppraisalAction from './components/AppraisalAction.vue';
  import BatchAppraisalDrawer from './components/BatchAppraisalDrawer.vue';
  import ImagePreview from './components/ImagePreview.vue';
  import { reactive, watch } from 'vue';
  import dayjs from 'dayjs';
  
  
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

  
  /**
   * 搜索参数格式化函数
   * @param {object} params - 搜索参数
   * @returns {object} 格式化后的参数
   */
  
  function formatSearchParams(params) {
    return omit({
      ...params,
      startCreateDate: params.createTimeRange?.[0] ? formatDateTime(params.createTimeRange?.[0]) : null,
      endCreateDate: params.createTimeRange?.[1] ? formatDateTime(params.createTimeRange?.[1]) : null,
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
      prop: 'id',
      label: '洗护ID',
      type: 'input',
      placeholder: '请输入鉴定ID',
      span: 6,
    },
    {
      prop: 'description',
      label: '描述',
      type: 'input',
      placeholder: '请输入描述',
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
    {
    prop: 'createTimeRange',
    label: '创建时间',
    type: 'datetimerange',
    placeholder: '请选择创建时间范围',
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
    prop: 'status',
    label: '状态',
    type: 'selectDictionary',
    name: 'CleansingClass',
    placeholder: '请选择状态',
    span: 6,
  },

  ].filter(item => !item.hidden));
  
  const columns = computed(() => [
    {
      title: '洗护ID',
      key: 'id',
      width: 100,
      fixed: 'left',
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
          maxDisplay: 3,
        });
      },
    },
    {
      title: '类目',
      key: 'mainCategory',
      width: 100,
       render: row => AppraisalClassLabelMap[row.mainCategory] || '-' 
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
      key: 'authPhone',
      width: 140,
      hidden: !userStore.isAdmin,
    },
    {
      title: '创建时间',
      key: 'createdAt',
      width: 160,
      render: ({ createdAt }) =>createdAt ? formatDateTime(createdAt):'-',
      defaultSortOrder: 'descend',
      sorter: (row1, row2) => {
      const t1 = row1.createdAt ? new Date(row1.createdAt).getTime() : 0
      const t2 = row2.createdAt ? new Date(row2.createdAt).getTime() : 0
      return  t1 - t2
    },
    customNextSortOrder: (order) => {
      return order === 'ascend' ? 'descend' : 'ascend'
    }
    },
    {
      title: '鉴定师',
      key: 'lastSubmitUser',
      width: 140,
      render: (row) => {
        const userid = row?.lastAppraiserId;
        
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
        if (row.status <= 0) return '—';

const typeMap = {
  [CleansingClass.process]: 'info',
  [CleansingClass.completed]: 'success',
  [CleansingClass.closed]: 'default'
};

return h(
  NTag,
  { type: typeMap[row.status] || 'default' },
  { default: () => CleansingClassLabelMap[row.status] || '—' }
);

        
       
      },
    },
    {
      title: '操作/编辑',
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: (row) => {
        if(row?.status==CleansingClass.completed){
            return h('span','-')
        }
        else if(row?.status==CleansingClass.closed){
            return h('span',`原因：${row?.result}`) }
        else {
            return h(WashActions, {
                row,
                onEdit: handleEdit,
                onClose: handleClose
            })
        }
    }
    },
  ].filter(column => !column.hidden));
  
  async function handleWashUpdate(row,status,reason) {
    await fetchWashUpate([{
      id: row.id,
      status: status,
      result: reason ?? '',
    }])
    proTableRef.value?.refresh();
  }
  function handleEdit(row) {
    handleWashUpdate(row, CleansingClass.completed);
  }
  function handleClose(row,reason) {
    handleWashUpdate(row, CleansingClass.closed,reason);
  }
  

 
  </script>
  