import alovaInstance from '../aichat';
import aiuserInstance from '../aiuser';

export const fetchChatList = params => alovaInstance.Get('/v1/messages', { params });
export const fetchUserinfoList = params => aiuserInstance.Get('/user/userinfo', { params });

