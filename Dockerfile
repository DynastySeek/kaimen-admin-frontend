# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS builder
WORKDIR /app
ARG BUILD_MODE=prod
RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml .npmrc ./

# 使用 BuildKit cache mount 缓存 pnpm store
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build:${BUILD_MODE}

FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
