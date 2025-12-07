export const Role = {
  SuperAdmin: 0,
  SysAdmin: 1,
  Appraiser: 2
};

export const RoleLabelMap = {
  [Role.SuperAdmin]: '超级管理员',
  [Role.SysAdmin]: '系统管理员',
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
  AppraisalConsignment: 'AppraisalConsignment',
  AppraisalBuy: 'AppraisalBuy',
  ArticleMgt: 'ArticleMgt',
  ArticleList: 'ArticleList',
  ArticleDetail: 'ArticleDetail',
  AppraisalClean:'AppraisalClean',
  Daily:'Daily',
  DailyList:'DailyList',
  ExchangeList:'ExchangeList',
  ChatList:'ChatList',
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
  [Permission.AppraisalConsignment]: '我要卖快捷版列表',
  [Permission.AppraisalBuy]: '求购单列表',
  [Permission.ArticleMgt]: '文章管理',
  [Permission.ArticleList]: '文章列表',
  [Permission.ArticleDetail]: '文章详情',
  [Permission.AppraisalClean]: '洗护列表',
  [Permission.Daily]: '每日精品评选列表',
  [Permission.DailyList]: '评选列表',
  [Permission.ExchangeList]: '兑换列表',
  [Permission.ChatList]: 'AI客服对话列表',
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
  ToPay:20,
};

export const AppraisalStatusLabelMap = {
  [AppraisalStatus.PendingAppraisal]: '待鉴定',
  [AppraisalStatus.InProgress]: '鉴定中',
  [AppraisalStatus.Completed]: '已完结',
  [AppraisalStatus.PendingCompletion]: '待完善',
  [AppraisalStatus.Rejected]: '已退回',
  [AppraisalStatus.Cancelled]: '已取消',
  [AppraisalStatus.ToPay]: '待支付',
};

export const AppraisalClass = {
  YinYuan: 1,
  GuQian: 2,
  ZaXiang: 4,
  QuWu: 6,
};

export const AppraisalClassLabelMap = {
  [AppraisalClass.YinYuan]: '银元',
  [AppraisalClass.GuQian]: '古钱',
  [AppraisalClass.ZaXiang]: '杂项',
  [AppraisalClass.QuWu]: '趣物',
};

export const CleansingClass = {
  process: 1,
  completed: 2,
  closed: 3,
};
export const CleansingClassLabelMap = {
  [CleansingClass.process]: '进行中',
  [CleansingClass.completed]: '已完成',
  [CleansingClass.closed]: '已关闭',
};


export const AppraisalResult = {
  Authentic: '1',
  Fake: '2',
  Doubt: '3',
  Rejected: '4',
};

export const AppraisalResultLabelMap = {
  [AppraisalResult.Authentic]: '真',
  [AppraisalResult.Fake]: '假',
  [AppraisalResult.Doubt]: '存疑',
  [AppraisalResult.Rejected]: '驳回',
};

// 趣物枚举：1-有趣，2-无聊
export const QuWuInterest = {
  Interesting: '1',
  Boring: '2',
  Doubt: '3',
  Rejected: '4',
};

export const QuWuInterestLabelMap = {
  [QuWuInterest.Interesting]: '有趣',
  [QuWuInterest.Boring]: '无聊',
  [QuWuInterest.Doubt]: '存疑',
  [QuWuInterest.Rejected]: '驳回',
};

export const PubStatus = {
  ToPublish: '1',
  Published: '2',
  Offline: '3',
};

export const PubStatusLabelMap = {
  [PubStatus.ToPublish]: '待发布',
  [PubStatus.Published]: '已发布',
  [PubStatus.Offline]: '已下线',
};

export const PriceRange = {
  Under1000: 1,
  Range1000To5000: 2,
  Range5000To10000: 3,
  Range10000To50000: 4,
  Range50000To100000: 5,
  Above100000: 6,
};

export const PriceRangeLabelMap = {
  [PriceRange.Under1000]: '1000元以下',
  [PriceRange.Range1000To5000]: '1000-5000元',
  [PriceRange.Range5000To10000]: '5000-10000元',
  [PriceRange.Range10000To50000]: '1万-5万元',
  [PriceRange.Range50000To100000]: '5万-10万元',
  [PriceRange.Above100000]: '10万元以上',
};

export const PriceRangeValueMap = {
  [PriceRange.Under1000]: [null, 1000],
  [PriceRange.Range1000To5000]: [1000, 5000],
  [PriceRange.Range5000To10000]: [5000, 10000],
  [PriceRange.Range10000To50000]: [10000, 50000],
  [PriceRange.Range50000To100000]: [50000, 100000],
  [PriceRange.Above100000]: [100000, null],
};

// 鉴定类型枚举
export const AppraisalBusinessType = {
  NORMAL: '1',
  SELL: '4',
};

export const AppraisalBusinessTypeLabelMap = {
  [AppraisalBusinessType.NORMAL]: '仅鉴定',
  [AppraisalBusinessType.SELL]: '我要卖',
};

export const LevelType = {
  SLevel: '2',
  ALevel: '1',
  NORMAL: '0',
};

export const LevelLabelMap = {
  [LevelType.SLevel]: 'S级珍品',
  [LevelType.ALevel]: 'A级优品',
  [LevelType.NORMAL]: '普品',
};