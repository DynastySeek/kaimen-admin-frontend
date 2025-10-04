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
  PendingCompletion: 0,
  AuthenticCompleted: 1,
  FakeCompleted: 2,
  Rejected: 3,
  Cancelled: 4,
  DoubtCompleted: 5,
};

export const AppraisalStatusLabelMap = {
  [AppraisalStatus.PendingCompletion]: '待用户完善',
  [AppraisalStatus.AuthenticCompleted]: '已完成鉴定为真',
  [AppraisalStatus.FakeCompleted]: '已完成鉴定为伪',
  [AppraisalStatus.Rejected]: '已驳回',
  [AppraisalStatus.Cancelled]: '已取消',
  [AppraisalStatus.DoubtCompleted]: '已完成鉴定存疑',
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
