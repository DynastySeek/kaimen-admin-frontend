<template>
    <div class="inline-block" :style="containerStyle">
      <template v-if="!images || images.length === 0">
        <div>
          -
        </div>
      </template>
      <template v-else>
        <n-image-group>
          <n-space>
            <span
              v-for="(image, index) in displayImages"
              :key="index"
              class="relative inline-block"
            >
              <n-image
                :style="{ maxWidth: `${width}px`,
                          maxHeight: `${height}px` }"
                :width="width"
                :height="height"
                :src="$resourceUrl(image)"
                :fallback-src="$resourceUrl(fallbackSrc)"
                object-fit="cover"
                :preview-src="$resourceUrl(image)"
                class="overflow-hidden rounded-md"
              />
              <n-badge
                v-if="index === displayImages.length - 1 && hasMore"
                :value="remainingCount"
                :show-zero="false"
                :max="badgeMax"
                class="absolute z-1 -right-8 -top-6"
              />
            </span>
          </n-space>
        </n-image-group>
      </template>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import FallbackImage from '@/assets/images/image_fallback.png';
  
  /**
   * 图片预览组件
   * 支持多图片显示、预览和数量标记
   */
  const props = defineProps({
    /** 图片数组 */
    images: {
      type: Array,
      default: () => [],
    },
    /** 最大显示图片数量 */
    maxDisplay: {
      type: Number,
      default: 3,
    },
    /** 图片宽度 */
    width: {
      type: [String, Number],
      default: 60,
    },
    /** 图片高度 */
    height: {
      type: [String, Number],
      default: 60,
    },
    /** 徽章最大显示数字 */
    badgeMax: {
      type: Number,
      default: 10,
    },
    /** 占位图片 */
    fallbackSrc: {
      type: String,
      default: FallbackImage,
    },
    /** 自定义容器样式 */
    containerStyle: {
      type: Object,
      default: () => ({}),
    },
  });
  
  /**
   * 显示的图片列表
   */
  const displayImages = computed(() => {
    if (!props.images || props.images.length === 0) {
      return [];
    }
    return props.images.slice(0, props.maxDisplay);
  });
  
  /**
   * 是否有更多图片
   */
  const hasMore = computed(() => {
    return props.images && props.images.length > props.maxDisplay;
  });
  
  /**
   * 剩余图片数量
   */
  const remainingCount = computed(() => {
    if (!hasMore.value) {
      return 0;
    }
    return props.images.length - props.maxDisplay;
  });
  </script>
  