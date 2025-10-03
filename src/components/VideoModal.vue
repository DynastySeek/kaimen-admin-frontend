<template>
  <NModal
    v-model:show="visible"
    preset="card"
    :title="title"
    class="video-modal"
    :style="{
      width: '60vw',
      maxWidth: '800px',
    }"
    :mask-closable="true"
    :closable="true"
    @after-leave="handleAfterLeave"
  >
    <div class="video-container">
      <vue3-video-play
        v-if="visible && src"
        :src="src"
        :title="title"
        width="100%"
        height="460px"
        :poster="poster"
        :auto-play="false"
        :muted="false"
        :control="true"
        :speed="true"
        :web-full-screen="false"
        :volume="0.3"
        :speed-rate="['2.0', '1.5', '1.25', '1.0', '0.75', '0.5']"
        :control-btns="['speedRate', 'volume', 'setting', 'pip', 'pageFullScreen', 'fullScreen']"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @error="handleError"
      />
      <div v-else-if="visible && !src" class="no-video">
        <NEmpty description="暂无视频" />
      </div>
    </div>
  </NModal>
</template>

<script setup>
import { NEmpty, NModal } from 'naive-ui';
import { ref, watch } from 'vue';

/**
 * 视频播放弹窗组件
 * 基于 vue3-video-play 和 naive-ui 的模态框
 */
const props = defineProps({
  /** 是否显示弹窗 */
  show: {
    type: Boolean,
    default: false,
  },
  /** 视频地址 */
  src: {
    type: String,
    default: '',
  },
  /** 视频标题 */
  title: {
    type: String,
    default: '视频播放',
  },
  /** 视频封面 */
  poster: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:show', 'play', 'pause', 'ended', 'error']);

const visible = ref(false);

/**
 * 监听 show 属性变化
 */
watch(
  () => props.show,
  (newVal) => {
    visible.value = newVal;
  },
  { immediate: true },
);

/**
 * 监听 visible 变化，同步到父组件
 */
watch(visible, (newVal) => {
  emit('update:show', newVal);
});

/**
 * 弹窗关闭后的处理
 */
function handleAfterLeave() {
  // 弹窗关闭后可以进行一些清理工作
}

/**
 * 视频播放事件
 */
function handlePlay(event) {
  emit('play', event);
}

/**
 * 视频暂停事件
 */
function handlePause(event) {
  emit('pause', event);
}

/**
 * 视频播放结束事件
 */
function handleEnded(event) {
  emit('ended', event);
}

/**
 * 视频播放错误事件
 */
function handleError(event) {
  emit('error', event);
}
</script>

<style scoped>
.video-modal {
  --n-border-radius: 8px;
}

.video-container {
  @apply w-full flex items-center justify-center bg-black rounded overflow-hidden;
  min-height: 45vh;
}

.no-video {
  @apply w-full flex items-center justify-center bg-gray-100;
  height: 45vh;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-modal {
    width: 95vw !important;
  }

  .video-container {
    min-height: 35vh;
  }

  .no-video {
    height: 35vh;
  }
}
</style>
