import alovaInstance from '../alovaInstance';

/**
 * 获取权限数组
 * @returns {Promise<Array<{type:string,code:string}>>} 权限数组
 */
export const fetchPermissions = () => alovaInstance.Get('/api/role/permissions');

/**
 * 获取角色列表
 * @param {RoleListParams} params - 请求参数
 * @returns {Promise<object>} 角色列表数据，包含分页信息
 */
export const fetchRoleList = params => alovaInstance.Get('/api/role/list', { params });

/**
 * 获取角色详情
 * @param {string|number} id - 角色ID
 * @returns {Promise<object>} 角色详情数据
 */
export const fetchRoleById = id => alovaInstance.Get(`/api/role/${id}`);

/**
 * 创建角色
 * @param {CreateRoleParams} data - 请求参数
 * @returns {Promise<object>} 创建的角色信息
 */
export const fetchCreateRole = data => alovaInstance.Post('/api/role/create', data);

/**
 * 更新角色
 * @param {UpdateRoleParams} data - 请求参数
 * @returns {Promise<object>} 更新后的角色信息
 */
export const fetchUpdateRole = data => alovaInstance.Put(`/api/role/${data.id}`, data);

/**
 * 删除角色
 * @param {string|number} id - 角色ID
 * @returns {Promise<object>} 删除结果
 */
export const fetchDeleteRole = id => alovaInstance.Delete(`/api/role/${id}`);

/**
 * 启用/禁用角色
 * @param {string|number} id - 角色ID
 * @returns {Promise<object>} 操作结果
 */
export const fetchToggleRoleStatus = id => alovaInstance.Put(`/api/role/toggle/${id}`);

/**
 * 分配角色权限
 * @param {AssignPermissionsParams} data - 请求参数，包含角色ID和权限ID列表
 * @returns {Promise<object>} 操作结果
 */
export const fetchAssignPermissions = data => alovaInstance.Post('/api/role/permissions/assign', data);

/**
 * 获取角色的权限ID列表
 * @param {string|number} roleId - 角色ID
 * @returns {Promise<Array>} 权限ID列表
 */
export const fetchRolePermissions = roleId => alovaInstance.Get(`/api/role/permissions/${roleId}`);

/**
 * 分配用户到角色
 * @param {AssignUsersParams} data - 请求参数，包含角色ID和用户ID列表
 * @returns {Promise<object>} 操作结果
 */
export const fetchAssignUsers = data => alovaInstance.Post('/api/role/users/assign', data);

/**
 * 获取角色下的用户列表
 * @param {string|number} roleId - 角色ID
 * @param {object} params - 分页参数
 * @returns {Promise<object>} 用户列表数据，包含分页信息
 */
export const fetchRoleUsers = (roleId, params) => alovaInstance.Get(`/api/role/users/${roleId}`, { params });
