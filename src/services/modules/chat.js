import alovaInstance from '../alovaInstance';
import aichatInstance from '../aichat';

export const fetchChatList = params => aichatInstance.Get(`/v1/messages`,{params});
export const fetchUserGoldList = params => alovaInstance.Get('/user/userList', {params});
export const goldXchangelist = params => alovaInstance.Get('/user/goldExchangeList', { params });
export const goldXchange= data => alovaInstance.Post('/user/goldExchange', data );
export const closeAllConversation = () => aichatInstance.Post('/console/api/human-service/queue/close-all');
export const userConversatioList = params => aichatInstance.Get('/v1/users/messages',{params});