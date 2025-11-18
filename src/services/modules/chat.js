import alovaInstance from '../aichat';
import aiuserInstance from '../aiuser';

export const fetchChatList = params => alovaInstance.Get(`/v1/messages`,{params});
export const fetchUserinfoList = params => aiuserInstance.Get('/user/userinfo', { params });
export const fetchAIChatList = params => alovaInstance.Get(`/v1/messages`,{ params });
export const fetchUserGoldList = data => aiuserInstance.Post('/user/userinfolist', data);
// user/goldexchangelist?userinfoid=879da22bbd9e4f1db3d80f3e214f6ea3
export const goldXchangelist = params => aiuserInstance.Get('/user/goldexchangelist', { params });

export const goldXchange= data => aiuserInstance.Post('/user/goldexchange', data );