import alovaInstance from '../aichat';
import aiuserInstance from '../aiuser';

export const fetchChatList = params => alovaInstance.Get(`/console/api/human-service/conversations/${params.conversation_id}/messages?limit=50`);
export const fetchUserinfoList = params => aiuserInstance.Get('/user/userinfo', { params });


