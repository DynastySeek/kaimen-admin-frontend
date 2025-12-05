<template>
  <CommonPage>
    <n-space vertical :size="16" style="margin-top: 16px;">
       <n-layout has-sider>
        <!-- 左侧：等待队列 + 活跃会话列表 -->
         <n-layout-sider
         bordered
         show-trigger
         collapse-mode="width"
          :collapsed-width="0"
          :width="360"
         :native-scrollbar="true"
         style="height: calc(100vh - 240px);"
        >
          <n-collapse animated >
            <n-collapse-item  name="setting" title="设置">
              <n-space  vertical :size="16">
             <n-button round :type="isConnected ? 'info' : 'error'" @click="isConnected?disconnectSocket():connectSocket()">
              {{ isConnected ? '✅ 已上线' : '❌ 未上线' }}
             </n-button>
             <n-button 
             round
              type="info" 
              :disabled="!isConnected"
              @click="refreshAll"
            >
              一键刷新
            </n-button>
            <n-badge :value="queueState.waitingQueue?.length" :max="99">
              <n-button
              round
              type="info" 
              :disabled="!isConnected||queueState.waitingQueue.length===0"
              @click="closeAll"
            >一键关闭会话</n-button>
          </n-badge>
          <n-button round
          type="info"  @click="()=>globalSound=!globalSound">{{ globalSound ? "已开启声音" : "已关闭声音" }}</n-button>

         
          </n-space>
            </n-collapse-item>
            <n-collapse-item  name="queue" title="新消息">
              <template #header>
                <n-badge :value="queueState.waitingQueue?.length" :max="99">
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
                  <n-spin :show="loadingState.loadingQueue">
                    <div v-if="queueState.waitingQueue.length === 0" class="empty-state">
                      <n-empty description="暂无等待中的会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="item in queueState.waitingQueue"
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
                            首条: {{ item.first_message || '请求接入客服' }}
                          </n-text>
                          <n-button 
                            type="warning" 
                            size="small"
                            block
                            @click="isHistoryView = false;acceptConversationFromQueue(item.conversation_id, item.user_id)"
                          >
                            接受会话
                          </n-button>
                        </n-space>
                      </n-card>
                    </n-space>
                  </n-spin>
                </n-space>
              </div>
            </n-collapse-item >
            <n-collapse-item  name="active" title="处理中">
              <template #header>
                <n-badge :value="queueState.activeConversations?.length" :max="99">
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
                  
                  <n-spin :show="loadingState.loadingActive">
                    <div v-if="queueState.activeConversations.length === 0" class="empty-state">
                      <n-empty description="暂无活跃会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="conv in queueState.activeConversations"
                        :key="conv.conversation_id"
                        size="small"
                        hoverable
                        :bordered="conv.conversation_id === baseInfo.currentConversationId"
                        :style="conv.conversation_id === baseInfo.currentConversationId ? 'border: 2px solid #18a058;' : ''"
                      >
                      <template #header>
                          <n-space align="center" justify="space-between">
                            <span style="font-size: 13px;">
                              {{ conv.conversation_id === baseInfo.currentConversationId ? '⭐ 当前会话' : '💬 活跃' }}
                            </span>
                            <n-tag 
                              v-if="conv.conversation_id === baseInfo.currentConversationId" 
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
                            <!-- 用户ID: {{ conv.user_id }} -->
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            <!-- 客服: {{ conv.human_name || '未分配' }} -->
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            连接时间: {{ formatTime(conv.connected_at) }}
                          </n-text>
                          <n-space>
                            <n-button 
                              v-if="conv.conversation_id !== baseInfo.currentConversationId"
                              type="info" 
                              size="small"
                              @click="isHistoryView = false;switchToConversation(conv.conversation_id, conv.user_id)"
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
            </n-collapse-item >

            <!-- 已结束会话标签 -->
            <n-collapse-item  name="closed" title="聊天记录">
              <template #header>
                <!-- <n-badge :value="queueState.closedConversations?.length" :max="99"> -->
                  <span style="font-size: 12px;padding: 10px;">{{ '用户聊天记录' }}</span>        
                <!-- </n-badge> -->
               </template>
              <div style="padding: 12px;">
                <n-space style="margin: 20px;">
                  <n-input v-model:value="searchKeyword" placeholder="用户id" />
                  <n-button type="primary" @click="queueState.closedConversations=[];refreshClosedConversations()">搜索</n-button>

                </n-space>

                <n-space vertical :size="12">
                  <!-- <n-button 
                    type="primary" 
                    block 
                    :disabled="!isConnected"
                    @click="refreshClosedConversations"
                  >
                    刷新已结束会话
                  </n-button> -->
                  
                  <n-spin :show="loadingState.loadingClosed">
                    <div v-if="queueState.closedConversations.length === 0" class="empty-state">
                      <n-empty description="暂无已结束的会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="conv in queueState.closedConversations"
                        :key="conv.id"
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
                            会话ID: {{ conv.id.slice(0, 8) }}...
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            用户ID: {{ searchKeyword }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            <!-- 客服: {{ conv.human_name || '未分配' }} -->
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            <!-- 关闭时间: {{ formatTime(conv.closed_at || conv.updated_at) }} -->
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            <!-- 关闭原因: {{ conv.close_reason=="close_reason"?'用户主动结束会话':'客服主动结束会话' }} -->
                          </n-text>
                          <n-button 
                            type="primary" 
                            size="small"
                            block
                            @click="isHistoryView = true;viewConversationHistory(conv.id,searchKeyword)"
                          >
                            查看聊天记录
                          </n-button>
                        </n-space>
                      </n-card>
                      <div v-if="hasmore" style="width: 100%;display: flex;justify-content: center;">
                        <n-button type="info" @click="refreshClosedConversations(queueState.closedConversations[queueState.closedConversations.length-1].id)">加载更多</n-button>
                      </div>
                    </n-space>
                   </n-spin>
                </n-space>
              </div>
            </n-collapse-item >
           
          </n-collapse>
   
          
       </n-layout-sider>
        <!-- 右侧：聊天区域 -->
        <n-layout style="height: calc(100vh - 240px);">
          <n-card v-if="!baseInfo.currentConversationId" style="height: 100%;">
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
                    会话ID: {{ baseInfo.currentConversationId }}
                  </n-text>
                  <n-text depth="3" style="font-size: 12px;">
                    用户ID: {{ baseInfo.currentUserId }}
                  </n-text>
                </n-space>
                <n-button 
                  v-if="!isHistoryView"
                  type="error" 
                  :disabled="baseInfo.isConversationClosed "
                  @click="closeConversation(baseInfo.currentConversationId)"
                >
                  {{ baseInfo.isConversationClosed ? '会话已结束' : '结束会话' }}
                </n-button>
              </n-space>
            </n-card>

            <!-- 聊天消息区域 -->
            <n-scrollbar class="chat-scroll"  ref="chatScrollbarRef" c style="flex: 1;" >
              <n-spin :show="loadingState.loadingClosed && isHistoryView" size="large">
                <template #description>
                  正在加载历史聊天记录...
                </template>
                <div class="chat-container">
                  <!-- 空状态提示 -->
                  <div v-if="baseInfo.chatListData.length === 0" class="empty-state">
                    <n-empty description="暂无聊天记录" />
                  </div>
            
                  <!-- 聊天消息列表 -->
               <div
                 v-for="(message, index) in baseInfo.chatListData"
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
                        {{ 
                        message.from_source=='api'?'AI':userStore.userInfo.nickname?.slice(0,1)
                        }}
                     </n-avatar>
                     <span class="chat-name">{{  message.from_source=='api'?'AI':userStore.userInfo.nickname}}</span>
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
                 :rows="1"
                 placeholder="输入消息内容... (Enter 发送，Shift+Enter 换行)"
                  @keydown.enter.exact.prevent="sendMessage"
               />
               <n-button 
                  style="margin-left: 10px;"
                  type="primary" 
                  @click="sendMessage"
                  :disabled="!message.trim()"
                 >
                   发送
                 </n-button>
             </div>
            <div v-else  class="message-input-container">
              <n-alert type="info" :bordered="false" style="width: 100%;">
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
import { fetchChatList, closeAllConversation, userConversatioList } from "@/services";
import { reactive } from 'vue';
import audio from "@/assets/new_message.mp3";
import { useNotification } from 'naive-ui'
import { has } from 'lodash-es';
const notification = useNotification()
let globalSound = ref(true);
const active = ref(false)
function createMessage(text) {
  notification["success"]({
    content: '通知',
    meta: text,
    duration: 5000,
    keepAliveOnHover: true
  })
}
const notifyAudio = new Audio(audio);
function playNotifySound(status) {
  if(globalSound.value){
    notifyAudio.currentTime = 0;
    status?notifyAudio.play():notifyAudio.pause();
  }
}

const userStore = useUserStore();
// ==================== 服务配置 ====================
const SERVER_URL = 'https://agent.kaimen.site'; // WebSocket 服务器地址
const APP_API_TOKEN = 'app-s8l0tNc5oPbHVJBeoLCXoPMg'; // API 认证 Token

// ==================== WebSocket 连接状态 ====================
const socket = ref(null); // Socket.IO 实例
const isConnected = ref(false); // WebSocket 连接状态
const chatScrollbarRef = ref(null)
const closeReason = ref(null);
const baseInfo = reactive({
  currentUserId: null,
  currentConversationId:null,
  chatListData:[],
  isConversationClosed: false // 当前会话是否已关闭

})

// ==================== 当前会话状态 ====================
// const currentConversationId = ref(''); // 当前活跃的会话ID
// const currentUserId = ref(''); // 当前会话的用户ID
const isHistoryView = ref(false); // 是否正在查看历史记录（只读模式）
// const chatListData = ref([]); // 当前会话的聊天消息列表
const message = ref(''); // 消息输入框内容

// ==================== 队列和会话列表 ====================
const queueState = reactive({
  waitingQueue:[],
  activeConversations:[],
  closedConversations:[]
})
// const waitingQueue = ref([]); // 等待队列列表
// const activeConversations = ref([]); // 活跃会话列表
// const closedConversations = ref([]); // 已结束会话列表

const loadingState = reactive({
  loadingQueue:false,
  loadingActive:false,
  loadingClosed:false
})
// ==================== 加载状态 ====================
// const loadingQueue = ref(false); // 等待队列加载状态
// const loadingActive = ref(false); // 活跃会话加载状态
// const loadingClosed = ref(false); // 已结束会话加载状态

// ==================== 统计数据 ====================
// const stats = ref({
//   onlineUsers: 0, // 在线用户数
//   onlineHumans: 0, // 在线客服数
//   waitingQueue: 0, // 等待队列数量
//   activeConversations: 0 // 活跃会话数量
// });

// ==================== 定时器 ====================
let autoRefreshInterval = null; // 自动刷新定时器

// ==================== API 调用函数 ====================

/**
 * 统一的 REST API 调用函数
 * @param {string} endpoint - API 端点
 * @param {string} method - HTTP 方法 (GET/POST/PUT/DELETE)
 * @param {object} body - 请求体数据
 * @returns {Promise<{success: boolean, data: any, status: number}>}
 */
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
    return { success: false, error: error.message };
  }
}

