# API 接口文档

## 基础配置

### 主服务实例 (alovaInstance)
- **BaseURL**: 本地环境 `/api`，生产环境使用 `VITE_BASE_REQUEST_API`
- **认证方式**: Bearer Token (从 localStorage 获取)
- **超时时间**: 10秒

### AI用户服务实例 (aiuser)
- **BaseURL**: 本地环境 `/aiuser`，生产环境 `https://kaimen-d-app-server-164046-6-1360990667.sh.run.tcloudbase.com`
- **认证方式**: Bearer Token
- **特殊处理**: 自动将 `pageSize` 转换为 `size` 参数

### AI聊天服务实例 (aichat)
- **BaseURL**: 本地环境 `/aichat`，生产环境 `https://agent.kaimen.site`
- **认证方式**: 固定 Bearer Token `app-s8l0tNc5oPbHVJBeoLCXoPMg`

---

## 1. 认证模块 (auth)

### 1.1 登录
- **方法**: `POST`
- **路径**: `/api/auth/login`
- **参数**: 
  ```typescript
  {
    username: string,  // 用户名
    password: string   // 密码
  }
  ```
- **用途**: 用户登录，返回用户信息和 token

### 1.2 注册
- **方法**: `POST`
- **路径**: `/api/auth/register`
- **参数**: 
  ```typescript
  {
    username: string,  // 用户名
    password: string,  // 密码
    email?: string,    // 邮箱（可选）
    phone?: string     // 手机号（可选）
  }
  ```
- **用途**: 新用户注册

### 1.3 忘记密码
- **方法**: `POST`
- **路径**: `/api/auth/forget-password`
- **参数**: 
  ```typescript
  {
    email: string,     // 邮箱
    code: string,      // 验证码
    newPassword: string // 新密码
  }
  ```
- **用途**: 通过邮箱验证码重置密码

### 1.4 发送邮箱验证码
- **方法**: `POST`
- **路径**: `/api/auth/send-sms-code`
- **参数**: 
  ```typescript
  {
    email: string  // 邮箱地址
  }
  ```
- **用途**: 发送邮箱验证码用于密码重置等操作

### 1.5 修改密码
- **方法**: `PUT`
- **路径**: `/api/auth/change-password`
- **参数**: 
  ```typescript
  {
    oldPassword: string,  // 旧密码
    newPassword: string   // 新密码
  }
  ```
- **用途**: 修改当前登录用户的密码

### 1.6 退出登录
- **方法**: `POST`
- **路径**: `/api/auth/logout`
- **参数**: 无
- **用途**: 用户退出登录

---

## 2. 用户模块 (user)

### 2.1 获取当前登录用户信息
- **方法**: `GET`
- **路径**: `/api/user/current`
- **参数**: 无
- **用途**: 获取当前登录用户的详细信息

### 2.2 更新用户信息
- **方法**: `POST`
- **路径**: `/api/user/update`
- **参数**: 
  ```typescript
  {
    nickname?: string,  // 昵称（可选）
    email?: string,     // 邮箱（可选）
    phone?: string,     // 手机号（可选）
    avatar?: string     // 头像（可选）
  }
  ```
- **用途**: 更新当前登录用户的基本信息

### 2.3 分页查询用户列表
- **方法**: `GET`
- **路径**: `/api/user/list`
- **参数**: 
  ```typescript
  {
    page: number,           // 页码，默认1
    pageSize: number,       // 每页数量，默认20
    username?: string,       // 用户名（可选）
    nickname?: string,       // 昵称（可选）
    email?: string,          // 邮箱（可选）
    phone?: string,         // 手机号（可选）
    status?: number,         // 用户状态（可选）
    userType?: number        // 用户类型（可选）
  }
  ```
- **用途**: 分页查询用户列表，支持多条件筛选

### 2.4 根据ID获取用户信息
- **方法**: `GET`
- **路径**: `/api/user/{id}`
- **参数**: 
  - `id` (路径参数): 用户ID
- **用途**: 根据用户ID获取指定用户的详细信息

### 2.5 删除用户
- **方法**: `DELETE`
- **路径**: `/api/user/{id}`
- **参数**: 
  - `id` (路径参数): 用户ID
- **用途**: 删除指定用户

### 2.6 禁用用户
- **方法**: `POST`
- **路径**: `/api/user/{id}/disable`
- **参数**: 
  - `id` (路径参数): 用户ID
- **用途**: 禁用指定用户

### 2.7 启用/禁用用户
- **方法**: `POST`
- **路径**: `/api/user/status`
- **参数**: 
  ```typescript
  {
    id: string | number,  // 用户ID
    status: number        // 用户状态 (0: 启用, 1: 禁用)
  }
  ```
