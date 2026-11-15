<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useBodyScrollLock } from "~/composables/useBodyScrollLock";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    images?: string[];
    initialIndex?: number;
    title?: string;
  }>(),
  {
    images: () => [],
    initialIndex: 0,
    title: "",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

// 🔒 모달 열렸을 때 뒷배경 스크롤 방지
useBodyScrollLock(isOpen);

const currentIndex = ref(0);

watch(
  () => props.initialIndex,
  (val) => {
    currentIndex.value = val || 0;
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      currentIndex.value = props.initialIndex || 0;
    }
  }
);

const displayList = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images;
  }
  return ["/images/products/apple.jpg"];
});

const currentImage = computed(() => {
  const len = displayList.value.length;
  if (len === 0) return "/images/products/apple.jpg";
  const safeIdx = Math.max(0, Math.min(currentIndex.value, len - 1));
  return displayList.value[safeIdx];
});

const prev = () => {
  const len = displayList.value.length;
  if (len <= 1) return;
  currentIndex.value = (currentIndex.value - 1 + len) % len;
};

const next = () => {
  const len = displayList.value.length;
  if (len <= 1) return;
  currentIndex.value = (currentIndex.value + 1) % len;
};

const close = () => {
  isOpen.value = false;
};

// 키보드 방향키 및 ESC 닫기 지원
const onKeyDown = (e: KeyboardEvent) => {
  if (!isOpen.value) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
};

if (typeof window !== "undefined") {
  window.addEventListener("keydown", onKeyDown);
}

// 터치 스와이프 지원
let touchStartX = 0;
let touchEndX = 0;

const onTouchStart = (e: TouchEvent) => {
  touchStartX = e.touches[0].clientX;
  touchEndX = touchStartX;
};

const onTouchMove = (e: TouchEvent) => {
  touchEndX = e.touches[0].clientX;
};

const onTouchEnd = () => {
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) > 40) {
    if (diff < 0) next();
    else prev();
  }
};
</script>

<template>
  <transition name="zoom-fade">
    <div
      v-if="isOpen"
      class="zoom-lightbox-backdrop"
      @click.self="close"
    >
      <!-- 상단 컨트롤 헤더 -->
      <div class="zoom-header" @click.stop>
        <div class="zoom-title-group">
          <span class="zoom-tag">🔍 사진 확대보기</span>
          <span v-if="title" class="zoom-prod-title">{{ title }}</span>
        </div>
        <button
          type="button"
          class="btn-zoom-close"
          aria-label="닫기"
          @click="close"
        >
          <i class="material-icons">close</i>
        </button>
      </div>

      <!-- 메인 뷰어 영역 -->
      <div
        class="zoom-viewer-container"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @click.self="close"
      >
        <!-- 좌측 이전 버튼 -->
        <button
          v-if="displayList.length > 1"
          type="button"
          class="zoom-nav-btn btn-prev"
          aria-label="이전 사진"
          @click.stop="prev"
        >
          ‹
        </button>

        <!-- 확대 이미지 프레임 -->
        <div class="zoom-image-wrapper" @click.self="close">
          <img
            :src="currentImage"
            :alt="title || '확대 사진'"
            class="zoom-main-img"
          />
        </div>

        <!-- 우측 다음 버튼 -->
        <button
          v-if="displayList.length > 1"
          type="button"
          class="zoom-nav-btn btn-next"
          aria-label="다음 사진"
          @click.stop="next"
        >
          ›
        </button>
      </div>

      <!-- 하단 인디케이터 및 썸네일 바 -->
      <div class="zoom-footer" @click.stop>
        <span class="zoom-counter font-mono">
          {{ currentIndex + 1 }} / {{ displayList.length }}
        </span>

        <!-- 다중 썸네일 바 -->
        <div v-if="displayList.length > 1" class="zoom-thumb-strip">
          <button
            v-for="(img, idx) in displayList"
            :key="idx"
            type="button"
            class="zoom-thumb-btn"
            :class="{ active: currentIndex === idx }"
            @click="currentIndex = idx"
          >
            <img :src="img" :alt="`썸네일 ${idx + 1}`" class="zoom-thumb-img" />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.zoom-lightbox-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(18, 12, 11, 0.92);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  box-sizing: border-box;
  user-select: none;
}

/* 상단 헤더 */
.zoom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  z-index: 10;
}

.zoom-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.zoom-tag {
  background: rgba(255, 77, 109, 0.25);
  border: 1px solid rgba(255, 77, 109, 0.6);
  color: #ff758f;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
}

.zoom-prod-title {
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 700;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-zoom-close {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-zoom-close:hover {
  background: rgba(255, 77, 109, 0.9);
  border-color: #ff4d6d;
  transform: rotate(90deg);
}

/* 중앙 뷰어 */
.zoom-viewer-container {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 10px 0;
  touch-action: pan-y;
}

.zoom-image-wrapper {
  max-width: 100%;
  max-height: 72vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-main-img {
  max-width: 92vw;
  max-height: 72vh;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  pointer-events: auto;
  transition: transform 0.2s;
}

/* 네비게이션 좌우 화살표 버튼 (크고 손쉽게 터치 가능) */
.zoom-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #ffffff;
  font-size: 1.8rem;
  font-weight: 300;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.15s;
  padding: 0;
}

.zoom-nav-btn:hover {
  background: #ffffff;
  color: #2b1f1d;
  transform: translateY(-50%) scale(1.1);
}

.zoom-nav-btn.btn-prev {
  left: 6px;
  padding-right: 3px;
}

.zoom-nav-btn.btn-next {
  right: 6px;
  padding-left: 3px;
}

/* 하단 푸터 */
.zoom-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  z-index: 10;
}

.zoom-counter {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.zoom-thumb-strip {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  max-width: 90vw;
  padding: 4px;
}

.zoom-thumb-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid transparent;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  background: #000;
  opacity: 0.5;
  transition: all 0.15s;
  flex-shrink: 0;
}

.zoom-thumb-btn.active {
  border-color: #ff4d6d;
  opacity: 1;
  transform: scale(1.08);
}

.zoom-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 트랜지션 애니메이션 */
.zoom-fade-enter-active,
.zoom-fade-leave-active {
  transition: opacity 0.22s ease;
}

.zoom-fade-enter-from,
.zoom-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .zoom-lightbox-backdrop {
    padding: 12px 8px;
  }
  .zoom-nav-btn {
    width: 38px;
    height: 38px;
    font-size: 1.5rem;
    background: rgba(0, 0, 0, 0.45);
  }
  .zoom-main-img {
    max-height: 65vh;
  }
}
</style>
