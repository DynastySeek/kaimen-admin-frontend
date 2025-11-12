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
             <n-tag :type="isConnected ? 'success' : 'error'" size="small">
               {{ isConnected ? '已连接' : '未连接' }}
             </n-tag>
             <NButton type="primary" @click="handleSearch">
               搜索
             </NButton>
             <NButton @click="handleReset">
               重置
             </NButton>
             <NButton 
               v-if="!isConnected" 
               type="info" 
               @click="connectSocket"
             >
               连接
             </NButton>
             <NButton 
               v-else 
               type="error" 
               @click="disconnectSocket"
             >
               断开
             </NButton>
           </NSpace>
         </template>
       </FormBuilder>
     </n-card>
     <n-space vertical>
     <n-spin :show="loading" size="large">
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
         <n-spin :show="loading" size="small">
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
         </n-spin>
       </n-layout-sider>
       <n-layout style="min-height: 320px">
         <!-- <n-spin  size="small"> -->
           <n-scrollbar class="chat-scroll">
             <div class="chat-container">
               <div
                 v-for="(message, index) in chatListData"
                 :key="message.id || index"
                 class="chat-entry"
               >
                   <div v-if="message.query" class="chat-message user">
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
                 <div v-if="message.answer" class="chat-message ai">
                   <div class="chat-meta">
                     <n-avatar round size="large" class="avatar-ai">
                       答
                     </n-avatar>
                     <span class="chat-name">客服</span>
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
             <div class="message-input-container">
               <n-input 
                 v-model="message" 
                 type="textarea" 
                 :rows="3"
                 placeholder="输入消息内容... (Enter 发送，Shift+Enter 换行)"
                  @keydown.enter.exact.prevent="sendMessage"
               />
               <n-space class="mt-2" justify="end">
                 <n-button 
                   type="primary" 
                   @click="sendMessage"
          
                 >
                   发送
                 </n-button>
               </n-space>
             </div>
           </n-scrollbar>
           <!-- </n-spin> -->
         </n-layout>
       </n-layout>
     </n-layout>
     </n-spin>
   </n-space>
  </CommonPage>
 </template>
 <script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
 import { fetchChatList, fetchUserinfoList} from '@/services';
 import { CommonPage, FormBuilder } from '@/components';
import { useUserStore } from '@/stores';
import { io } from 'socket.io-client';
 import dayjs from 'dayjs';

const userStore = useUserStore();
 const labelWidth = '120px';
 const chatListData = ref([]);
 const staticChatList = ref([]);
const loading = ref(false);
 const loadingChatList = ref(false);
const message = ref('');
const socket = ref(null);
const isConnected = ref(false);
const currentConversationId = ref('7adc30ae-71e7-4512-8be6-24c16f4ecff8');
const inverted = ref(false);

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
    prop: 'conversation_id',
    label: '会话ID',
    type: 'input',
    placeholder: '请输入会话ID',
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
  const { user, conversation_id } = searchForm.value;
   staticChatList.value = [];
  currentConversationId.value = conversation_id || '';
  
   try {
     const res = await fetchChatList({ ...searchForm.value });
     if (chatListData.value) {
       chatListData.value = res?.data ?? [];
       loadingChatList.value = false
     }
   } catch (error) {
     chatListData.value = [];
     console.error('获取聊天记录失败', error);
   }
   try {
     if (user) {
       const userInfo = await fetchUserinfoList({ id: user });
       if (userInfo?.data) {
         staticChatList.value = [{ ...userInfo.data }];
         loading.value = false;
       }
     }
   } catch (error) {
     console.warn('获取用户信息失败', error);
   }
 
  // 如果选择了会话且已连接，自动接受会话
  if (conversation_id && isConnected.value) {
    setTimeout(() => {
      acceptConversation(conversation_id);
    }, 300);
  }
}