async function closeAll() {
  const result = await closeAllConversation()
  if (result.success) {
    $message.success('已结束所有会话')
  } else {
    console.error(`❌ 获取已结束会话失败: ${result.status}`);
  }
}

// ==================== 数据刷新函数 ====================

/**
 * 刷新系统统计信息
 * 包括：在线用户数、在线客服数、等待队列数、活跃会话数
 */
async function refreshStats() {
  const result = await callApi('/console/api/human-service/stats');
  // if (result.success) {
  //   stats.value.onlineUsers = result.data.online_users || 0;
  //   stats.value.onlineHumans = result.data.online_humans || 0;
  //   stats.value.waitingQueue = result.data.waiting_queue_length || 0;
  //   stats.value.activeConversations = result.data.active_conversations || 0;
  // } else {
  //   console.error(`❌ 获取统计信息失败: ${result.status}`);
  // }
}

/**
 * 刷新等待队列列表
 * 获取所有等待接入的用户会话
 */
async function refreshQueue() {

  loadingState.loadingQueue = true;
  const result = await callApi('/console/api/human-service/queue');
  if (result.success) {
    queueState.waitingQueue = result.data.queue || [];
  } else {
    console.error(`❌ 获取队列失败: ${result.status}`);
  }
  loadingState.loadingQueue = false;
}

