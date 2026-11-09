<script setup lang="ts">
import { ref, computed } from "vue";

const props = withDefaults(
  defineProps<{
    images?: string[];
    fallbackImage?: string;
    alt?: string;
    badgeText?: string;
    badgeColor?: string;
    aspectRatio?: string; // 예: "1/1", "4/3"
    showArrows?: boolean;
    showDots?: boolean;
    showCounter?: boolean;
  }>(),
  {
    images: () => [],
    fallbackImage: "/images/products/apple.jpg",
    alt: "뜨개옷 상품 사진",
    badgeText: "",
    badgeColor: "#ff4d6d",
    aspectRatio: "1/1",
    showArrows: true,
    showDots: true,
    showCounter: true,
  }
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent | TouchEvent): void;
  (e: "change", index: number): void;
}>();

// 표시할 실제 이미지 목록 (최소 1개)
const displayImages = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images.filter((img) => !!img && img.trim().length > 0);
  }
  return [props.fallbackImage];
});

const hasMultiple = computed(() => displayImages.value.length > 1);
const currentIndex = ref(0);

// 슬라이드 이동
const goTo = (index: number) => {
  const len = displayImages.value.length;
  if (len === 0) return;
  currentIndex.value = (index + len) % len;
  emit("change", currentIndex.value);
};

const prev = () => goTo(currentIndex.value - 1);
const next = () => goTo(currentIndex.value + 1);

// 터치 스와이프 감지 상태
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isSwiping = false;

const onTouchStart = (e: TouchEvent) => {
  if (!hasMultiple.value) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchEndX = touchStartX;
  touchEndY = touchStartY;
  isSwiping = false;
};

const onTouchMove = (e: TouchEvent) => {
  if (!hasMultiple.value) return;
  touchEndX = e.touches[0].clientX;
  touchEndY = e.touches[0].clientY;
  const deltaX = Math.abs(touchEndX - touchStartX);
  const deltaY = Math.abs(touchEndY - touchStartY);

  // 수평 제스처가 수직 스크롤보다 크면 스와이프로 판단하고 수직 스크롤 방지
  if (deltaX > deltaY && deltaX > 15) {
    isSwiping = true;
    e.preventDefault();
  }
};

const onTouchEnd = (e: TouchEvent) => {
  if (!hasMultiple.value) return;
  const diffX = touchEndX - touchStartX;
  const diffY = Math.abs(touchEndY - touchStartY);

  // 35px 이상 좌우로 밀었을 때 스와이프 전환
  if (Math.abs(diffX) > 35 && diffY < 60) {
    if (diffX < 0) {
      next();
    } else {
      prev();
    }
  }
};

// 탭/클릭 핸들러: 드래그/스와이프가 아니었을 때만 상위 클릭 이벤트 전파
const handleClick = (e: MouseEvent) => {
  if (isSwiping) {
    isSwiping = false;
    e.stopPropagation();
    return;
  }
  emit("click", e);
};
</script>

<template>
  <div
    class="product-image-swipe"
    :style="{ aspectRatio: aspectRatio }"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click="handleClick"
  >
    <!-- 이미지 트랙 (트랜지션 효과) -->
    <div
      class="swipe-track"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="(img, idx) in displayImages"
        :key="`${img}-${idx}`"
        class="swipe-slide"
      >
        <img
          :src="img"
          :alt="`${alt} ${idx + 1}`"
          class="slide-img"
          loading="lazy"
        />
      </div>
    </div>

    <!-- 라벨 뱃지 (BEST, HOT, 추천 등) -->
    <span
      v-if="badgeText"
      class="swipe-badge"
      :style="{ backgroundColor: badgeColor }"
      @click.stop
    >
      {{ badgeText }}
    </span>

    <!-- 다중 사진 카운터 뱃지 (예: 1 / 3) -->
    <span
      v-if="hasMultiple && showCounter"
      class="swipe-counter font-mono"
      @click.stop
    >
      {{ currentIndex + 1 }} / {{ displayImages.length }}
    </span>

    <!-- 좌우 이동 화살표 (2장 이상일 때 노출) -->
    <template v-if="hasMultiple && showArrows">
      <button
        type="button"
        class="swipe-nav btn-prev"
        aria-label="이전 사진"
        @click.stop="prev"
      >
        ‹
      </button>
      <button
        type="button"
        class="swipe-nav btn-next"
        aria-label="다음 사진"
        @click.stop="next"
      >
        ›
      </button>
    </template>

    <!-- 하단 도트 인디케이터 (● ○ ○) -->
    <div
      v-if="hasMultiple && showDots"
      class="swipe-dots"
      @click.stop
    >
      <button
        v-for="(_, dotIdx) in displayImages"
        :key="`dot-${dotIdx}`"
        type="button"
        class="swipe-dot"
        :class="{ active: currentIndex === dotIdx }"
        :aria-label="`${dotIdx + 1}번 사진으로 이동`"
        @click="goTo(dotIdx)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.product-image-swipe {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 14px;
  background: #f7f3ee;
  user-select: none;
  touch-action: pan-y;
  cursor: pointer;
}

.swipe-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1);
  will-change: transform;
}

.swipe-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  position: relative;
}

.slide-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

/* 뱃지 */
.swipe-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2.5px 7px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
  pointer-events: none;
}

/* 카운터 뱃지 (1 / 3) */
.swipe-counter {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(43, 31, 29, 0.65);
  color: #ffffff;
  font-size: 0.64rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2;
  pointer-events: none;
}

/* 화살표 네비게이션 */
.swipe-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(235, 220, 208, 0.7);
  color: #4a3431;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  box-shadow: 0 2px 6px rgba(43, 31, 29, 0.15);
  transition: all 0.15s;
  padding: 0;
  opacity: 0.85;
}

.swipe-nav:hover {
  background: #ffffff;
  opacity: 1;
  transform: translateY(-50%) scale(1.08);
}

.btn-prev {
  left: 6px;
  padding-right: 2px;
}

.btn-next {
  right: 6px;
  padding-left: 2px;
}

/* 도트 인디케이터 */
.swipe-dots {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  z-index: 2;
  padding: 3px 6px;
  background: rgba(43, 31, 29, 0.45);
  border-radius: 10px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.swipe-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s;
}

.swipe-dot.active {
  width: 14px;
  border-radius: 4px;
  background: #ff4d6d;
}

@media (max-width: 480px) {
  .swipe-nav {
    width: 22px;
    height: 22px;
    font-size: 1rem;
  }
}
</style>