// 初始化 WebSocket 连接（客服端）
const connectSocket = () => {
  // 如果已连接，不重复连接
  if (socket.value?.connected) {
    console.log('WebSocket 已连接，跳过重复连接');
    return;
  }

  // 如果已有连接实例，先断开
  if (socket.value) {
    try {
      socket.value.disconnect();
    } catch (e) {
      console.warn('断开旧连接失败:', e);
    }
    socket.value = null;
  }

  const SERVER_URL = 'https://agent.kaimen.site';
  const NAMESPACE = '/v1/chat/human-service/human'; // 客服端使用 /human
  
  console.log('[HumanService] 准备连接到客服端 Socket.IO...');
  
  socket.value = io(SERVER_URL + NAMESPACE, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  // 生成 UUID v4
  function generateUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // 降级方案：生成 UUID v4 格式
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 验证 UUID 格式
  function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // 连接成功
  socket.value.on('connect', () => {
    console.log('✅ [Human] Connected to server');
    isConnected.value = true;
    
    // 发送客服上线
    const agentName = userStore.userInfo?.nickname || userStore.userInfo?.username || '客服';
    // 确保 agent_id 是有效的 UUID 格式
    let agentId = userStore.userInfo?.user_id;
    if (!agentId || !isValidUUID(agentId)) {
      agentId = generateUUID();
      console.log('[HumanService] 生成新的 agent_id (UUID):', agentId);
    }
    
    console.log('[HumanService] 发送 human_online，agent_id:', agentId, 'agent_name:', agentName);
    
    socket.value.emit('human_online', {
      type: 'human_online',
      data: {
        human_id: "263db1d7-8fd1-4e4c-a57b-5755a3bf8399",
        human_name: "老虎",
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
  });

  // 上线确认
  socket.value.on('human_online_ack', (data) => {
    console.log('✅ [Human] Online acknowledged:', data);
    const ackData = data?.data || data || {};
    
    // 如果有等待的会话且已选择会话ID，自动接受
    const waitingQueue = ackData.waiting_queue || [];
    if (waitingQueue.length > 0 && searchForm.value.conversation_id) {
      const conv = waitingQueue.find(c => c.conversation_id === searchForm.value.conversation_id);
      if (conv) {
        console.log('[HumanService] 自动接受会话:', conv.conversation_id);
        acceptConversation(conv.conversation_id);
      }
    }
  });

  // 新会话
  socket.value.on('new_conversation', (data) => {
    console.log('🔔 [Human] New conversation waiting:', data);
    const convData = data?.data || {};
    console.log(`新用户等待接入: ${convData.user_id}, 会话ID: ${convData.conversation_id}`);
  });

  // 接受会话确认
  socket.value.on('accept_conversation_ack', (data) => {
    console.log('✅ [Human] Conversation accepted:', data);
    const ackData = data?.data || data || {};
    if (ackData.conversation_id) {
      currentConversationId.value = ackData.conversation_id;
    }
  });

  // 接收用户消息
  socket.value.on('user_message', (data) => {
    console.log('💬 [Human] Received message from user:', data);
    const msgData = data?.data || data || {};
    
    // 如果是当前会话的消息，添加到聊天列表
    if (msgData.conversation_id === currentConversationId.value) {
      addMessageToChatList({
        query: msgData.message_content || '',
        answer: '',
        created_at: msgData.timestamp || Math.floor(Date.now() / 1000),
        id: `msg_${Date.now()}`,
        isUser: true
      });
    }
  });

  // 发送消息确认
  socket.value.on('human_message', (data) => {
    console.log('✅ [Human] Message sent confirmation:', data);
  });

  // 错误处理
  socket.value.on('error', (data) => {
    console.error('❌ [Human] Error:', data);
  });

  // 断开连接
  socket.value.on('disconnect', (reason) => {
    console.log('❌ [Human] Disconnected from server, reason:', reason);
    isConnected.value = false;
  });

  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('❌ [Human] Connection error:', error);
    isConnected.value = false;
  });
}

// 接受会话
function acceptConversation(conversationId) {
  if (!socket.value?.connected || !isConnected.value) {
    console.warn('无法接受会话：WebSocket 未连接');
    return;
  }

  if (!conversationId) {
    console.warn('无法接受会话：会话ID为空');
    return;
  }

  console.log('接受会话:', conversationId);
  currentConversationId.value = conversationId;

  socket.value.emit('accept_conversation', {
    type: 'accept_conversation',
    data: {
      conversation_id: conversationId,
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
}

// 发送消息
function sendMessage() {
  if (!message.value.trim()) {
    console.log('请输入消息内容');
    return;
  }

  if (!currentConversationId.value) {
    // 尝试使用搜索表单中的会话ID
    if (searchForm.value.conversation_id) {
      currentConversationId.value = searchForm.value.conversation_id;
      if (isConnected.value) {
        acceptConversation(currentConversationId.value);
      }
    } else {
      console.log('请先选择或输入会话ID');
      return;
    }
  }

  if (!socket.value?.connected || !isConnected.value) {
    console.log('WebSocket 未连接，请先连接');
    connectSocket();
    return;
  }

  const messageToSend = message.value.trim();
  
  // 先添加到聊天列表（乐观更新）
  addMessageToChatList({
    query: '',
    answer: messageToSend,
    created_at: Math.floor(Date.now() / 1000),
    id: `msg_${Date.now()}`,
    isUser: false
  });

  // 发送消息
  console.log('发送消息:', {
    conversation_id: currentConversationId.value,
    message_content: messageToSend
  });

  socket.value.emit('human_message', {
    type: 'human_message',
    data: {
      conversation_id: currentConversationId.value.trim(), // 移除可能的空格
      message_content: messageToSend,
      message_type: 'text',
      timestamp: Math.floor(Date.now() / 1000)
    }
  });

  // 清空输入框
  message.value = '';
}

// 添加消息到聊天列表
function addMessageToChatList(messageData) {
  if (messageData.isUser) {
    chatListData.value.push({
      query: messageData.query,
      answer: '',
      created_at: messageData.created_at,
      id: messageData.id
    });
  } else {
    const lastItem = chatListData.value[chatListData.value.length - 1];
    if (lastItem && lastItem.query && !lastItem.answer) {
      lastItem.answer = messageData.answer;
      lastItem.created_at = messageData.created_at;
    } else {
      chatListData.value.push({
        query: '',
        answer: messageData.answer,
        created_at: messageData.created_at,
        id: messageData.id
      });
    }
  }
  
  // 滚动到底部
  nextTick(() => {
    const scrollbar = document.querySelector('.chat-scroll .n-scrollbar-content');
    if (scrollbar) {
      scrollbar.scrollTop = scrollbar.scrollHeight;
    }
  });
}


 
 
 // 请求聊天列表
 onMounted(() => {
  // handleSearch();
  // 自动连接（可选，也可以让用户手动连接）
  connectSocket();
});

// 断开 WebSocket 连接
function disconnectSocket() {
  if (!socket.value) {
    console.log('WebSocket 未连接，无需断开');
    return;
  }

  try {
    console.log('[HumanService] 正在断开连接...');
    socket.value.disconnect();
    console.log('[HumanService] 已断开连接');
  } catch (e) {
    console.warn('[HumanService] 断开连接失败:', e);
  } finally {
    socket.value = null;
    isConnected.value = false;
    currentConversationId.value = '';
    console.log('[HumanService] 连接状态已重置');
  }
}

// 组件卸载时断开连接
onUnmounted(() => {
  disconnectSocket();
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
   overflow-y: auto;
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

.message-input-container {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
 }
 </style>