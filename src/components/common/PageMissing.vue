<template>
  <AppPage>
    <n-card>
      <n-result
        m-auto
        status="warning"
        title="页面组件缺失"
        description="该页面的路由配置存在，但对应的 Vue 组件文件不存在"
      >
        <template #footer>
          <div class="flex flex-col items-center gap-12">
            <n-alert type="info" :show-icon="false" class="mb-12">
              <template #header>
                <span class="text-14">组件路径：</span>
              </template>
              <n-code :code="componentPath" language="text" class="text-12" />
            </n-alert>
            <div class="flex gap-12">
              <n-button type="primary" ghost @click="goBack">
                返回上一页
              </n-button>
              <n-button type="primary" @click="goHome">
                返回首页
              </n-button>
            </div>
          </div>
        </template>
      </n-result>
    </n-card>
  </AppPage>
</template>

<script setup>
/**
 * 页面组件缺失提示组件
 * 当路由配置存在但对应的 Vue 组件文件不存在时显示
 */
defineProps({
  componentPath: {
    type: String,
    default: '未知路径',
  },
});

const router = useRouter();

/**
 * 返回上一页
 */
function goBack() {
  router.back();
}

/**
 * 返回首页
 */
function goHome() {
  router.replace('/');
}
</script>
