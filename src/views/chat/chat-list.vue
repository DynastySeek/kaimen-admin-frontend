<template>
 <CommonPage>
  <n-card class="card-container">
      <FormBuilder
        v-model="searchForm"
        :form-items="searchFormItems"
        :label-width="labelWidth"
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
    <n-space vertical>
    <n-layout>
    <n-layout has-sider>
    <n-layout-sider
        bordered
        show-trigger
        collapse-mode="width"
        :collapsed-width="64"
        :width="240"
        :native-scrollbar="false"
        :inverted="inverted"
        style="max-height: 320px"
        >
        <n-list class="chat-list">
          <n-list-item
            v-for="item in staticChatList"
            :key="item._id"
          >
            <n-thing>
              <template #avatar>
                <n-avatar round size="large" class="avatar-user">
                  {{ item.nick_name }}
                </n-avatar>
              </template>
              <template #header>
                <span>{{ item.nick_name }}</span>
                <span class="mx-2">|</span>
                <span>ID: {{ item._id }}</span>
              </template>
              <template #description>
                授权登录手机号：{{ item.phone }}
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
        </n-layout-sider>
        <n-layout style="min-height: 320px">
          <n-scrollbar class="chat-scroll">
            <div class="chat-container">
              <div
                v-for="(message, index) in chatListData"
                :key="message.id || index"
                class="chat-entry"
              >
                <div class="chat-message user">
                  <div class="chat-meta">
                    <n-avatar round size="large" class="avatar-user">
                      问
                    </n-avatar>
                    <span class="chat-name">用户</span>
                    <span class="chat-time">{{ dayjs(message.created_at*1000).format('YYYY-MM-DD HH:mm:ss') }}</span>
                  </div>
                  <div class="chat-bubble user">
                    <p class="chat-line">
                      {{ message.query }}
                    </p>
                  </div>
                </div>
                <div class="chat-message ai">
                  <div class="chat-meta">
                    <n-avatar round size="large" class="avatar-ai">
                      答
                    </n-avatar>
                    <span class="chat-name">AI客服</span>
                    <span class="chat-time">{{ dayjs(message.created_at*1000).format('YYYY-MM-DD HH:mm:ss') }}</span>
                  </div>
                  <div class="chat-bubble ai">
                    <p class="chat-line">
                      {{ message.answer }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </n-scrollbar>
        </n-layout>
      </n-layout>
    </n-layout>
  </n-space>
 </CommonPage>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRequest } from 'alova/client';
import { fetchChatList, fetchUserinfoList} from '@/services';
import { CommonPage, FormBuilder } from '@/components';
import dayjs from 'dayjs';
const labelWidth = '120px';
const chatListData = ref([]);
const staticChatList = ref([]);
// user: 'C6GGSF1R5A',
//   conversation_id: '7adc30ae-71e7-4512-8be6-24c16f4ecff8',
//   userPhone : '',
const searchForm = ref({
  user: 'C6GGSF1R5A',
  conversation_id: '7adc30ae-71e7-4512-8be6-24c16f4ecff8',
  userPhone : '',
  
});
const searchFormItems = [{
    prop: 'user',
    label: '用户ID',
    type: 'input',
    placeholder: '请输入用户ID',
    span: 6,
  },
  {
    prop: 'userPhone',
    label: '授权手机号',
    type: 'input',
    placeholder: '请输入授权手机号',
    span: 6,
  },
]
function handleReset() {
  Object.keys(searchForm.value).forEach((key) => {
    searchForm.value[key] = null;
  });
  handleSearch();
}
async function handleSearch() {
  const res = await fetchChatList({  ...searchForm.value });
  chatListData.value = res.data;
  const  { user } = searchForm.value
  const userInfo = await fetchUserinfoList({id:user} )
  staticChatList.value=[{...userInfo.data}] 
}


// 请求聊天列表
onMounted(() => {
  handleSearch();
});


</script>

<style scoped>
.chat-list {
padding:20px;
}
.chat-scroll {
  padding: 16px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding:40px;
}

.chat-entry {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.chat-message.user,
.chat-message.ai {
  align-items: flex-start;
}

.chat-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color:rgb(55, 51, 51);
  margin-bottom: 6px;
}

.chat-name {
  font-weight: 600;

}

.chat-bubble {
  max-width: 520px;
  border-radius: 6px;
  padding: 12px;
  line-height: 1.6;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.chat-bubble.ai {
  background: #ecf5ff;
  color: #1d7dfa;
}

.chat-bubble.user {
  background: #f0f9eb;
  color: #3a7b4f;
}

.chat-line + .chat-line {
  margin-top: 4px;
}

.avatar-user {
  background-color: #1d7dfa;
  color: #fff;
}

.avatar-ai {
  background-color: #f0a500;
  color: #fff;
}
</style>
