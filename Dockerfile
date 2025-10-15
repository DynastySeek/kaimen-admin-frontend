## 多阶段构建：Node 构建 + Nginx 静态服务

# 1) 构建阶段：使用 pnpm 构建 Vite 项目
FROM node:20-alpine AS builder
ARG BUILD_MODE=prod
WORKDIR /app

# 仅复制依赖清单以利用缓存
COPY package.json pnpm-lock.yaml .npmrc ./
RUN npm i -g pnpm && pnpm install --no-frozen-lockfile

# 复制源代码并构建（生产模式）
COPY . .
RUN pnpm build:${BUILD_MODE}

# 2) 运行阶段：使用 Nginx 提供静态资源
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 提供基本的 SPA 回退配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
