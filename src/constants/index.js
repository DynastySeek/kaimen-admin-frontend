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
