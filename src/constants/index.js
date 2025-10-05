export const Role = {
  SuperAdmin: 'admin',
  Appraiser: 'appraiser',
};

export const RoleLabelMap = {
  [Role.SuperAdmin]: '超级管理员',
  [Role.Appraiser]: '鉴定师',
};

export const Permission = {
  SysMgt: 'SysMgt',
  ResourceMgt: 'ResourceMgt',
  RoleMgt: 'RoleMgt',
  RoleUser: 'RoleUser',
  UserMgt: 'UserMgt',
  AddUser: 'AddUser',
  AppraisalMgt: 'AppraisalMgt',
  AppraisalList: 'AppraisalList',
};

export const PermissionLabelMap = {
  [Permission.SysMgt]: '系统管理',
  [Permission.ResourceMgt]: '资源管理',
  [Permission.RoleMgt]: '角色管理',
  [Permission.RoleUser]: '角色用户',
  [Permission.UserMgt]: '用户管理',
  [Permission.AddUser]: '添加用户',
  [Permission.AppraisalMgt]: '鉴定管理',
  [Permission.AppraisalList]: '鉴定列表',
};

export const Gender = {
  Female: 0,
  Male: 1,
  Unknown: 2,
};

export const GenderLabelMap = {
  [Gender.Female]: '女',
  [Gender.Male]: '男',
  [Gender.Unknown]: '未知',
};

export const UserStatus = {
  Active: 0,
  Inactive: 1,
  Deleted: 2,
};

export const UserStatusLabelMap = {
  [UserStatus.Active]: '启用',
  [UserStatus.Inactive]: '禁用',
  [UserStatus.Deleted]: '注销',
};

export const UserType = {
  Admin: 0,
  Teacher: 1,
  Student: 2,
};

export const UserTypeLabelMap = {
  [UserType.Admin]: '管理员',
  [UserType.Teacher]: '教师',
  [UserType.Student]: '学生',
};

export const CategoryStatus = {
  Inactive: 0,
  Active: 1,
};

export const CategoryStatusLabelMap = {
  [CategoryStatus.Inactive]: '禁用',
  [CategoryStatus.Active]: '启用',
};

export const ProductStatus = {
  OnSale: 0,
  OffSale: 1,
  Deleted: 2,
};

export const ProductStatusLabelMap = {
  [ProductStatus.OnSale]: '上架',
  [ProductStatus.OffSale]: '下架',
  [ProductStatus.Deleted]: '已删除',
};

export const AppraisalStatus = {
  PendingAppraisal: 1,
  InProgress: 2,
  Completed: 3,
  PendingCompletion: 4,
  Rejected: 5,
  Cancelled: 6,
};

export const AppraisalStatusLabelMap = {
  [AppraisalStatus.PendingAppraisal]: '待鉴定',
  [AppraisalStatus.InProgress]: '鉴定中',
  [AppraisalStatus.Completed]: '已完结',
  [AppraisalStatus.PendingCompletion]: '待完善',
  [AppraisalStatus.Rejected]: '已退回',
  [AppraisalStatus.Cancelled]: '已取消',
};

export const AppraisalClass = {
  YinYuan: 1,
  GuQian: 2,
  ZaXiang: 4,
  ZhiBi: 5,
};

export const AppraisalClassLabelMap = {
  [AppraisalClass.YinYuan]: '银元',
  [AppraisalClass.GuQian]: '古钱',
  [AppraisalClass.ZaXiang]: '杂项',
  [AppraisalClass.ZhiBi]: '纸币',
};

export const AppraisalResult = {
  Authentic: '真',
  Fake: '假',
  Doubt: '存疑',
  Rejected: '驳回',
};

export const AppraisalResultLabelMap = {
  [AppraisalResult.Authentic]: '真',
  [AppraisalResult.Fake]: '假',
  [AppraisalResult.Doubt]: '存疑',
  [AppraisalResult.Rejected]: '驳回',
};
