# 接口文档

## 枚举定义

### 鉴定状态 (appraisal_status)

| 值  | 标签           | 说明   |
| --- | -------------- | ------ |
| 0   | 待用户完善     | 待完善 |
| 1   | 已完成鉴定为真 | 鉴定中 |
| 2   | 已完成鉴定为伪 | 已完结 |
| 3   | 已驳回         | 待完善 |
| 4   | 已取消         | 已退回 |
| 5   | 已完成鉴定存疑 | 已取消 |

### 鉴定结果 (appraisal_result)

| 值  | 标签   |
| --- | ------ |
| 1   | 真     |
| 2   | 假     |
| 3   | 存疑   |
| 4   | 驳回   |
| 999 | 未指定 |

### 鉴定类别 (appraisal_class)

| 值  | 标签 |
| --- | ---- |
| 1   | 银元 |
| 2   | 古钱 |
| 4   | 杂项 |
| 5   | 纸币 |

## 1. 用户登录

**接口地址**: `POST /api/auth/login`

**请求参数**:

```json
{
  "username": "string", // 用户名/账号
  "password": "string" // 密码
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "access_token": "string", // 访问令牌
    "expires_in": 7200 // 过期时间(秒)
  }
}
```

## 2. 获取用户信息

**接口地址**: `GET /api/user/info`

**请求头**:

```
Authorization: Bearer {accessToken}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "user_id": "string", // 用户ID
    "username": "string", // 用户名
    "nickname": "string", // 昵称
    "phone": "string", // 手机号
    "email": "string", // 邮箱
    "avatar": "string", // 头像URL
    "role": "string", // 角色
    "create_time": "string", // 创建时间
    "update_time": "string" // 更新时间
  }
}
```

## 3. 分页查询鉴定单列表

**接口地址**: `GET /api/appraisal/list`

**请求参数**:

```json
{
  "page": 1, // 页码，默认1
  "pageSize": 20, // 每页数量，默认20
  "appraisalId": "string", // 鉴定ID (可选)
  "phone": "string", // 用户手机号 (可选)
  "title": "string", // 标题 (可选)
  "appraisalClass": "string", // 类目 (可选)
  "createStartTime": "string", // 创建开始时间 (可选) YYYY-MM-DD HH:mm:ss
  "createEndTime": "string", // 创建结束时间 (可选) YYYY-MM-DD HH:mm:ss
  "updateStartTime": "string", // 修改开始时间 (可选) YYYY-MM-DD HH:mm:ss
  "updateEndTime": "string", // 修改结束时间 (可选) YYYY-MM-DD HH:mm:ss
  "lastAppraiser": "string" // 最后提交鉴定师 (可选)
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "total": 100, // 总数量
    "page": 1, // 当前页码
    "page_size": 20, // 每页数量
    "total_pages": 5, // 总页数
    "list": [
      {
        "appraisal_id": "string", // 鉴定ID
        "images": ["string"], // 图片URL数组
        "videos": ["string"], // 视频URL数组
        "appraisal_class": "string", // 类目
        "title": "string", // 标题
        "description": "string", // 描述
        "create_time": "string", // 创建时间
        "update_time": "string", // 最后修改时间
        "appraisal_status": 1 // 状态
      }
    ]
  }
}
```

## 4. 批量查询鉴定单详情

**接口地址**: `POST /api/appraisal/detail`

**请求参数**:

```json
{
  "ids": ["string"] // 鉴定单ID数组
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "查询成功",
  "data": [
    {
      "appraisal_id": "string", // 鉴定ID
      "phone": "string", // 用户手机号
      "last_appraiser": "string", // 最后提交鉴定师名字
      "create_time": "string", // 创建时间
      "update_time": "string", // 最后修改时间
      "appraisal_status": 1, // 状态
      "appraisal_result": 2, // 鉴定结果
      "comment": "string", // 评语
      "reasons": ["string"], // 原因数组 (存疑/驳回时的原因)
      "custom_reason": "string" // 自定义原因
    }
  ]
}
```

## 6. 批量修改鉴定单

**接口地址**: `POST /api/appraisal/update`

**请求参数**:

```json
{
  "items": [
    {
      "appraisalId": "string", // 鉴定单ID (必填)
      "appraisalClass": "string", // 类目 (可选)
      "appraisalResult": 2, // 鉴定结果 (可选)
      "comment": "string", // 评语 (可选)
      "reasons": ["string"], // 原因数组 (可选，存疑/驳回时填写)
      "customReason": "string" // 自定义原因 (可选)
    }
  ]
}
```

**响应数据**:

```json
{
  "code": 200,
  "message": "批量修改完成",
  "data": {
    "success_count": 5, // 成功数量
    "failed_count": 0, // 失败数量
    "failed_items": [] // 失败的项目详情
  }
}
```

## 错误响应格式

```json
{
  "code": -1,
  "message": "错误信息",
  "data": null
}
```
