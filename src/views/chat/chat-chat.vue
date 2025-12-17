<template>
  <CommonPage>
    <n-space vertical :size="16" style="margin-top: 16px;">
      <n-space>💡 提示: 请点击页面任意位置以解锁提示音播放</n-space>
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
          <n-collapse animated @item-header-click="(item)=>{
            expandedName = item.name
            }">
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
              @click="closeAll"
            >一键关闭会话</n-button>
          </n-badge>
          <n-button round
          type="info"  @click="()=>globalSound=!globalSound">{{ globalSound ? "已开启声音" : "已关闭声音" }}</n-button>
          </n-space>
            </n-collapse-item>
            <n-collapse-item  name="message" title="新消息">
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
                      <n-badge 
                        :value="conversationsWithNewMessages.has(item.conversation_id) ? '新' : null"
                        :show-zero="false"
                        :max="99"
                        :offset="[8, 8]"
                        v-for="item in queueState.waitingQueue"
                        :key="item.conversation_id"
                      >
                        <n-card
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
                      </n-badge>
                    </n-space>
                  </n-spin>
                </n-space>
              </div>
            </n-collapse-item >
            <n-collapse-item name="connect" title="处理中">
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
                      <n-badge 
                        :value="conversationsWithNewMessages.has(conv.conversation_id) ? '新' : null"
                        :show-zero="false"
                        :max="99"
                        :offset="[8, 8]"
                        v-for="conv in queueState.activeConversations"
                        :key="conv.conversation_id"
                      >
                        <n-card
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
                            用户ID: {{ conv.user_id }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            <!-- 客服: {{ conv.human_name || '未分配' }} -->
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            连接时间: {{ formatTime(conv.connected_at) }}
                          </n-text>
                          <n-space>
                            <n-button 
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
                      </n-badge>
                    </n-space>
                  </n-spin>
                </n-space>
              </div>
            </n-collapse-item>
            <!-- 已结束会话标签 -->
            <n-collapse-item  name="chat" title="聊天记录">
              <template #header>
                <span style="font-size: 12px;padding: 10px;">{{ '聊天记录' }}</span>        
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
                  <n-spin :show="loadingState.loadingClosed">
                    <div v-if="queueState.closedConversations.length === 0" class="empty-state">
                      <n-empty description="暂无已结束的会话" />
                    </div>
                    <n-space v-else vertical :size="12">
                      <n-card
                        v-for="conv in queueState.closedConversations"
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
                            <!-- 客服: {{ conv.human_name || '未分配' }} -->
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            关闭时间: {{ formatTime(conv.closed_at || conv.updated_at) }}
                          </n-text>
                          <n-text depth="3" style="font-size: 12px;">
                            关闭原因: {{ conv.close_reason=="close_reason"?'用户主动结束会话':'客服主动结束会话' }}
                          </n-text>
                          <n-button 
                            type="primary" 
                            size="small"
                            block
                            @click="isHistoryView = true;viewConversationHistory(conv.conversation_id,conv.user_id)"
                          >
                            查看聊天记录
                          </n-button>
                        </n-space>
                      </n-card>
                    </n-space>
                   </n-spin>
                </n-space>
              </div>
            </n-collapse-item >
            <n-collapse-item  name="user" title="用户聊天记录">
              <template #header>
                <span style="font-size: 12px;padding: 10px;">{{ '用户聊天记录' }}</span>        
              </template>
              <div style="padding: 12px;">
                <n-space vertical :size="12">
                  <n-space style="margin: 20px;">
                  <n-input v-model:value="searchKeyword" placeholder="用户id" />
                  <n-button type="primary" @click="refreshUserConversations('init')">搜索</n-button>
                </n-space>
                </n-space>
              </div>
            </n-collapse-item >
          </n-collapse> 
       </n-layout-sider>
        <!-- 右侧：聊天区域 -->
        <n-layout style="height: calc(100vh - 240px);">
          <n-card v-if="!baseInfo.currentConversationId&&expandedName!=='user'" style="height: 100%;">
            <n-empty description="请从左侧选择或接受一个会话" />
          </n-card>
          <div  style="height: 100%; display: flex; flex-direction: column;">
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
                    {{ baseInfo.currentConversationId && `会话ID: ${baseInfo.currentConversationId}` }}
                  </n-text>
                  <n-text depth="3" style="font-size: 12px;">
                    用户ID: {{ baseInfo.currentUserId }}
                  </n-text>
                </n-space>
                <n-button 
                  v-if="!isHistoryView&&expandedName!=='user'"
                  type="error" 
                  :disabled="baseInfo.isConversationClosed "
                  @click="closeConversation(baseInfo.currentConversationId)"
                >
                  {{ baseInfo.isConversationClosed ? '会话已结束' : '结束会话' }}
                </n-button>
              </n-space>
            </n-card>
            <!-- 聊天消息区域 -->
            <n-scrollbar class="chat-scroll"  ref="chatScrollbarRef"  style="flex: 1;" @mouseup="handleMouseUp" @mousedown="handleMouseDown">
              <n-spin :show="loadingState.loadingClosed && isHistoryView" size="large">
                <template #description>
                  正在加载历史聊天记录...
                </template>
                <div class="chat-container">
                  <!-- 空状态提示 -->
                  <div v-if="baseInfo.chatListData.length === 0 && !loadingState.loadingClosed" class="empty-state">
                    <n-empty description="暂无聊天记录" />
                  </div>
                  <!-- 聊天消息列表 -->
               <div
                 v-for="(message, index) in baseInfo.chatListData"
                 :key="message.id || index"
                 :id="`message-${index}`"
                 class="chat-entry"
               >
                   <div v-if="message.query||message.from_=='user'" class="chat-message user">
                   <div class="chat-meta">
                      <n-avatar round size="medium" class="avatar-user">
                        用
                     </n-avatar>
                     <span class="chat-name">用户</span>
                      <span class="chat-time">{{ formatTimestamp(message.created_at) }}</span>
                   </div>
                   <div class="chat-bubble user">
                     <p class="chat-line">
                       {{ message.query|| message.content }}
                     </p>
                   </div>
                 </div>
                 <div v-if="message.answer||message.from_=='human'" class="chat-message ai">
                   <div class="chat-meta">
                      <n-avatar round size="medium" class="avatar-ai">
                        {{ 
                        message.from_source=='api'?'AI':'客服'
                        }}
                     </n-avatar>
                     <span class="chat-name">{{  message.from_source=='api'?'AI':'客服'}}</span>
                      <span class="chat-time">{{ formatTimestamp(message.created_at) }}</span>
                   </div>
                   <div class="chat-bubble ai">
                     <p class="chat-line">
                       {{ message.answer || message.content   }}
                     </p>
                   </div>
                 </div>
               </div>
               <!-- <div v-if="hasmore&&expandedName==='user'" style="width: 100%;display: flex;justify-content: center;">
                <n-button type="tertiary" @click="refreshUserConversations">加载更多</n-button>
              </div> -->
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
import {  userChatAllHistoryList, conversationChatHistoryList,queueChatList, statsChatList, conversationsChatList, closeChatAllConversation} from "@/services";
import { reactive, watch } from 'vue';
import audio from "@/assets/new_message.mp3";
import { useNotification } from 'naive-ui'
import { ConnectionSend } from '@vicons/carbon';
import { lStorage } from '@/utils/modules/storage';
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
// 音频对象，每次播放时重新创建以确保刷新后也能正常播放
let notifyAudio = null;
let audioUnlocked = false; // 音频是否已解锁（通过用户交互）

/**
 * 初始化音频对象
 */
function initAudio() {
  try {
    notifyAudio = new Audio(audio);
    notifyAudio.preload = 'auto';
    
    // 监听音频加载事件
    notifyAudio.addEventListener('canplaythrough', () => {
      console.log('音频已加载完成，可以播放');
      // 如果已解锁，尝试立即播放一次以保持解锁状态
      if (audioUnlocked) {
        tryUnlockAudio();
      }
    });
    
    notifyAudio.addEventListener('error', (e) => {
      console.error('音频加载错误:', e);
      console.error('音频路径:', audio);
    });
    
    // 预加载音频
    notifyAudio.load();
    console.log('音频对象初始化成功，readyState:', notifyAudio.readyState);
  } catch (error) {
    console.error('音频对象初始化失败:', error);
  }
}

/**
 * 尝试解锁音频（静音播放以解锁音频上下文）
 */
function tryUnlockAudio() {
  if (!notifyAudio || audioUnlocked) {
    return;
  }
  
  try {
    const originalVolume = notifyAudio.volume;
    notifyAudio.volume = 0.01; // 使用很小的音量而不是0，某些浏览器需要
    notifyAudio.currentTime = 0;
    
    const unlockPromise = notifyAudio.play();
    if (unlockPromise !== undefined) {
      unlockPromise.then(() => {
        notifyAudio.pause();
        notifyAudio.currentTime = 0;
        notifyAudio.volume = 1;
        audioUnlocked = true;
        console.log('✅ 音频已成功解锁！');
      }).catch((error) => {
        notifyAudio.volume = originalVolume;
        console.log('音频解锁失败（需要用户交互）:', error.name);
      });
    }
  } catch (error) {
    console.warn('解锁音频时出错:', error);
  }
}

/**
 * 播放通知声音
 * @param {boolean} status - 是否播放
 */
function playNotifySound(status) {
  console.log('playNotifySound 调用:', { status, globalSound: globalSound.value });
  
  if (!globalSound.value || !status) {
    console.log('播放被跳过: globalSound=', globalSound.value, 'status=', status);
    return;
  }
  
  try {
    // 如果音频对象不存在，重新创建
    if (!notifyAudio) {
      console.log('音频对象不存在，重新初始化');
      initAudio();
    }
    
    // 如果音频对象仍然不存在，说明初始化失败
    if (!notifyAudio) {
      console.warn('音频对象初始化失败，无法播放声音');
      return;
    }
    
    console.log('音频对象状态:', {
      readyState: notifyAudio.readyState,
      paused: notifyAudio.paused,
      currentTime: notifyAudio.currentTime,
      src: notifyAudio.src
    });
    
    // 如果音频未加载完成，尝试重新加载
    if (notifyAudio.readyState === 0) {
      console.log('音频未加载，重新加载');
      notifyAudio.load();
      // 等待加载完成
      notifyAudio.addEventListener('canplaythrough', () => {
        playAudio();
      }, { once: true });
      return;
    }
    
    // 直接播放
    playAudio();
    
  } catch (error) {
    console.error('播放音频失败:', error);
    // 如果播放失败，尝试重新初始化
    try {
      initAudio();
    } catch (initError) {
      console.error('重新初始化音频失败:', initError);
    }
  }
  
  /**
   * 实际播放音频的函数
   */
  function playAudio() {
    try {
      // 如果音频未解锁，先尝试解锁
      if (!audioUnlocked) {
        console.log('音频未解锁，尝试解锁...');
        tryUnlockAudio();
        // 即使解锁失败，也尝试播放（某些情况下可能成功）
      }
      
      // 重置播放位置
      notifyAudio.currentTime = 0;
      
      // 播放音频，捕获可能的自动播放策略错误
      const playPromise = notifyAudio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('✅ 音频播放成功');
          // 播放成功意味着已解锁
          audioUnlocked = true;
        }).catch(error => {
          // 自动播放被阻止
          console.warn('⚠️ 音频播放被阻止:', error.name);
          if (!audioUnlocked) {
            console.log('💡 提示: 请点击页面任意位置以解锁音频播放');
          }
        });
      }
    } catch (error) {
      console.error('playAudio 内部错误:', error);
    }
  }
}
const expandedName = ref();
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
  closedConversations:[],
  userConversations:[]
})
const loadingState = reactive({
  loadingQueue:false,
  loadingActive:false,
  loadingClosed:false
})
// ==================== 定时器 ====================
let autoRefreshInterval = null; // 自动刷新定时器

