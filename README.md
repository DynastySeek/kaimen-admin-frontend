## 开发命令

```bash
# 安装依赖
pnpm install

# 开发环境启动
pnpm dev

# 使用 Mock 数据启动
pnpm mock

# 生产环境启动
pnpm prod

# 构建生产环境
pnpm build
# 或
pnpm build:prod

# 构建开发环境
pnpm build:dev

# 预览开发环境构建结果
pnpm preview:dev

# 预览生产环境构建结果
pnpm preview:prod

# 代码格式修复
pnpm lint:fix

# 更新依赖
pnpm up
```

## 技术栈

- Vue3
- Vite
- Naive UI
- Pinia
- Vue Router
- UnoCSS
- Alova
- ECharts
- VueUse

## 目录结构

```
├── build                   # 构建相关配置
├── public                  # 静态资源
├── src                     # 源代码
│   ├── assets              # 主题、字体、图片等静态资源
│   ├── components          # 全局组件
│   ├── composables         # 组合式函数
│   ├── config              # 全局配置
│   ├── directives          # 全局指令
│   ├── layouts             # 布局组件
│   ├── router              # 路由配置
│   ├── services            # 服务层
│   ├── store               # Pinia 状态管理
│   ├── styles              # 全局样式
│   ├── utils               # 全局工具函数
│   ├── views               # 所有页面
│   ├── App.vue             # 入口页面
│   └── main.js             # 入口文件
├── .env                    # 环境变量
└── vite.config.js          # Vite 配置
```