/**
 * 刷新活跃会话列表
 * 获取所有正在进行中的客服会话
 */
async function refreshActiveConversations() {
  loadingState.loadingActive = true;
  const result = await callApi('/console/api/human-service/conversations?status=connected');
  
  if (result.success) {
    queueState.activeConversations = result.data.conversations || [];
  } else {
    console.error(`❌ 获取活跃会话失败: ${result.status}`);
  }
  loadingState.loadingActive = false;
}

/**
 * 刷新已结束会话列表
 * 获取所有已关闭的历史会话
 */
const searchKeyword = ref('');
const hasmore = ref(true);
const lastid = ref(null);
async function refreshClosedConversations() {
  // loadingState.loadingClosed = true;
  const params = {
    user: searchKeyword.value,
    last_id: lastid.value
  }
  const result = await userConversatioList(params);
  if (result) {
    queueState.closedConversations = [...queueState.closedConversations, ...result.data] || [];
    lastid.value = result.data[result.data?.length-1]?.id;
    hasmore.value = result.has_more;
    // loadingState.loadingClosed = false;
  } else {
    console.error(`❌ 获取已结束会话失败: ${result.status}`);
  }

}

/**
 * 刷新所有数据
 * 并行刷新统计、队列、活跃会话和已结束会话
 */