// ==================== 会话订阅管理 ====================
const subscribedConversations = new Set(); // 已订阅的会话ID集合，用于避免重复发送 accept_conversation
const conversationsWithNewMessages = new Set(); // 有新消息的会话ID集合，用于显示角标

// ==================== 会话持久化 ====================
const CHAT_SESSION_KEY = 'chat_current_session'; // localStorage key

/**
 * 保存当前会话到 localStorage
 */
function saveCurrentSession() {
  if (baseInfo.currentConversationId && baseInfo.currentUserId && !baseInfo.isConversationClosed) {
    const sessionData = {
      conversationId: baseInfo.currentConversationId,
      userId: baseInfo.currentUserId,
      timestamp: Date.now()
    };
    lStorage.set(CHAT_SESSION_KEY, sessionData);
    console.log('保存会话到本地存储:', sessionData);
  } else {
    // 如果没有活跃会话，清除存储
    lStorage.remove(CHAT_SESSION_KEY);
  }
}

/**
 * 从 localStorage 恢复会话
 */
function restoreSessionFromStorage() {
  try {
    const sessionData = lStorage.get(CHAT_SESSION_KEY);
    if (sessionData && sessionData.conversationId && sessionData.userId) {
      // 检查会话是否过期（超过24小时则清除）
      const now = Date.now();
      const sessionAge = now - (sessionData.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24小时
      
      if (sessionAge < maxAge) {
        console.log('从本地存储恢复会话:', sessionData);
        baseInfo.currentConversationId = sessionData.conversationId;
        baseInfo.currentUserId = sessionData.userId;
        baseInfo.isConversationClosed = false;
        return true;
      } else {
        console.log('会话已过期，清除本地存储');
        lStorage.remove(CHAT_SESSION_KEY);
      }
    }
  } catch (error) {
    console.error('恢复会话失败:', error);
    lStorage.remove(CHAT_SESSION_KEY);
  }
  return false;
}

/**
 * 清除会话存储
 */
function clearSessionStorage() {
  lStorage.remove(CHAT_SESSION_KEY);
}

// 监听会话状态变化，自动保存
watch(
  () => [baseInfo.currentConversationId, baseInfo.currentUserId, baseInfo.isConversationClosed],
  () => {
    saveCurrentSession();
  },
  { deep: true }
);

// ==================== API 调用函数 ====================

/**
 * 统一的 REST API 调用函数
 * @param {string} endpoint - API 端点
 * @param {string} method - HTTP 方法 (GET/POST/PUT/DELETE)
 * @param {object} body - 请求体数据
 * @returns {Promise<{success: boolean, data: any, status: number}>}
 */
// async function callApi(endpoint, method = 'GET', body = null) {
//   const options = {
//     method: method,
//     headers: {
//       'Authorization': `Bearer ${APP_API_TOKEN}`,
//       'Content-Type': 'application/json'
//     }
//   };
  
//   if (body) {
//     options.body = JSON.stringify(body);
//   }
  
//   try {
//     const response = await fetch(`${SERVER_URL}${endpoint}`, options);
//     const data = await response.json();
//     return { success: response.ok, data: data, status: response.status };
//    } catch (error) {
//     console.error(`API调用失败: ${error.message}`);
//     return { success: false, error: error.message };
//   }
// }

async function closeAll() {
  const result = await closeChatAllConversation()
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
  const result = await statsChatList();
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
  const result = await queueChatList();
  // console.log('result', result)
  if (result) {
    queueState.waitingQueue = result.queue || [];
  } else {
    console.error(`❌ 获取队列失败: ${result.status}`);
  }
  loadingState.loadingQueue = false;
}

/**
 * 刷新活跃会话列表
 * 获取所有正在进行中的客服会话
 * 并为每个会话自动发送 accept_conversation，确保能接收所有消息
 */
async function refreshActiveConversations() {
  loadingState.loadingActive = true;
  const result = await conversationsChatList({status:'connected'});
  
  if (result) {
    queueState.activeConversations = result.conversations || [];
    
    // 为所有活跃会话发送 accept_conversation，确保能接收消息
    if (socket.value?.connected && isConnected.value) {
      const conversations = result.conversations || [];
      conversations.forEach((conv) => {
        const conversationId = conv.conversation_id;
        
        // 如果还没有订阅过这个会话，则发送 accept_conversation
        if (conversationId && !subscribedConversations.has(conversationId)) {
          console.log('自动订阅会话以接收消息:', conversationId);
          socket.value.emit('accept_conversation', {
            type: 'accept_conversation',
            data: {
              conversation_id: conversationId,
              timestamp: Math.floor(Date.now() / 1000)
            }
          });
          subscribedConversations.add(conversationId);
        }
      });
      
      // 清理已关闭的会话订阅（不在活跃列表中的会话）
      const activeIds = new Set(conversations.map(c => c.conversation_id));
      subscribedConversations.forEach((id) => {
        if (!activeIds.has(id)) {
          console.log('移除已关闭会话的订阅:', id);
          subscribedConversations.delete(id);
        }
      });
    }
  } else {
    console.error(`❌ 获取活跃会话失败: ${result.status}`);
  }
  loadingState.loadingActive = false;
}

/**
 * 刷新已结束会话列表
 * 获取所有已关闭的历史会话
 */
let startY = 0 
let endY = 0

function handleMouseUp(event) {
  endY = event?.clientY;
  if(endY - startY> 20){
    refreshUserConversations()
  }
}
function handleMouseDown(event) {
  startY = event?.clientY;
}
async function refreshClosedConversations() {
  loadingState.loadingClosed = true;
  const result = await conversationsChatList({status:'closed'});
  
  if (result) {
    queueState.closedConversations = result.conversations || [];
  } else {
    console.error(`❌ 获取已结束会话失败: ${result.status}`);
  }
  loadingState.loadingClosed = false;
}
const searchKeyword = ref('');
const hasmore = ref(true);
let lastTimeRange = null
async function refreshUserConversations(init) {
  if(init==='init'){
    baseInfo.chatListData = [];
    lastTimeRange = null;
    hasmore.value = true;
  }
  if(!hasmore.value) {
    $message.success('已经加载全部历史聊天记录')
    return
  }
  isHistoryView.value = true
  baseInfo.userInfo =  searchKeyword.value
  loadingState.loadingClosed = true
  baseInfo.currentUserId= searchKeyword.value
  try {
    const params = {
    user: searchKeyword.value,
    last_conversation_updated_at: lastTimeRange?.conversation_updated_at,
    last_message_created_at: lastTimeRange?.created_at,
  }
  const {data,has_more}  = await userChatAllHistoryList(params);
  lastTimeRange = data[data.length-1];
    const temp = data.reverse()
    baseInfo.chatListData=[...temp,...baseInfo.chatListData, ] || [];
    hasmore.value = has_more;
    if(!has_more) {
      $message.success('已经加载全部历史聊天记录')
    } 
    scrollToIndex(data.length-1)
    
  } catch (error) {
    console.error(error)
  } finally {
    loadingState.loadingClosed = false;
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
    refreshClosedConversations()
  ]);
}

