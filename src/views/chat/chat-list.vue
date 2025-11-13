<template>
  <CommonPage>
    <!-- 顶部操作栏 -->
   <n-card class="card-container">
      <n-space vertical :size="16">
        <n-space justify="space-between" align="center">
          <n-space>

             <n-tag :type="isConnected ? 'success' : 'error'" size="large" @click="isConnected?disconnectSocket():connectSocket()">
              {{ isConnected ? '✅ 已上线,点击下线' : '❌ 未上线，请点击上线' }}
             </n-tag>
             <n-tag 
              size="large"
              type="success" 
              :disabled="!isConnected"
              @click="refreshAll"
            >
              🔄 刷新所有
            </n-tag>
          </n-space>
        </n-space>
        <!-- <n-card title="📊 实时统计" size="small" :bordered="false" style="background: #ecf5ff;">
          <n-space>
            <n-statistic label="在线用户" :value="stats.onlineUsers" />
            <n-divider vertical />
            <n-statistic label="在线客服" :value="stats.onlineHumans" />
            <n-divider vertical />
            <n-statistic label="等待队列" :value="stats.waitingQueue" />
            <n-divider vertical />
            <n-statistic label="活跃会话" :value="stats.activeConversations" />
          </n-space>
     </n-card> -->
      </n-space>
     </n-card>

    <!-- 主体区域 -->
    <n-space vertical :size="16" style="margin-top: 16px;">
       <n-layout has-sider>
        <!-- 左侧：等待队列 + 活跃会话列表 -->
         <n-layout-sider
         bordered
         show-trigger
         collapse-mode="width"
          :collapsed-width="0"
          :width="360"
         :native-scrollbar="false"
          style="min-height: 600px;"
        >
          <n-tabs animated>
            <!-- 等待队列标签 -->
    
            <n-tab-pane name="queue" tab="新消息">
              <template #tab>
                <n-badge :value="waitingQueue?.length" :max="99">
                  <span style="font-size: 12px;padding: 10px;">  {{ '新消息' }}</span>
                </n-badge>
              </template>
              <div style="padding: 12px;">
                <n-space vertical :size="12">
                  <n-button 
                    type="primary" 
                    block 
                    :disabled="!isConnected"
                    @click="refreshQueue"
                  >
                    刷新队列
                  </n-button>
                  <n-spin :show="loadingQueue">
                    <div v-if="waitingQueue.length === 0" class="empty-state">
                      <n-empty description="暂无等待中的会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="item in waitingQueue"
                        :key="item.conversation_id"
                        size="small"
                        hoverable
                      >
                        <template #header>
                          <n-space align="center">
                            <n-tag type="warning" size="small">
                              #{{ item.queue_position }}
                            </n-tag>
                            <span style="font-size: 12px;">等待 {{ item.wait_time }}s</span>
                          </n-space>
                        </template>
                        <n-space vertical :size="8">
                          <n-text depth="3" style="font-size: 12px;">
                            会话ID: {{ item.conversation_id.slice(0, 8) }}...
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            用户ID: {{ item.user_id }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            首条: {{ item.first_message || '无' }}
                          </n-text>
                          <n-button 
                            type="warning" 
                            size="small"
                            block
                            @click="acceptConversationFromQueue(item.conversation_id, item.user_id)"
                          >
                            接受会话
                          </n-button>
                        </n-space>
                      </n-card>
                    </n-space>
                  </n-spin>
                </n-space>
              </div>
            </n-tab-pane>
            <n-tab-pane name="active" tab="处理中">
              <template #tab>
                <n-badge :value="activeConversations?.length" :max="99">
                  <span style="font-size: 12px;padding: 10px;">{{ '处理中' }}</span> 
                </n-badge>
              </template>
              <div style="padding: 12px;">
                <n-space vertical :size="12">
                  <n-button 
                    type="primary" 
                    block 
                    :disabled="!isConnected"
                    @click="refreshActiveConversations"
                  >
                    刷新活跃会话
                  </n-button>
                  
                  <n-spin :show="loadingActive">
                    <div v-if="activeConversations.length === 0" class="empty-state">
                      <n-empty description="暂无活跃会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="conv in activeConversations"
                        :key="conv.conversation_id"
                        size="small"
                        hoverable
                        :bordered="conv.conversation_id === currentConversationId"
                        :style="conv.conversation_id === currentConversationId ? 'border: 2px solid #18a058;' : ''"
                      >
                      <template #header>
                          <n-space align="center" justify="space-between">
                            <span style="font-size: 13px;">
                              {{ conv.conversation_id === currentConversationId ? '⭐ 当前会话' : '💬 活跃' }}
                            </span>
                            <n-tag 
                              v-if="conv.conversation_id === currentConversationId" 
                              type="success" 
                              size="small"
                            >
                              处理中
                            </n-tag>
                          </n-space>
                        </template>
                        <n-space vertical :size="8">
                          <n-text depth="3" style="font-size: 12px;">
                            会话ID: {{ conv.conversation_id.slice(0, 8) }}...
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            用户ID: {{ conv.user_id }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            客服: {{ conv.human_name || '未分配' }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            连接时间: {{ formatTime(conv.connected_at) }}
                          </n-text>
                          <n-space>
                            <n-button 
                              v-if="conv.conversation_id !== currentConversationId"
                              type="info" 
                              size="small"
                              @click="switchToConversation(conv.conversation_id, conv.user_id)"
                            >
                              切换
                            </n-button>
                            <n-button 
                              type="error" 
                              size="small"
                              @click="closeConversationById(conv.conversation_id)"
                            >
                              关闭
                            </n-button>
                          </n-space>
                        </n-space>
                      </n-card>
                    </n-space>
                  </n-spin>
                </n-space>
              </div>
            </n-tab-pane>

            <!-- 已结束会话标签 -->
            <n-tab-pane name="closed" tab="聊天记录">
              <template #tab>
                <n-badge :value="closedConversations?.length" :max="99">
                  <span style="font-size: 12px;padding: 10px;">{{ '聊天记录' }}</span>        
                </n-badge>
              </template>
              <div style="padding: 12px;">
                <n-space vertical :size="12">
                  <n-button 
                    type="primary" 
                    block 
                    :disabled="!isConnected"
                    @click="refreshClosedConversations"
                  >
                    刷新已结束会话
                  </n-button>
                  
                  <n-spin :show="loadingClosed">
                    <div v-if="closedConversations.length === 0" class="empty-state">
                      <n-empty description="暂无已结束的会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="conv in closedConversations"
                        :key="conv.conversation_id"
                        size="small"
                        hoverable
                      >
                        <template #header>
                          <n-space align="center" justify="space-between">
                            <span style="font-size: 13px;">
                              📝 已结束
                            </span>
                            <n-tag type="default" size="small">
                              已关闭
                            </n-tag>
                          </n-space>
                        </template>
                        <n-space vertical :size="8">
                          <n-text depth="3" style="font-size: 12px;">
                            会话ID: {{ conv.conversation_id.slice(0, 8) }}...
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            用户ID: {{ conv.user_id }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            客服: {{ conv.human_name || '未分配' }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            关闭时间: {{ formatTime(conv.closed_at || conv.updated_at) }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            关闭原因: {{ conv.close_reason || '未知' }}
                          </n-text>
                          <n-button 
                            type="primary" 
                            size="small"
                            block
                            @click="viewConversationHistory(conv.conversation_id)"
                          >
                            查看聊天记录
                          </n-button>
                        </n-space>
                      </n-card>
                    </n-space>
                  </n-spin>
                </n-space>
              </div>
            </n-tab-pane>
          </n-tabs>
       </n-layout-sider>
        <!-- 右侧：聊天区域 -->
        <n-layout style="min-height: 600px;">
          <n-card v-if="!currentConversationId" style="height: 100%;">
            <n-empty description="请从左侧选择或接受一个会话" />
          </n-card>
          
          <div v-else style="height: 100%; display: flex; flex-direction: column;">
            <!-- 当前会话信息 -->
            <n-card size="small" style="margin-bottom: 12px;">
              <n-space align="center" justify="space-between">
                <n-space vertical :size="4">
                  <n-space align="center">
                    <n-text strong>{{ isHistoryView ? '历史会话' : '当前会话' }}</n-text>
                    <n-tag v-if="isHistoryView" type="warning" size="small">
                      只读
                    </n-tag>
                  </n-space>
                  <n-text depth="3" style="font-size: 12px;">
                    会话ID: {{ currentConversationId }}
                  </n-text>
                  <n-text depth="3" style="font-size: 12px;">
                    用户ID: {{ currentUserId }}
                  </n-text>
                </n-space>
                <n-button 
                  v-if="!isHistoryView"
                  type="error" 
                  @click="closeConversation"
                >
                  关闭会话
                </n-button>
              </n-space>
            </n-card>

            <!-- 聊天消息区域 -->
            <n-scrollbar class="chat-scroll" style="flex: 1;">
              <n-spin :show="loadingClosed && isHistoryView" size="large">
                <template #description>
                  正在加载历史聊天记录...
                </template>
                <div class="chat-container">
                  <!-- 空状态提示 -->
                  <div v-if="chatListData.length === 0 && !loadingClosed" class="empty-state">
                    <n-empty description="暂无聊天记录" />
                  </div>
                  
                  <!-- 聊天消息列表 -->
                  <div
                    v-for="(message, index) in chatListData"
                    :key="message.id || index"
                    class="chat-entry"
                  >
                   <div v-if="message.query" class="chat-message user">
                   <div class="chat-meta">
                      <n-avatar round size="medium" class="avatar-user">
                        用
                     </n-avatar>
                     <span class="chat-name">用户</span>
                      <span class="chat-time">{{ formatTimestamp(message.created_at) }}</span>
                   </div>
                   <div class="chat-bubble user">
                     <p class="chat-line">
                       {{ message.query }}
                     </p>
                   </div>
                 </div>
                 <div v-if="message.answer" class="chat-message ai">
                   <div class="chat-meta">
                      <n-avatar round size="medium" class="avatar-ai">
                        客
                     </n-avatar>
                     <span class="chat-name">客服</span>
                      <span class="chat-time">{{ formatTimestamp(message.created_at) }}</span>
                   </div>
                   <div class="chat-bubble ai">
                     <p class="chat-line">
                       {{ message.answer }}
                     </p>
                   </div>
                 </div>
                  </div>
                </div>
              </n-spin>
            </n-scrollbar>

            <!-- 消息输入区域 -->
            <div v-if="!isHistoryView" class="message-input-container">
               <n-input 
                 v-model:value="message" 
                 type="textarea" 
                 :rows="3"
                 placeholder="输入消息内容... (Enter 发送，Shift+Enter 换行)"
                  @keydown.enter.exact.prevent="sendMessage"
               />
               <n-space class="mt-2" justify="end">
                 <n-button 
                   type="primary" 
                   @click="sendMessage"
                  :disabled="!message.trim()"
                 >
                   发送
                 </n-button>
               </n-space>
             </div>
            <div v-else class="message-input-container">
              <n-alert type="info" :bordered="false">
                这是历史会话记录，无法发送新消息
              </n-alert>
            </div>
          </div>
         </n-layout>
       </n-layout>
   </n-space>
  </CommonPage>
 </template>
 <script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import { CommonPage } from '@/components';
import { useUserStore } from '@/stores';
import { io } from 'socket.io-client';
import dayjs from 'dayjs';
import { fetchUserinfoList,fetchChatList, fetchAIChatList } from "@/services";
// import { useMessage } from 'naive-ui';

const userStore = useUserStore();
// const $message = useMessage();
console.log(userStore)
// 基础状态
 const chatListData = ref([]);
const message = ref('');
const socket = ref(null);
const isConnected = ref(false);
const isOnline = ref(false);
const currentConversationId = ref('');
const currentUserId = ref('');
const isHistoryView = ref(false); // 标记是否正在查看历史记录

// 统计数据
const stats = ref({
  onlineUsers: 0,
  onlineHumans: 0,
  waitingQueue: 0,
  activeConversations: 0
});

// 等待队列
const waitingQueue = ref([]);
const loadingQueue = ref(false);

// 活跃会话
const activeConversations = ref([]);
const loadingActive = ref(false);

// 已结束会话
const closedConversations = ref([]);
const loadingClosed = ref(false);

// 会话聊天记录映射 { conversation_id: [...messages] }
const conversationHistories = ref({});

// 自动刷新定时器
let autoRefreshInterval = null;

// 配置
const SERVER_URL = 'https://agent.kaimen.site';
const APP_API_TOKEN = 'app-s8l0tNc5oPbHVJBeoLCXoPMg';

// REST API 调用函数
async function callApi(endpoint, method = 'GET', body = null) {
  const options = {
    method: method,
    headers: {
      'Authorization': `Bearer ${APP_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`, options);
    const data = await response.json();
    return { success: response.ok, data: data, status: response.status };
   } catch (error) {
    console.error(`API调用失败: ${error.message}`);
    // $message.error(`API调用失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// 刷新统计信息
async function refreshStats() {
  const result = await callApi('/console/api/human-service/stats');
  if (result.success) {
    stats.value.onlineUsers = result.data.online_users || 0;
    stats.value.onlineHumans = result.data.online_humans || 0;
    stats.value.waitingQueue = result.data.waiting_queue_length || 0;
    stats.value.activeConversations = result.data.active_conversations || 0;
    console.log('✅ 统计信息已更新');
  } else {
    console.error(`❌ 获取统计信息失败: ${result.status}`);
  }
}

// 刷新等待队列
async function refreshQueue() {
  loadingQueue.value = true;
  const result = await callApi('/console/api/human-service/queue');
  if (result.success) {
    waitingQueue.value = result.data.queue || [];
    console.log(waitingQueue.value)
    console.log(`✅ 队列已更新 (${waitingQueue.value.length}个等待)`);
  } else {
    console.error(`❌ 获取队列失败: ${result.status}`);
    // $message.error('获取队列失败');
  }
  loadingQueue.value = false;
  // 根据会话获取用户
}

// 刷新活跃会话列表
async function refreshActiveConversations() {
  loadingActive.value = true;
  const result = await callApi('/console/api/human-service/conversations?status=connected');
  
  if (result.success) {
    activeConversations.value = result.data.conversations || [];
    console.log(activeConversations.value)
    console.log(`✅ 活跃会话已更新 (${activeConversations.value.length}个)`);
  } else {
    console.error(`❌ 获取活跃会话失败: ${result.status}`);
    // $message.error('获取活跃会话失败');
  }
  loadingActive.value = false;
}

// 刷新已结束会话列表
async function refreshClosedConversations() {
  loadingClosed.value = true;
  const result = await callApi('/console/api/human-service/conversations?status=closed');
  
  if (result.success) {
    closedConversations.value = result.data.conversations || [];
    console.log(closedConversations.value)
    console.log(`✅ 已结束会话已更新 (${closedConversations.value.length}个)`);
  } else {
    console.error(`❌ 获取已结束会话失败: ${result.status}`);
  }
  loadingClosed.value = false;
}

// 刷新所有数据
async function refreshAll() {
  await Promise.all([
    refreshStats(),
    refreshQueue(),
    refreshActiveConversations(),
    refreshClosedConversations()
  ]);
  // $message.success('已刷新所有数据');
}

// 查看历史聊天记录（从API获取）
async function viewConversationHistory(conversationId) {
  // 查找会话信息
  /**
   * 
   */
  const conv = closedConversations.value.find(c => c.conversation_id === conversationId);
  const userId = conv?.user_id || 'unknown';
  
  // 设置当前会话信息
  currentConversationId.value = conversationId;
  currentUserId.value = userId;
  isHistoryView.value = true; // 标记为历史查看模式
  
  // 先检查内存缓存
  // if (conversationHistories.value[conversationId]) {
  //   chatListData.value = [...conversationHistories.value[conversationId]];
  //   console.log('从缓存加载历史记录:', conversationId);
  //   return;
  // }
  
  // 从API获取历史聊天记录
  try {
    console.log('从API获取历史记录:', conversationId, userId);
    loadingClosed.value = true;
    const aichat = await fetchAIChatList({conversation_id: conversationId,user:userId})
    console.log(aichat)
    const result = await fetchChatList({ 
      conversation_id: conversationId,
    });
    
    console.log('111',result)
  
      chatListData.value = aichat.data || result.messages;
      // 保存到缓存
      conversationHistories.value[conversationId] = [...result.messages];
      console.log('222',conversationHistories.value[conversationId])
  
  } catch (error) {
    console.error('❌ 获取历史记录失败:', error);
    chatListData.value = [];
  } finally {
    loadingClosed.value = false;
  }
}

// 时间格式化
function formatTime(timestamp) {
  if (!timestamp) return '-';
  return dayjs(timestamp * 1000).format('HH:mm:ss');
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
}

// 初始化 WebSocket 连接（客服端）
function connectSocket() {
  if (socket.value?.connected) {
    console.log('WebSocket 已连接，跳过重复连接');
    return;
  }

  if (socket.value) {
    try {
      socket.value.disconnect();
    } catch (e) {
      console.warn('断开旧连接失败:', e);
    }
    socket.value = null;
  }

  const NAMESPACE = '/v1/chat/human-service/human';
  console.log('[HumanService] 准备连接到客服端 Socket.IO...');
  
  socket.value = io(SERVER_URL + NAMESPACE, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    timeout: 20000,
  });

  // 连接成功
  socket.value.on('connect', () => {
    console.log('✅ [Human] Connected to server');
  
    // $message.success('WebSocket 连接成功');
    
    // 发送客服上线
    socket.value.emit('human_online', {
      type: 'human_online',
      data: {
        human_id: userStore.userInfo.user_id,
        human_name: userStore.userInfo.nickname,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
    
    // 开始自动刷新
    startAutoRefresh();
  });

  // 上线确认
  socket.value.on('human_online_ack', (data) => {
    console.log('✅ [Human] Online acknowledged:', data);
    const ackData = data?.data || data || {};
    isConnected.value = true;
    // $message.success(`上线成功，等待队列: ${ackData.waiting_count || 0} 个`);
    // 立即刷新数据
    refreshAll();
  });

  // 新会话通知
  socket.value.on('new_conversation', (data) => {
    console.log('🔔 [Human] New conversation waiting:', data);
    const convData = data?.data || {};
    // $message.info(`新用户等待接入: ${convData.user_id}`);
    // 刷新队列和统计
    refreshQueue();
    refreshStats();
  });

    // 接受会话确认
    socket.value.on('accept_conversation_ack', (data) => {
    console.log('✅ [Human] Conversation accepted:', data);
    const ackData = data?.data || data || {};
    if (ackData.conversation_id) {
      currentConversationId.value = ackData.conversation_id;
      currentUserId.value = ackData.user_id || 'unknown';
      isHistoryView.value = false; // 新接受的会话，不是历史查看
      // $message.success('会话已接受');
      // 清空聊天记录，准备接收新消息
      chatListData.value = [];
      // 初始化该会话的聊天记录
      if (!conversationHistories.value[ackData.conversation_id]) {
        conversationHistories.value[ackData.conversation_id] = [];
      }
      // 刷新队列和活跃会话
      refreshQueue();
      refreshStats();
      refreshActiveConversations();
    }
  });

  // 接收用户消息
  socket.value.on('user_message', (data) => {
    console.log('💬 [Human] Received message from user:', data);
    const msgData = data?.data || data || {};
    // 如果是当前会话的消息，添加到聊天列表
    if (msgData.conversation_id === currentConversationId.value) {
      addMessageToChatList({
        query: msgData.content || msgData.message_content || '',
        answer: '',
        created_at: msgData.timestamp || Math.floor(Date.now() / 1000),
        id: `msg_${Date.now()}`,
        isUser: true
      });
    }
  });

  // 会话关闭事件
  socket.value.on('conversation_closed', (data) => {
    console.log('🔔 [Human] Conversation closed:', data);
    const closeData = data?.data || data || {};
    if (closeData.conversation_id === currentConversationId.value) {
      // $message.warning(`会话已关闭: ${closeData.close_reason || '未知原因'}`);
      // 保存当前聊天记录到历史记录
      if (chatListData.value.length > 0) {
        conversationHistories.value[closeData.conversation_id] = [...chatListData.value];
        console.log('已保存聊天记录到历史:', closeData.conversation_id);
      }
      // 清空当前会话状态，但不清空 chatListData（保持显示）
      // currentConversationId.value = '';
      // currentUserId.value = '';
      // 如果想切换到已结束标签，可以保持 currentConversationId
    }
    // 刷新队列、统计、活跃会话和已结束会话
    refreshQueue();
    refreshStats();
    refreshActiveConversations();
    refreshClosedConversations();
  });

  // 错误处理
  socket.value.on('error', (data) => {
    console.error('❌ [Human] Error:', data);
    // $message.error(`错误: ${JSON.stringify(data)}`);
  });

  // 断开连接
  socket.value.on('disconnect', (reason) => {
    console.log('❌ [Human] Disconnected from server, reason:', reason);
    isConnected.value = false;
    // $message.error('WebSocket 连接断开');
    stopAutoRefresh();
  });

  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('❌ [Human] Connection error:', error);
    isConnected.value = false;
    // $message.error('WebSocket 连接错误');
  });
}

// 从队列接受会话
function acceptConversationFromQueue(conversationId, userId) {
  if (!socket.value?.connected || !isConnected.value) {
    // $message.error('请先连接 WebSocket');
    return;
  }

  console.log('接受会话:', conversationId);
  socket.value.emit('accept_conversation', {
    type: 'accept_conversation',
    data: {
      conversation_id: conversationId,
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
  
  currentConversationId.value = conversationId;
  currentUserId.value = userId;
  isHistoryView.value = false; // 活跃会话，不是历史查看
}

// 切换到指定会话
function switchToConversation(conversationId, userId) {
  if (!socket.value?.connected || !isConnected.value) {
    // $message.error('请先连接 WebSocket');
    return;
  }
  
  console.log('切换到会话:', conversationId);
  socket.value.emit('accept_conversation', {
    type: 'accept_conversation',
    data: {
      conversation_id: conversationId,
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
  
  currentConversationId.value = conversationId;
  currentUserId.value = userId;
  chatListData.value = [];
  isHistoryView.value = false; // 活跃会话，不是历史查看
  
  // 刷新活跃会话列表以更新高亮
  setTimeout(() => refreshActiveConversations(), 500);
}

// 关闭指定会话
function closeConversationById(conversationId) {
  if (!socket.value?.connected || !isConnected.value) {
    // $message.error('请先连接 WebSocket');
    return;
  }
  
  console.log('关闭会话:', conversationId);
  
  // 如果关闭的是当前会话，先保存聊天记录
  if (conversationId === currentConversationId.value && chatListData.value.length > 0) {
    conversationHistories.value[conversationId] = [...chatListData.value];
    console.log('已保存聊天记录到历史:', conversationId);
  }
  
  socket.value.emit('close_conversation', {
    type: 'close_conversation',
    data: {
      conversation_id: conversationId,
      close_reason: '客服主动关闭',
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
  
  // 如果关闭的是当前会话，不清空 chatListData（保持显示历史记录）
  // 只标记为已关闭状态
  if (conversationId === currentConversationId.value) {
    // 可以选择清空，也可以保持显示
    // currentConversationId.value = '';
    // currentUserId.value = '';
    // chatListData.value = [];
  }
  
  // 刷新列表
  setTimeout(() => {
    refreshActiveConversations();
    refreshQueue();
    refreshStats();
    refreshClosedConversations();
  }, 500);
}

// 关闭当前会话
function closeConversation() {
  if (!currentConversationId.value) {
    // $message.error('没有活跃的会话');
      return;
    }
  
  closeConversationById(currentConversationId.value);
}

// 发送消息
function sendMessage() {
  if (!currentConversationId.value) {
    // $message.error('请先选择一个会话');
      return;
  }

  if (!socket.value?.connected || !isConnected.value) {
    // $message.error('WebSocket 未连接');
    return;
  }

  const messageToSend = message.value.trim();
  
  if (!messageToSend) {
    // $message.error('消息内容不能为空');
    return;
  }
  
  // 先添加到聊天列表（乐观更新）
  addMessageToChatList({
    query: '',
    answer: messageToSend,
    created_at: Math.floor(Date.now() / 1000),
    id: `msg_${Date.now()}`,
    isUser: false
  });

  // 发送消息
  socket.value.emit('human_message', {
    type: 'human_message',
    data: {
      conversation_id: currentConversationId.value,
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
  let newMessage;
  
  if (messageData.isUser) {
    newMessage = {
      query: messageData.query,
      answer: '',
      created_at: messageData.created_at,
      id: messageData.id
    };
    chatListData.value.push(newMessage);
  } else {
    const lastItem = chatListData.value[chatListData.value.length - 1];
    if (lastItem && lastItem.query && !lastItem.answer) {
      lastItem.answer = messageData.answer;
      lastItem.created_at = messageData.created_at;
      newMessage = lastItem;
    } else {
      newMessage = {
        query: '',
        answer: messageData.answer,
        created_at: messageData.created_at,
        id: messageData.id
      };
      chatListData.value.push(newMessage);
    }
  }
  
  // 同时更新到历史记录
  if (currentConversationId.value) {
    if (!conversationHistories.value[currentConversationId.value]) {
      conversationHistories.value[currentConversationId.value] = [];
    }
    conversationHistories.value[currentConversationId.value] = [...chatListData.value];
  }
  
  // 滚动到底部
  nextTick(() => {
    const scrollbar = document.querySelector('.chat-scroll .n-scrollbar-content');
    if (scrollbar) {
      scrollbar.scrollTop = scrollbar.scrollHeight;
    }
  });
}

// 自动刷新
function startAutoRefresh() {
  if (autoRefreshInterval) return;
  
  autoRefreshInterval = setInterval(() => {
    if (socket.value?.connected) {
      refreshStats();
      refreshQueue();
      refreshActiveConversations();
    }
  }, 5000); // 每5秒刷新一次
  
  console.log('🔄 已启动自动刷新 (5秒/次)');
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('⏸ 已停止自动刷新');
  }
}

// 断开 WebSocket 连接
function disconnectSocket() {
  if (!socket.value) {
    // $message.warning('WebSocket 未连接');
    return;
  }

  try {
    // 如果已连接，先发送客服下线通知
    if (socket.value.connected && isConnected.value) {
      socket.value.emit('human_offline', {
        type: 'human_offline',
        data: {
          timestamp: Math.floor(Date.now() / 1000)
        }
      });
    }
    
    socket.value.disconnect();
    // $message.success('已断开连接');
  } catch (e) {
    console.warn('断开连接失败:', e);
  } finally {
    socket.value = null;
    isConnected.value = false;
    currentConversationId.value = '';
    currentUserId.value = '';
    chatListData.value = [];
    stopAutoRefresh();
  }
}

// 组件挂载
onMounted(() => {
  // 自动连接（可选）
  connectSocket();
});

// 组件卸载时断开连接
onUnmounted(() => {
  disconnectSocket();
});
 
 
 </script>
 
 <style scoped>
.empty-state {
  padding: 20px;
  text-align: center;
 }

 .chat-scroll {
   padding: 16px;
 }
 
 .chat-container {
   display: flex;
   flex-direction: column;
   gap: 16px;
  padding: 20px;
  min-height: 300px;
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
  color: rgb(55, 51, 51);
   margin-bottom: 6px;
 }
 
 .chat-name {
   font-weight: 600;
}
 
.chat-time {
  color: #999;
  font-size: 11px;
 }
 
 .chat-bubble {
   max-width: 520px;
  border-radius: 8px;
  padding: 12px 16px;
   line-height: 1.6;
   font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
 }
 
 .chat-bubble.ai {
   background: #ecf5ff;
   color: #1d7dfa;
 }
 
 .chat-bubble.user {
   background: #f0f9eb;
   color: #3a7b4f;
 }

.chat-line {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
 }
 
 .chat-line + .chat-line {
   margin-top: 4px;
 }
 
 .avatar-user {
  background-color: #67c23a;
   color: #fff;
 }
 
 .avatar-ai {
  background-color: #409eff;
   color: #fff;
 }

.message-input-container {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-top: 1px solid #e4e7ed;
}

.mt-2 {
  margin-top: 8px;
}

/* 侧边栏滚动条样式 */
:deep(.n-scrollbar-content) {
  padding: 12px;
 }
 </style>