- **用途**: 批量设置用户状态（启用或禁用）

---

## 3. 鉴定模块 (appraisal)

### 3.1 分页查询鉴定单列表
- **方法**: `GET`
- **路径**: `/api/appraisal/list`
- **参数**: 
  ```typescript
  {
    page: number,              // 页码，默认1
    pageSize: number,          // 每页数量，默认20
    appraisalId?: string,      // 鉴定ID（可选）
    phone?: string,            // 用户手机号（可选）
    title?: string,            // 标题（可选）
    appraisalClass?: string,   // 类目（可选）
    createStartTime?: string,  // 创建开始时间（可选）格式: YYYY-MM-DD HH:mm:ss
    createEndTime?: string,    // 创建结束时间（可选）格式: YYYY-MM-DD HH:mm:ss
    updateStartTime?: string,  // 修改开始时间（可选）格式: YYYY-MM-DD HH:mm:ss
    updateEndTime?: string,    // 修改结束时间（可选）格式: YYYY-MM-DD HH:mm:ss
    lastSubmitUser?: string    // 最后提交鉴定师（可选）
  }
  ```
- **用途**: 分页查询鉴定单列表，支持多条件筛选和时间范围查询

### 3.2 批量修改鉴定单
- **方法**: `POST`
- **路径**: `/api/appraisal/update`
- **参数**: 
  ```typescript
  {
    items: Array<{
      id: string,              // 鉴定单ID
      appraisal_class: string, // 鉴定类目
      appraisal_status: string // 鉴定状态
    }>
  }
  ```
- **用途**: 批量修改鉴定单的类目和状态

### 3.3 批量添加鉴定结果
- **方法**: `POST`
- **路径**: `/api/appraisal/result/add`
- **参数**: 
  ```typescript
  {
    items: Array<{
      orderId: string,        // 订单ID
      appraisalResult: string, // 鉴定结果
      comment: string,         // 鉴定评语
      reason: string,          // 原因
      userId: string,          // 用户ID
      customReason?: string    // 自定义原因（可选）
    }>
  }
  ```
- **用途**: 批量添加鉴定结果，包含鉴定结果、评语、原因等信息

---

## 4. 求购模块 (appraisal-buy)

### 4.1 获取求购单列表
- **方法**: `GET`
- **路径**: `/api/appraisal-buy/list`
- **参数**: 
  ```typescript
  {
    page: number,              // 页码
    pageSize: number,          // 每页数量
    id?: string,               // 求购ID（可选）
    type?: string,             // 类目（可选）
    desc?: string,             // 描述（可选）
    expected_price?: string,    // 心理价位（可选）
    auth_phone?: string,       // 用户登录授权手机号（可选）
    phone?: string,            // 用户填写联系方式（可选）
    createStartTime?: string,  // 创建开始时间（可选）格式: YYYY-MM-DD HH:mm:ss
    createEndTime?: string     // 创建结束时间（可选）格式: YYYY-MM-DD HH:mm:ss
  }
  ```
- **用途**: 分页查询求购单列表，支持多条件筛选

---

## 5. 寄售模块 (appraisal-consignment)

### 5.1 获取寄售单列表
- **方法**: `GET`
- **路径**: `/api/appraisal-consignment/list`
- **参数**: 
  ```typescript
  {
    page: number,        // 页码
    pageSize: number,    // 每页数量
    phone?: string,      // 手机号（可选）
    buyer_type?: string, // 买家类型（可选）
    desc?: string        // 描述（可选）
  }
  ```
- **用途**: 分页查询寄售单列表，支持多条件筛选

---

## 6. 文章模块 (article)

### 6.1 分页查询文章列表
- **方法**: `GET`
- **路径**: `/api/article/list`
- **参数**: 
  ```typescript
  {
    page: number,              // 页码，默认1
    pageSize: number,          // 每页数量，默认20
    title?: string,            // 标题（可选）
    author?: string,           // 作者（可选）
    pub_status?: string,       // 发布状态（可选）
    createStartTime?: string,  // 创建开始时间（可选）格式: YYYY-MM-DD HH:mm:ss
    createEndTime?: string     // 创建结束时间（可选）格式: YYYY-MM-DD HH:mm:ss
  }
  ```
- **用途**: 分页查询文章列表，支持多条件筛选。自动处理云存储图片 URL 转换

### 6.2 获取文章详情
- **方法**: `GET`
- **路径**: `/api/article/detail`
- **参数**: 
  ```typescript
  {
    id: string  // 文章ID
  }
  ```
- **用途**: 根据文章ID获取文章详细信息

