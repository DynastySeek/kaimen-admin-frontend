import alovaInstance from '../alovaInstance';
import aichatInstance from '../aichat';

export const fetchChatList = params => aichatInstance.Get(`/v1/messages`,{params});
export const fetchUserGoldList = params => alovaInstance.Get('/user/wechat/list', {params});
export const goldXchangelist = params => alovaInstance.Get('/user/goldExchangeList', { params });
export const goldXchange= data => alovaInstance.Post('/user/goldExchange', data );
export const closeAllConversation = () => aichatInstance.Post('/console/api/human-service/queue/close-all');
export const userConversatioList = params => aichatInstance.Get('/v1/users/messages',{params});

// 获取等待队列
export const queueChatList = params => aichatInstance.Get('/chat/api/human-service/queue',{params});
// 获取统计信息
export const statsChatList = params => aichatInstance.Get('/chat/api/human-service/stats',{params});
// 获取会话列表
export const conversationsChatList = params => aichatInstance.Get('/chat/api/human-service/conversations',{params});
// 批量关闭等待会话
export const closeChatAllConversation = params => aichatInstance.Post('/chat/api/human-service/queue/close-all',{params});
// 获取获取用户会话消息历史会话列表
export const userChatAllHistoryList = params => aichatInstance.Get('/chat/users/messages',{params});
// 获取会话id会话消息历史
export const conversationChatHistoryList = (conversation_id, params) => aichatInstance.Get(`/chat/api/human-service/conversations/${conversation_id}/messages`,{params});