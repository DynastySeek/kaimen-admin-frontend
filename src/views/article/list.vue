<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      :action-buttons="['add', 'edit']"
      add-button-text="新增文章"
      :search-form-items="searchFormItems"
      :fetch-data="fetchArticleList"
      :columns="columns"
      @add="handleAdd"
    />
  </CommonPage>
</template>

<script setup>
import { NTag } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CommonPage, ProTable } from '@/components';
import { PubStatus, PubStatusLabelMap } from '@/constants';
import { fetchArticleList } from '@/services';
import { formatDateTime } from '@/utils';

const router = useRouter();

const proTableRef = ref();

// 表格列定义
const columns = computed(() => [
  { title: 'ID', key: 'id', width: 120 },
  { title: '标题', key: 'title', width: 120, ellipsis: { tooltip: true } },
  { title: '作者', key: 'author', width: 120 },
  {
    title: '封面图',
    key: 'cover_pic',
    width: 100,
    render: (row) => {
      if (row.cover_pic) {
        return h('img', {
          src: row.cover_pic,
          style: { width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' },
          alt: '封面图',
        });
      }
      return '-';
    },
  },
  {
    title: '发布状态',
    key: 'pub_status',
    width: 100,
    render: row => PubStatusLabelMap[row.pub_status] || '-',
    render: (row) => {
      const statusConfig = {
        [PubStatus.ToPublish]: { type: 'default' },
        [PubStatus.Published]: { type: 'success' },
        [PubStatus.Offline]: { type: 'warning' },
      };
      return h(NTag, {
        type: statusConfig[row.pub_status]?.type || 'default',
      }, {
        default: () => PubStatusLabelMap[row.pub_status] || '-',
      });
    },
  },
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
    prop: 'title',
    label: '标题',
    type: 'input',
    placeholder: '请输入文章标题',
    span: 6,
  },
  {
    prop: 'author',
    label: '作者',
    type: 'input',
    placeholder: '请输入作者',
    span: 6,
  },
  {
    prop: 'pub_status',
    label: '发布状态',
    type: 'selectDictionary',
    name: 'PubStatus',
    placeholder: '请选择发布状态',
    span: 6,
  },
];

function handleAdd() {
  router.push('/article/detail');
}
</script>
