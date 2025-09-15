import axios from 'axios';
import { VITE_PUBLIC_PATH } from '@/config/env';
import { request } from './request';

export default {
  // 获取用户信息
  getUser: () => request.get('/user/detail'),
  // 刷新token
  refreshToken: () => request.get('/auth/refresh/token'),
  // 登出
  logout: () => request.post('/auth/logout', {}, { needTip: false }),
  // 切换当前角色
  switchCurrentRole: role => request.post(`/auth/current-role/switch/${role}`),
  // 获取角色权限
  getRolePermissions: () => request.get('/role/permissions/tree'),
  // 验证菜单路径
  validateMenuPath: path => request.get(`/permission/menu/validate?path=${path}`),

  // 认证相关
  auth: {
    // 登录
    login: data => request.post('/auth/login', data, { needToken: false }),
    // 切换角色
    toggleRole: data => request.post('/auth/role/toggle', data),
    // 修改密码
    changePassword: data => request.post('/auth/password', data),
  },

  // 用户管理
  user: {
    // 创建用户
    create: data => request.post('/user', data),
    // 获取用户列表
    read: (params = {}) => request.get('/user', { params }),
    // 更新用户
    update: data => request.patch(`/user/${data.id}`, data),
    // 删除用户
    delete: id => request.delete(`/user/${id}`),
    // 重置密码
    resetPwd: (id, data) => request.patch(`/user/password/reset/${id}`, data),
    // 获取所有角色
    getAllRoles: () => request.get('/role?enable=1'),
    // 更新用户资料
    updateProfile: data => request.patch(`/user/profile/${data.id}`, data),
  },

  // 角色管理
  role: {
    // 创建角色
    create: data => request.post('/role', data),
    // 获取角色列表
    read: (params = {}) => request.get('/role/page', { params }),
    // 更新角色
    update: data => request.patch(`/role/${data.id}`, data),
    // 删除角色
    delete: id => request.delete(`/role/${id}`),
    // 获取所有权限树
    getAllPermissionTree: () => request.get('/permission/tree'),
    // 获取所有用户
    getAllUsers: (params = {}) => request.get('/user', { params }),
    // 添加角色用户
    addRoleUsers: (roleId, data) => request.patch(`/role/users/add/${roleId}`, data),
    // 移除角色用户
    removeRoleUsers: (roleId, data) => request.patch(`/role/users/remove/${roleId}`, data),
  },

  // 权限资源管理
  permission: {
    // 获取菜单树
    getMenuTree: () => request.get('/permission/menu/tree'),
    // 获取按钮权限
    getButtons: ({ parentId }) => request.get(`/permission/button/${parentId}`),
    // 获取组件列表
    getComponents: () => axios.get(`${VITE_PUBLIC_PATH}components.json`),
    // 添加权限
    addPermission: data => request.post('/permission', data),
    // 保存权限
    savePermission: (id, data) => request.patch(`/permission/${id}`, data),
    // 删除权限
    deletePermission: id => request.delete(`permission/${id}`),
  },
};
