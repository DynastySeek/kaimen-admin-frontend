import { fetchCurrentUserInfo, fetchPermissionsTree } from '@/services';

export async function getUserInfo() {
  const data = await fetchCurrentUserInfo();
  const { id, username, profile, roles, currentRole } = data || {};
  return {
    id,
    username,
    avatar: profile?.avatar,
    nickName: profile?.nickName,
    gender: profile?.gender,
    address: profile?.address,
    email: profile?.email,
    roles,
    currentRole,
  };
}

export async function getPermissions() {
  let asyncPermissions = [];
  try {
    const data = await fetchPermissionsTree();
    asyncPermissions = data || [];
  } catch (error) {
    console.error(error);
  }
  return asyncPermissions;
}