async function refreshAll() {
  await Promise.all([
    refreshStats(),
    refreshQueue(),
    refreshActiveConversations(),
    // refreshClosedConversations()
  ]);
}

// ==================== 历史记录查看 ====================

/**
 * 滚动聊天区域到底部
 * 用于在加载历史记录或添加新消息后自动滚动到底部
 */
function scrollToBottom(event) {
  nextTick(() => {
    requestAnimationFrame(() => {
      const scrollContent = document.querySelector('.n-scrollbar-content')
      chatScrollbarRef.value?.scrollTo({
          top:scrollContent.scrollHeight || 10000,
          behavior: 'smooth'
        })
    });
  });
}

/**
 * 查看历史聊天记录
 * 从 API 获取指定会话的历史消息
 * @param {string} conversationId - 会话ID
 * @param {string} user - 用户ID
 */
async function viewConversationHistory(conversationId, user) {
  baseInfo.isConversationClosed = false
  baseInfo.chatListData = []
  // const conv = queueState.closedConversations.find(c => c.conversation_id === conversationId);
  // const userId = conv?.user_id || user || 'unknown';
  baseInfo.currentConversationId = conversationId;
  baseInfo.currentUserId = user;
  // 从API获取历史聊天记录
  try {
    loadingState.loadingClosed = true;
    const result = await fetchChatList({ 
      conversation_id: conversationId,
      user_id: user,
    });
    baseInfo.chatListData = result?.data||[];
  console.log('2222', baseInfo.chatListData);
   } catch (error) {
    console.error('❌ 获取历史记录失败:', error);
    baseInfo.chatListData = [];
  } finally {
    loadingState.loadingClosed = false;
  }

  scrollToBottom();
}

// ==================== 工具函数 ====================

/**
 * 格式化时间戳为时分秒
 * @param {number} timestamp - Unix 时间戳（秒）
 * @returns {string} 格式化后的时间字符串 (HH:mm:ss)
 */
