<template>
  <CommonPage>
    <ProTable
      ref="proTableRef"
      :search-form-items="searchFormItems"
      :fetch-data="fetchArticleList"
      :columns="columns"
    >
      <template #header>
        <n-space>
          <n-button type="primary" @click="handleAdd">新增文章</n-button>
        </n-space>
      </template>
    </ProTable>
  </CommonPage>
</template>

<script setup>
import { NButton, NSpace, NTag } from 'naive-ui';
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';
import { CommonPage, ProTable } from '@/components';
import { PubStatus, PubStatusLabelMap } from '@/constants';
import { fetchArticleList, fetchEnableArticle, fetchDisableArticle } from '@/services';
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
            onClick: () => handleEdit(row),
          }, { default: () => '编辑' }),

          row.pub_status === PubStatus.Published
            ? h(NButton, {
                quaternary: true,
                size: 'small',
                type: 'error',
                onClick: () => handleTogglePublish(row),
              }, { default: () => '取消发布' })
            : h(NButton, {
                quaternary: true,
                size: 'small',
                type: 'success',
                onClick: () => handleTogglePublish(row),
              }, { default: () => '发布' }),
        ],
      });
    },
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

/**
 * 处理新增文章
 */
function handleAdd() {
  router.push('/article/detail');
}

/**
 * 处理编辑文章
 * @param {Object} row - 文章数据
 */
function handleEdit(row) {
  router.push(`/article/detail?id=${row.id}`);
}

/**
 * 处理发布状态切换
 * @param {Object} row - 文章数据
 */
async function handleTogglePublish(row) {
  try {
    if (row.pub_status === PubStatus.Published) {
      // 当前已发布，执行禁用操作
      await fetchDisableArticle(row.id);
      $message.success('文章已取消发布');
    } else {
      // 当前未发布，执行启用操作
      await fetchEnableArticle(row.id);
      $message.success('文章已发布');
    }
    // 刷新列表
    proTableRef.value.refresh();
  } catch (error) {
    $message.error('操作失败：' + (error.message || '未知错误'));
  }
}
</script>
