<template>
  <CommonPage :title="articleId ? '新增文章' : '编辑文章'">
    <template #action>
      <n-space>
        <n-button @click="handleCancel">
          取消
        </n-button>
        <n-button type="warning" @click="handleDebugFill">
          调试填充
        </n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          保存
        </n-button>
      </n-space>
    </template>

    <n-card>
      <FormBuilder
        ref="formRef"
        v-model="formData"
        :form-items="formItems"
        label-width="100px"
      />
    </n-card>
  </CommonPage>
</template>

<script setup>
import { useRequest } from 'alova/client';
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CommonPage, FormBuilder } from '@/components';
import { fetchArticleDetail, fetchCreateArticle, fetchUpdateArticle } from '@/services';

const route = useRoute();
const router = useRouter();

const formRef = ref();
const loading = ref(false);

// 判断是否为新增模式
const articleId = computed(() => route.query.id);

// 表单数据
const formData = reactive({
  title: '',
  author: '',
  cover_pic: '',
  rich_content: '',
});

/**
 * 使用useRequest获取文章详情
 */
const {
  data: _articleData,
  onSuccess: handleLoadSuccess,
} = useRequest(() => fetchArticleDetail(articleId.value), {
  immediate: !!articleId.value,
});

handleLoadSuccess(({ data }) => {
  if (data?.data) {
    Object.assign(formData, data.data);
  }
});

async function handleSubmit() {
  try {
    const valid = await formRef.value?.validate();
    if (!valid) {
      return;
    }
    loading.value = true;

    if (articleId.value) {
      await fetchUpdateArticle(articleId.value, formData);
    } else {
      await fetchCreateArticle(formData);
    }
    $message.success('操作成功');
    // router.push(`/article/list`);
  } catch (error) {
    $message.error('保存文章失败');
    console.error('保存文章失败:', error);
  } finally {
    loading.value = false;
  }
}

/**
 * 处理取消操作
 */
function handleCancel() {
  router.push(`/article/list`);
}

/**
 * 调试填充数据
 */
function handleDebugFill() {
  Object.assign(formData, {
    title: '文章标题',
    author: '作者',
    cover_pic: 'https://app-resource.kaimen.site/admin-test/20251018/9863a497c798432583974e371d63f411.png',
    rich_content: '<p><img src="https://app-resource.kaimen.site/admin-test/20251018/a194764d9afe4d7ea713655c23c364a3.jpg" alt="3e667a314a57450992556fa620022214.jpg" data-href="https://app-resource.kaimen.site/admin-test/20251018/a194764d9afe4d7ea713655c23c364a3.jpg" style=""/></p><p>是打车</p><p><span style="font-size: 29px;">冲冲冲</span></p><p><span style="font-size: 29px;"><strong>答复答复</strong></span></p>',
  });
}

// 表单项配置
const formItems = [
  {
    prop: 'title',
    label: '文章标题',
    type: 'input',
    placeholder: '请输入文章标题',
    props: {
      clearable: true,
    },
    rules: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  },
  {
    prop: 'author',
    label: '作者',
    type: 'input',
    placeholder: '请输入作者',
    props: {
      clearable: true,
    },
    rules: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  },
  {
    prop: 'cover_pic',
    label: '封面图',
    type: 'uploadImage',
    placeholder: '请输入封面图URL',
    rules: [{ required: true, message: '请输入封面图URL', trigger: 'blur' }],
  },
  {
    prop: 'rich_content',
    label: '文章内容',
    type: 'basicEditor',
    placeholder: '请输入文章内容',
    rules: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
  },
];
</script>