// ==================== 历史记录查看 ====================

/**
 * 滚动聊天区域到底部
 * 用于在加载历史记录或添加新消息后自动滚动到底部
 */
 function scrollToIndex(index) {
  nextTick(() => {
    requestAnimationFrame(() => {
      // const scrollContent = document.querySelector('.n-scrollbar-content')
      chatScrollbarRef.value?.scrollTo({
          top: document.getElementById(`message-${index}`).offsetTop || 10000,
          // behavior: 'smooth'
        })
    });
  });
}

function scrollToBottom(event) {
  nextTick(() => {
    requestAnimationFrame(() => {
      const scrollContent = document.querySelector('.n-scrollbar-content')
      chatScrollbarRef.value?.scrollTo({
          top:scrollContent.scrollHeight || 10000,
          // behavior: 'smooth'
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
    const result = await conversationChatHistoryList(conversationId);
    baseInfo.chatListData = result?.messages||[];
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

  const NAMESPACE = '/chat/human-service/human';
  
  socket.value = io(SERVER_URL + NAMESPACE, {
    path: '/chat/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity, // 无限重连，除非主动断开
    timeout: 20000,
  });

  // 连接成功
  socket.value.on('connect', () => {
    console.log('WebSocket 连接成功')
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

  // 重连成功
  socket.value.on('reconnect', (attemptNumber) => {
    console.log('WebSocket 重连成功，重连次数:', attemptNumber)
    // 重连后重新发送上线通知
    socket.value.emit('human_online', {
      type: 'human_online',
      data: {
        human_id: userStore.userInfo.user_id,
        human_name: userStore.userInfo.nickname,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
  });

  // 上线确认
  socket.value.on('human_online_ack', (data) => {
    console.log('human_online_ack', data, baseInfo.currentConversationId)
    isConnected.value = true;
    
    // 清空之前的订阅记录，重新订阅所有活跃会话
    subscribedConversations.clear();
    
    refreshAll();
    
    // 如果有当前会话，自动恢复会话
    if (baseInfo.currentConversationId && baseInfo.currentUserId && !baseInfo.isConversationClosed) {
      console.log('恢复会话:', baseInfo.currentConversationId)
      restoreCurrentSession();
    }
  });

  // 新会话通知
  socket.value.on('new_conversation', (data) => {
    console.log('new_conversation', data)
    playNotifySound(true)
    refreshQueue();
    refreshStats();
  });
    // 接受会话确认
    socket.value.on('accept_conversation_ack', (data) => {
      console.log('accept_conversation_ack', data)
      refreshQueue();
      refreshStats();
      refreshActiveConversations();
    // }
  });



  // 接收用户消息（始终监听，即使断线重连后也能接收）
  socket.value.on('user_message', (data) => {
    console.log('user_message', data)
    playNotifySound(true);
    const msgData = data?.data || data || {};
    
    if (!msgData.conversation_id) {
      console.warn('收到无效的 user_message，缺少 conversation_id');
      return;
    }
    
    // 确保该会话已订阅（防止遗漏）
    if (!subscribedConversations.has(msgData.conversation_id)) {
      console.log('收到未订阅会话的消息，自动订阅:', msgData.conversation_id);
      if (socket.value?.connected && isConnected.value) {
        socket.value.emit('accept_conversation', {
          type: 'accept_conversation',
          data: {
            conversation_id: msgData.conversation_id,
            timestamp: Math.floor(Date.now() / 1000)
          }
        });
        subscribedConversations.add(msgData.conversation_id);
      }
    }
    
    // 如果当前没有会话，但收到消息，自动切换到该会话
    if (!baseInfo.currentConversationId && msgData.conversation_id) {
      console.log('收到新会话消息，自动切换到会话:', msgData.conversation_id)
      baseInfo.currentConversationId = msgData.conversation_id;
      baseInfo.currentUserId = msgData.user_id || baseInfo.currentUserId;
      baseInfo.isConversationClosed = false;
      // 清除新消息标记（因为已经自动切换到了该会话）
      conversationsWithNewMessages.delete(msgData.conversation_id);
      // 加载会话历史
      viewConversationHistory(msgData.conversation_id, baseInfo.currentUserId);
    }
    
    // 如果是当前会话的消息，添加到聊天列表
    if (msgData.conversation_id === baseInfo.currentConversationId) {
      addMessageToChatList({
        query: msgData.content || msgData.message_content || '',
        answer: '',
        created_at: msgData.timestamp || Math.floor(Date.now() / 1000),
        id: `msg_${Date.now()}`,
        isUser: true
      });
      // 清除当前会话的新消息标记
      conversationsWithNewMessages.delete(msgData.conversation_id);
    } else if (msgData.conversation_id) {
      // 如果不是当前会话的消息，标记该会话有新消息
      conversationsWithNewMessages.add(msgData.conversation_id);
      createMessage(`收到来自用户${msgData.user_id},会话 ${msgData.conversation_id.slice(0, 8)}... 的新消息`);
      refreshActiveConversations();
    }
  });

  // 会话关闭事件
  socket.value.on('conversation_closed', (data) => {
    console.log('conversation_closed', data)
    const closedConversationId = data.data?.conversation_id;
    
    // 移除已关闭会话的订阅和新消息标记
    if (closedConversationId) {
      subscribedConversations.delete(closedConversationId);
      conversationsWithNewMessages.delete(closedConversationId);
      console.log('移除已关闭会话的订阅:', closedConversationId);
    }
    
    // 如果关闭的是当前会话，清除状态
    if (closedConversationId === baseInfo.currentConversationId) {
      baseInfo.isConversationClosed = true;
      clearSessionStorage();
    }
    
    closeReason.value = data.data.close_reason=="user_disconnected"?`会话id:${closedConversationId}用户主动关闭会话`:'会话已结束'
    if(closeReason.value){
      createMessage(closeReason.value)
    }
    refreshQueue();
    refreshStats();
    refreshActiveConversations();
    refreshClosedConversations();
  });

  // 错误处理
  socket.value.on('error', (data) => {
    console.error('❌ [Human] Error:', data);
  });

  // 断开连接
  socket.value.on('disconnect', (reason) => {
    console.log('WebSocket 断开连接，原因:', reason)
    isConnected.value = false;
    stopAutoRefresh();
    
    // 如果是主动断开（如用户点击下线），才清除会话状态
    // 否则保持会话状态，等待重连后恢复
    if (reason === 'io client disconnect' || reason === 'io server disconnect') {
      // 主动断开，清除状态
      console.log('主动断开连接，清除会话状态')
      baseInfo.currentConversationId = null;
      baseInfo.currentUserId = null;
      baseInfo.chatListData = [];
    } else {
      // 网络问题导致的断开，保持会话状态等待重连
      console.log('网络断开，保持会话状态等待重连')
    }
  });

  // 连接错误
  socket.value.on('connect_error', (error) => {
    console.error('❌ [Human] Connection error:', error);
    isConnected.value = false;
    // 连接错误时不清除会话状态，等待重连
  });

  // 重连尝试
  socket.value.on('reconnect_attempt', (attemptNumber) => {
    console.log('正在尝试重连，第', attemptNumber, '次')
  });

  // 重连失败
  socket.value.on('reconnect_failed', () => {
    console.error('❌ 重连失败，将继续尝试重连')
    // 即使重连失败，也继续尝试（因为设置了无限重连）
  });
}

// ==================== 会话操作函数 ====================

/**
 * 恢复当前会话（发送 accept_conversation 并加载历史）
 */
async function restoreCurrentSession() {
  if (!socket.value?.connected || !isConnected.value) {
    console.log('WebSocket 未连接，无法恢复会话');
    return;
  }
  
  if (!baseInfo.currentConversationId || !baseInfo.currentUserId) {
    console.log('没有可恢复的会话');
    return;
  }
  
  console.log('恢复会话:', baseInfo.currentConversationId, baseInfo.currentUserId);
  
  // 发送 accept_conversation 恢复会话
  if (!subscribedConversations.has(baseInfo.currentConversationId)) {
    socket.value.emit('accept_conversation', {
      type: 'accept_conversation',
      data: {
        conversation_id: baseInfo.currentConversationId,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
    subscribedConversations.add(baseInfo.currentConversationId);
  }
  
  // 清除新消息标记
  conversationsWithNewMessages.delete(baseInfo.currentConversationId);
  
  // 加载会话历史
  await viewConversationHistory(baseInfo.currentConversationId, baseInfo.currentUserId);
  
  // 刷新活跃会话列表
  setTimeout(() => {
    refreshActiveConversations();
  }, 500);
}

/**
 * 从等待队列接受会话
 * @param {string} conversationId - 会话ID
 * @param {string} userId - 用户ID
 */
function acceptConversationFromQueue(conversationId, userId) {

  if (!socket.value?.connected || !isConnected.value) return;
  
  // 发送 accept_conversation
  if (!subscribedConversations.has(conversationId)) {
    socket.value.emit('accept_conversation', {
      type: 'accept_conversation',
      data: {
        conversation_id: conversationId,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
    subscribedConversations.add(conversationId);
  }
  
  // 清除新消息标记
  conversationsWithNewMessages.delete(conversationId);
  
  // 第一次进入聊天窗口
  baseInfo.currentConversationId = conversationId;
  baseInfo.currentUserId = userId;
  viewConversationHistory(conversationId,userId)

  socket.value.emit('human_message', {
    type: 'human_message',
    data: {
      conversation_id: baseInfo.currentConversationId,
      message_content:  "您好，很高兴为您服务，请问有什么可以帮您？",
      message_type: 'text',
      timestamp: Math.floor(Date.now() / 1000)
    }
  });
}

/**
 * 切换到指定的活跃会话
 * @param {string} conversationId - 会话ID
 * @param {string} userId - 用户ID
 */
function switchToConversation(conversationId, userId) {
  if (!socket.value?.connected || !isConnected.value) return;
  
  // 确保会话已订阅
  if (!subscribedConversations.has(conversationId)) {
    socket.value.emit('accept_conversation', {
      type: 'accept_conversation',
      data: {
        conversation_id: conversationId,
        timestamp: Math.floor(Date.now() / 1000)
      }
    });
    subscribedConversations.add(conversationId);
  }
  
  // 清除新消息标记
  conversationsWithNewMessages.delete(conversationId);
  
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
    refreshClosedConversations();
  }, 500);
}

/**
 * 关闭当前正在处理的会话
 */
function closeConversation(conversationId) {
  closeConversationById(conversationId);
  baseInfo.isConversationClosed = true;
  // 清除本地存储的会话
  clearSessionStorage();
}

// ==================== 消息处理函数 ====================

/**
 * 发送消息给用户
 * 通过 WebSocket 发送客服消息并更新本地聊天列表
 */
function sendMessage() {
  // if (!baseInfo.currentConversationId) return;
  // if (!socket.value?.connected || !isConnected.value) return;
  // 
  console.log('baseInfo.currentConversationId',baseInfo.currentConversationId)
  const messageToSend = message.value.trim() ;
  // console.log('messageToSend',messageToSend)
  if (!messageToSend ) return;
  console.log('messageToSend',messageToSend)
  addMessageToChatList({
    query: '',
    answer: messageToSend  ,
    created_at: Math.floor(Date.now() / 1000),
    id: `msg_${Date.now()}`,
    isUser: false
  });
console.log('human_message')
  socket.value.emit('human_message', {
    type: 'human_message',
    data: {
      conversation_id: baseInfo.currentConversationId,
      message_content:  messageToSend,
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
 * 发送下线通知并清理所有状态（仅用于主动断开）
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
    
    // 主动断开连接，禁用自动重连
    socket.value.disconnect();
  } catch (e) {
    console.warn('断开连接失败:', e);
  } finally {
    socket.value = null;
    isConnected.value = false;
    baseInfo.currentConversationId = null;
    baseInfo.currentUserId = null;
    baseInfo.chatListData = [];
    stopAutoRefresh();
    // 清除本地存储的会话
    clearSessionStorage();
    // 清空订阅记录和新消息标记
    subscribedConversations.clear();
    conversationsWithNewMessages.clear();
  }
}

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载时自动连接 WebSocket
 */
onMounted(() => {
  // 初始化音频对象
  initAudio();
  
  // 先从本地存储恢复会话状态
  const hasRestored = restoreSessionFromStorage();
  console.log('页面加载，恢复会话状态:', hasRestored);
  
  // 连接 WebSocket
  connectSocket();
  
  // 如果恢复了会话，等待连接成功后再恢复会话
  if (hasRestored) {
    // 监听连接成功事件，在 human_online_ack 中会自动恢复会话
    // 这里不需要额外处理，因为 human_online_ack 中已经调用了 restoreCurrentSession
  }
  
  // 积极的音频解锁策略：在多个事件上尝试解锁
  const unlockAudioOnInteraction = () => {
    if (audioUnlocked) {
      return; // 已经解锁，不需要重复
    }
    
    console.log('🔓 检测到用户交互，立即解锁音频');
    tryUnlockAudio();
  };
  
  // 监听多种用户交互事件以解锁音频
  // 使用 capture 阶段和多个事件类型，确保尽早捕获
  const interactionEvents = ['click', 'keydown', 'keypress', 'touchstart', 'mousedown', 'pointerdown'];
  
  interactionEvents.forEach(eventType => {
    document.addEventListener(eventType, unlockAudioOnInteraction, { 
      once: false, // 不限制只触发一次，确保每次交互都能尝试解锁
      passive: true // 使用 passive 提高性能
    });
  });
  
  // 页面可见性变化时也尝试解锁（用户切换回标签页时）
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && notifyAudio && !audioUnlocked) {
      console.log('页面变为可见，尝试解锁音频');
      // 延迟一点，确保页面完全可见
      setTimeout(() => {
        tryUnlockAudio();
      }, 100);
    }
  });
  
  // 页面获得焦点时尝试解锁
  window.addEventListener('focus', () => {
    if (notifyAudio && !audioUnlocked) {
      console.log('窗口获得焦点，尝试解锁音频');
      setTimeout(() => {
        tryUnlockAudio();
      }, 100);
    }
  });
  
  // 在页面加载完成后立即尝试解锁（某些浏览器可能允许）
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (notifyAudio && !audioUnlocked) {
        console.log('页面加载完成，尝试自动解锁音频');
        tryUnlockAudio();
      }
    }, 500);
  });
});

/**
 * 组件卸载时断开 WebSocket 连接
 */
onUnmounted(() => {
  // disconnectSocket();
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