function formatTime(timestamp) {
  if (!timestamp) return '-';
  return dayjs(timestamp * 1000).format('HH:mm:ss');
}

/**
 * 格式化时间戳为完整日期时间
 * @param {number} timestamp - Unix 时间戳（秒）
 * @returns {string} 格式化后的日期时间字符串 (YYYY-MM-DD HH:mm:ss)
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  return dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss');
}

// ==================== WebSocket 连接管理 ====================

/**
 * 初始化 WebSocket 连接
 * 连接到客服端 Socket.IO 服务器并设置事件监听
 */
function connectSocket() {
  if (socket.value?.connected) {
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
    // 发送客服上线
    socket.value.emit('human_online', {
      type: 'human_online',
      data: {
        human_id: userStore.userInfo.user_id,
        human_name: userStore.userInfo.nickname,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
1
    // 开始自动刷新
    startAutoRefresh();
  });

  // 上线确认
  socket.value.on('human_online_ack', (data) => {
    isConnected.value = true;
    refreshAll();
  });

  // 新会话通知
  socket.value.on('new_conversation', (data) => {
    playNotifySound(true)
    refreshQueue();
    refreshStats();
  });
    // 接受会话确认
    socket.value.on('accept_conversation_ack', (data) => {
      refreshQueue();
      refreshStats();
      refreshActiveConversations();
    // }
  });



  // 接收用户消息
  socket.value.on('user_message', (data) => {
    playNotifySound(true);
    const msgData = data?.data || data || {};
    // 如果是当前会话的消息，添加到聊天列表
    if (msgData.conversation_id === baseInfo.currentConversationId) {
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
    closeReason.value = data.data.close_reason=="user_disconnected"?`会话id:${data.data.conversation_id}用户主动关闭会话`:'会话已结束'
    if(closeReason.value){
      createMessage(closeReason.value)
    }
    refreshQueue();
    refreshStats();
    refreshActiveConversations();
    // refreshClosedConversations();
  });

  // 错误处理
  socket.value.on('error', (data) => {
    console.error('❌ [Human] Error:', data);
  });

  // 断开连接
  socket.value.on('disconnect', (reason) => {
    console.log('res',reason)
    isConnected.value = false;
    stopAutoRefresh();
  });

  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('❌ [Human] Connection error:', error);
    isConnected.value = false;
  });
}

// ==================== 会话操作函数 ====================

/**
 * 从等待队列接受会话
 * @param {string} conversationId - 会话ID
 * @param {string} userId - 用户ID
 */
function acceptConversationFromQueue(conversationId, userId) {
  if (!socket.value?.connected || !isConnected.value) return;
  socket.value.emit('accept_conversation', {
    type: 'accept_conversation',
    data: {
      conversation_id: conversationId,
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
  // 第一次进入聊天窗口
  baseInfo.currentConversationId = conversationId;
  baseInfo.currentUserId = userId;
  viewConversationHistory(conversationId,userId)
}

/**
 * 切换到指定的活跃会话
 * @param {string} conversationId - 会话ID
 * @param {string} userId - 用户ID
 */
function switchToConversation(conversationId, userId) {
  if (!socket.value?.connected || !isConnected.value) return;
  socket.value.emit('accept_conversation', {
    type: 'accept_conversation',
    data: {
      conversation_id: conversationId,
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
  baseInfo.currentConversationId = conversationId;
  baseInfo.currentUserId = userId;
  viewConversationHistory(conversationId, userId);
  setTimeout(() => refreshActiveConversations(), 500);
}

/**
 * 关闭指定的会话
 * @param {string} conversationId - 要关闭的会话ID
 */
function closeConversationById(conversationId) {
  if (!socket.value?.connected || !isConnected.value) return;
  socket.value.emit('close_conversation', {
    type: 'close_conversation',
    data: {
      conversation_id: conversationId,
      close_reason: '客服主动关闭',
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
  
  setTimeout(() => {
    refreshActiveConversations();
    refreshQueue();
    refreshStats();
    // refreshClosedConversations();
  }, 500);
}

/**
 * 关闭当前正在处理的会话
 */
function closeConversation(conversationId) {
  closeConversationById(conversationId);
  baseInfo.isConversationClosed = true;
}

// ==================== 消息处理函数 ====================

/**
 * 发送消息给用户
 * 通过 WebSocket 发送客服消息并更新本地聊天列表
 */
function sendMessage() {
  if (!baseInfo.currentConversationId) return;
  if (!socket.value?.connected || !isConnected.value) return;

  const messageToSend = message.value.trim();
  if (!messageToSend) return;
  
  addMessageToChatList({
    query: '',
    answer: messageToSend,
    created_at: Math.floor(Date.now() / 1000),
    id: `msg_${Date.now()}`,
    isUser: false
  });

  socket.value.emit('human_message', {
    type: 'human_message',
    data: {
      conversation_id: baseInfo.currentConversationId,
      message_content: messageToSend,
      message_type: 'text',
      timestamp: Math.floor(Date.now() / 1000)
    }
  });

  message.value = '';
}

/**
 * 添加消息到聊天列表
 * 根据消息类型（用户/客服）更新聊天记录并自动滚动
 * @param {Object} messageData - 消息数据
 * @param {string} messageData.query - 用户消息内容
 * @param {string} messageData.answer - 客服消息内容
 * @param {number} messageData.created_at - 消息时间戳
 * @param {string} messageData.id - 消息ID
 * @param {boolean} messageData.isUser - 是否为用户消息
 */
function addMessageToChatList(messageData) {
  if (messageData.isUser) {
    baseInfo.chatListData.push({
      query: messageData.query,
      answer: '',
      created_at: messageData.created_at,
      id: messageData.id
    });
  } else {
    const lastItem = baseInfo.chatListData[baseInfo.chatListData.length - 1];
    if (lastItem && lastItem.query && !lastItem.answer) {
      lastItem.answer = messageData.answer;
      lastItem.created_at = messageData.created_at;
    } else {
      baseInfo.chatListData.push({
        query: '',
        answer: messageData.answer,
        created_at: messageData.created_at,
        id: messageData.id
      });
    }
  }
  
  scrollToBottom();
}


// ==================== 自动刷新管理 ====================

/**
 * 启动自动刷新定时器
 * 每5秒自动刷新统计、队列和活跃会话数据
 */
function startAutoRefresh() {
  if (autoRefreshInterval) return;
  
  autoRefreshInterval = setInterval(() => {
    if (socket.value?.connected) {
      refreshStats();
      refreshQueue();
      refreshActiveConversations();
    }
  }, 5000); // 每5秒刷新一次
}

/**
 * 停止自动刷新定时器
 */
function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

/**
 * 断开 WebSocket 连接
 * 发送下线通知并清理所有状态
 */
function disconnectSocket() {
  if (!socket.value) return;

  try {
    if (socket.value.connected && isConnected.value) {
      socket.value.emit('human_offline', {
        type: 'human_offline',
        data: {
          timestamp: Math.floor(Date.now() / 1000)
        }
      });
    }
    
    socket.value.disconnect();
  } catch (e) {
    console.warn('断开连接失败:', e);
  } finally {
    socket.value = null;
    isConnected.value = false;
    baseInfo.currentConversationId = '';
    baseInfo.currentUserId = '';
    stopAutoRefresh();
  }
}

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载时自动连接 WebSocket
 */
onMounted(() => {
  connectSocket();
});

/**
 * 组件卸载时断开 WebSocket 连接
 */
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
   overflow: auto;
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
  display: flex;
  align-items: center;
  /* background: #f5f7fa; */
  border-radius: 8px;
  /* border-top: 1px solid #e4e7ed; */
}

.mt-2 {
  margin-top: 8px;
}

/* 侧边栏滚动条样式 */
:deep(.n-scrollbar-content) {
  padding: 12px;
 }
 </style>