### 6.3 创建文章
- **方法**: `POST`
- **路径**: `/api/article/create`
- **参数**: 
  ```typescript
  {
    title: string,        // 标题
    author: string,        // 作者
    cover_pic: string,     // 封面图片
    rich_content: string,  // 富文本内容
    pub_status: string     // 发布状态
  }
  ```
- **用途**: 创建新文章

### 6.4 更新文章
- **方法**: `PUT`
- **路径**: `/api/article/update`
- **参数**: 
  - 路径参数: `article_id` (number) - 文章ID
  - 请求体:
  ```typescript
  {
    title?: string,        // 标题（可选）
    author?: string,        // 作者（可选）
    cover_pic?: string,     // 封面图片（可选）
    rich_content?: string,  // 富文本内容（可选）
    pub_status?: string     // 发布状态（可选）
  }
  ```
- **用途**: 更新指定文章的信息

### 6.5 启用文章
- **方法**: `PUT`
- **路径**: `/api/article/enable`
- **参数**: 
  ```typescript
  {
    article_id: number  // 文章ID（路径参数）
  }
  ```
- **用途**: 启用指定文章

### 6.6 禁用文章
- **方法**: `PUT`
- **路径**: `/api/article/disable`
- **参数**: 
  ```typescript
  {
    article_id: number  // 文章ID（路径参数）
  }
  ```
- **用途**: 禁用指定文章

---

## 7. 聊天模块 (chat)

### 7.1 获取聊天消息列表(AI客服相关不用管)
- **方法**: `GET`
- **路径**: `/v1/messages`
- **服务**: aichat (AI聊天服务)
- **参数**: 
  ```typescript
  {
    // 查询参数，具体格式根据后端API定义
  }
  ```
- **用途**: 获取AI聊天消息列表

### 7.2 获取用户信息列表(AI客服相关不用管)
- **方法**: `GET`
- **路径**: `/user/userinfo`
- **服务**: aiuser (AI用户服务)
- **参数**: 
  ```typescript
  {
    // 查询参数
  }
  ```
- **用途**: 获取用户信息列表

### 7.3 获取AI聊天列表(AI客服相关不用管)
- **方法**: `GET`
- **路径**: `/v1/messages`
- **服务**: aichat (AI聊天服务)
- **参数**: 
  ```typescript
  {
    // 查询参数
  }
  ```
- **用途**: 获取AI聊天消息列表（与7.1功能相同）

### 7.4 获取用户金币列表(AI客服相关不用管)
- **方法**: `POST`
- **路径**: `/user/userinfolist`
- **服务**: aiuser (AI用户服务)
- **参数**: 
  ```typescript
  {
    // 请求体参数，具体格式根据后端API定义
  }
  ```
- **用途**: 获取用户金币相关信息列表

### 7.5 获取金币兑换记录列表(AI客服相关不用管)
- **方法**: `GET`
- **路径**: `/user/goldexchangelist`
- **服务**: aiuser (AI用户服务)
- **参数**: 
  ```typescript
  {
    userinfoid: string  // 用户信息ID
  }
  ```
- **用途**: 根据用户信息ID查询金币兑换记录

### 7.6 金币兑换(AI客服相关不用管)
- **方法**: `POST`
- **路径**: `/user/goldexchange`
- **服务**: aiuser (AI用户服务)
- **参数**: 
  ```typescript
  {
    // 请求体参数，具体格式根据后端API定义
  }
  ```
- **用途**: 执行金币兑换操作

---

## 8. 日常模块 (daily)

### 8.1 获取鉴定单列表（精细）
- **方法**: `GET`
- **路径**: `/api/appraisal/list`
- **参数**: 
  ```typescript
  {
    // 查询参数，与鉴定模块的查询参数相同
  }
  ```
- **用途**: 查询鉴定单列表（用于日常管理）

---

## 9. 上传模块 (upload)

### 9.1 上传图片
- **方法**: `POST`
- **路径**: `/api/upload/image`
- **参数**: 
  - FormData:
    ```typescript
    {
      file: File  // 要上传的图片文件
    }
    ```
- **用途**: 上传图片文件到服务器

---

## 注意事项

1. **认证**: 除登录、注册、忘记密码等公开接口外，其他接口都需要在请求头中携带 Bearer Token
2. **参数清理**: 所有请求会自动清理空值参数
3. **错误处理**: 
   - 401 状态码会自动清除 token 并跳转到登录页
   - 其他错误会抛出异常并显示错误消息
4. **时间格式**: 所有时间参数格式为 `YYYY-MM-DD HH:mm:ss`
5. **分页参数**: 
   - 主服务使用 `page` 和 `pageSize`
   - AI用户服务会自动将 `pageSize` 转换为 `size`
6. **图片处理**: 文章列表接口会自动将云存储路径 (`cloud://`) 转换为临时访问 URL
