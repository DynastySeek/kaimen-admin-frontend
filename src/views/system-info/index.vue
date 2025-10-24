<template>
  <CommonPage title="系统信息">
    <n-card>
      <n-descriptions label-placement="left" bordered :column="3">
        <n-descriptions-item label="浏览器名称">
          {{ systemInfo.browser.name }}
        </n-descriptions-item>
        <n-descriptions-item label="浏览器版本">
          {{ systemInfo.browser.version }}
        </n-descriptions-item>
        <n-descriptions-item label="操作系统">
          {{ systemInfo.os.name }}
        </n-descriptions-item>
        <n-descriptions-item label="操作系统版本">
          {{ systemInfo.os.version }}
        </n-descriptions-item>
        <n-descriptions-item label="设备类型">
          {{ systemInfo.device.type || '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="是否移动设备">
          <n-tag :type="systemInfo.deviceIsMobile ? 'success' : 'warning'">
            {{ systemInfo.deviceIsMobile ? '是' : '否' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="设备厂商">
          {{ systemInfo.device.vendor || '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="设备型号">
          {{ systemInfo.device.model || '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="CPU架构">
          {{ systemInfo.cpu.architecture || '未知' }}
        </n-descriptions-item>
        <n-descriptions-item label="是否ARM架构">
          <n-tag :type="systemInfo.cpuIsArm ? 'success' : 'warning'">
            {{ systemInfo.cpuIsArm ? '是' : '否' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="CPU核心数">
          {{ systemInfo.cpuCores }}
        </n-descriptions-item>
        <n-descriptions-item label="屏幕分辨率">
          {{ systemInfo.screen.width }} x {{ systemInfo.screen.height }}
        </n-descriptions-item>
        <n-descriptions-item label="颜色深度">
          {{ systemInfo.screen.colorDepth }} 位
        </n-descriptions-item>
        <n-descriptions-item label="设备像素比">
          {{ systemInfo.screen.pixelRatio }}
        </n-descriptions-item>
        <n-descriptions-item label="语言">
          {{ systemInfo.language }}
        </n-descriptions-item>
        <n-descriptions-item label="时区">
          {{ systemInfo.timezone }}
        </n-descriptions-item>
        <n-descriptions-item label="在线状态">
          <n-tag :type="systemInfo.online ? 'success' : 'error'">
            {{ systemInfo.online ? '在线' : '离线' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="Cookie 启用">
          <n-tag :type="systemInfo.cookieEnabled ? 'success' : 'error'">
            {{ systemInfo.cookieEnabled ? '是' : '否' }}
          </n-tag>
        </n-descriptions-item>
        <n-descriptions-item label="User Agent" :span="3">
          <n-input
            v-model:value="userAgent"
            type="textarea"
            readonly
            :autosize="{ minRows: 3,
                         maxRows: 5 }"
          />
        </n-descriptions-item>
        <n-descriptions-item v-for="(supported, feature) in featureSupport" :key="feature" :label="feature">
          <n-tag :type="supported ? 'success' : 'error'">
            {{ supported ? '支持' : '不支持' }}
          </n-tag>
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
  </CommonPage>
</template>

<script setup>
import { UAParser } from 'ua-parser-js';
import { CommonPage } from '@/components';

const userAgent = navigator.userAgent;
const { browser, os, device, cpu } = UAParser(userAgent);

// 获取系统信息
const systemInfo = reactive({
  browser,
  os,
  device,
  cpu,
  // 设备类型检测
  deviceIsMobile: device.is('mobile'),
  // CPU 类型检测
  cpuIsArm: cpu.is('arm'),
  cpuCores: navigator.hardwareConcurrency || '未知',
  screen: {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
  },
  language: navigator.language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  online: navigator.onLine,
  cookieEnabled: navigator.cookieEnabled,
});

// 检测浏览器功能支持
const featureSupport = reactive({
  '本地存储': !!window.localStorage,
  'WebSocket': !!window.WebSocket,
  'WebWorker': !!window.Worker,
  'Canvas': !!document.createElement('canvas').getContext,
  'WebGL': (function () {
    try {
      return !!window.WebGLRenderingContext
        && !!document.createElement('canvas').getContext('webgl');
    } catch (_) {
      return false;
    }
  })(),
  'Geolocation': !!navigator.geolocation,
  'WebRTC': !!window.RTCPeerConnection,
  'Service Worker': !!navigator.serviceWorker,
  'IndexedDB': !!window.indexedDB,
});
</script>
