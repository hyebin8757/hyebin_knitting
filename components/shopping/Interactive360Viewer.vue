<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { cx, css } from "@emotion/css";

const props = withDefaults(defineProps<{
  isDetail?: boolean;
  productId?: number;
}>(), {
  isDetail: false,
  productId: 1
});

// 프레임 수 및 이미지 목록 정의
const TOTAL_FRAMES = 5;

// 현재 파일이 존재하는 1번, 2번, 3번 폴더에 대응하고, 향후 다른 상품 추가 시 대비할 수 있는 동적 360° 에셋 파이프라인
const IMAGES = computed(() => {
  // 1번, 2번, 3번 폴더에 파일이 실제로 존재하므로, 다른 번호의 경우 1번으로 폴백하여 엑박 방지 (UX 무결성 확보)
  const targetId = [1, 2, 3].includes(props.productId) ? props.productId : 1;
  const ext = [2, 3].includes(targetId) ? "webp" : "png";
  return [
    `/images/img/salomon/shoes/${targetId}/shoes_img01.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img02.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img03.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img04.${ext}`,
    `/images/img/salomon/shoes/${targetId}/shoes_img05.${ext}`,
  ];
});
const COLS = 4;
const ROWS = 2;

const currentFrame = ref(0);
const currentFrameFloat = ref(0);

// 드래그 및 관성 물리 제어 상태 변수
const isDragging = ref(false);
const startX = ref(0);
const lastX = ref(0);
const lastTime = ref(0);
const velocity = ref(0); // 실시간 회전 속도 (관성 동력)
const startFrameFloat = ref(0);

let animationFrameId: number | null = null;
let autoPlayTimer: any = null;
const isHovered = ref(false);

const viewerRef = ref<HTMLElement | null>(null);

// 현재 프레임에 해당하는 이미지 URL 계산
const currentImage = computed(() => IMAGES.value[currentFrame.value]);

// 관성(물리 감쇄) 애니메이션 루프
const updateInertia = () => {
  if (isDragging.value) return;

  // 감찰 마찰계수(Friction) 적용하여 속도 감쇠
  velocity.value *= 0.93;

  // 속도값에 따라 프레임을 부드럽게 감산/가산 누적
  currentFrameFloat.value -= velocity.value * 0.45;
  
  // 프레임 인덱스 순환 처리 (0 ~ 7)
  let targetFrame = Math.round(currentFrameFloat.value) % TOTAL_FRAMES;
  if (targetFrame < 0) {
    targetFrame += TOTAL_FRAMES;
  }
  currentFrame.value = targetFrame;

  // 속도가 임계값 이하로 내려가면 정지
  if (Math.abs(velocity.value) > 0.05) {
    animationFrameId = requestAnimationFrame(updateInertia);
  } else {
    velocity.value = 0;
    animationFrameId = null;
  }
};

// 드래그 시작 핸들러
const handleDragStart = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  isHovered.value = true;
  
  // 진행 중이던 관성 애니메이션 및 오토 데모 정지
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
  }

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  startX.value = clientX;
  lastX.value = clientX;
  lastTime.value = performance.now();
  startFrameFloat.value = currentFrameFloat.value;
  velocity.value = 0;

  if (!('touches' in e)) {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
  }
};

// 드래그 중인 동안의 미세 속도(모멘텀) 실시간 계측
const handleDragMove = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value || !viewerRef.value) return;

  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const currentTime = performance.now();
  
  const deltaX = clientX - startX.value;
  const timeDelta = currentTime - lastTime.value;

  // 물리 속도 측정: (현재 좌표 - 이전 좌표) / 경과 시간
  if (timeDelta > 0) {
    const currentVelocity = (clientX - lastX.value) / timeDelta;
    // 떨림 제어 필터링 (가중평균 관성 보정)
    velocity.value = velocity.value * 0.5 + currentVelocity * 0.5;
  }

  // 드래그 감도 설정 (30픽셀당 1프레임 전환)
  const sensitivity = 30;
  const frameDelta = deltaX / sensitivity;

  currentFrameFloat.value = startFrameFloat.value - frameDelta;

  // 순환 프레임 적용
  let targetFrame = Math.round(currentFrameFloat.value) % TOTAL_FRAMES;
  if (targetFrame < 0) {
    targetFrame += TOTAL_FRAMES;
  }
  currentFrame.value = targetFrame;

  lastX.value = clientX;
  lastTime.value = currentTime;
};

// 드래그 종료 핸들러
const handleDragEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  window.removeEventListener('mousemove', handleDragMove);
  window.removeEventListener('mouseup', handleDragEnd);

  // 누적된 드래그 속도가 있을 경우 부드러운 관성 회전 루프 가속화
  if (Math.abs(velocity.value) > 0.08) {
    animationFrameId = requestAnimationFrame(updateInertia);
  }
};

// hover 기반 프레임 변경 제거 - click+drag 시에만 회전

// 모바일 터치 이벤트 맵핑
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  handleDragStart(e);
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  handleDragMove(e);
};

const handleTouchEnd = () => {
  handleDragEnd();
};

onMounted(() => {
  // 자동 재생 없이 정지 상태로 시작
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (autoPlayTimer) clearInterval(autoPlayTimer);
  window.removeEventListener('mousemove', handleDragMove);
  window.removeEventListener('mouseup', handleDragEnd);
});

/************************************************************
 * Styles (Emotion CSS)
 ************************************************************/
const Styles = {
  Container: css`
    position: relative;
    max-width: ${props.isDetail ? "100%" : "1000px"};
    width: 100%;
    margin: ${props.isDetail ? "0" : "6rem auto"};
    background: ${props.isDetail ? "transparent" : "radial-gradient(circle at 50% 30%, #151d2a 0%, #06090e 100%)"};
    border: ${props.isDetail ? "none" : "1px solid rgba(0, 242, 254, 0.25)"};
    box-shadow: ${props.isDetail ? "none" : "0 25px 60px rgba(0, 0, 0, 0.85), inset 0 0 50px rgba(0, 242, 254, 0.08)"};
    border-radius: ${props.isDetail ? "0" : "12px"};
    padding: ${props.isDetail ? "0" : "4rem 2rem"};
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: hidden;

    @media (max-width: 768px) {
      padding: ${props.isDetail ? "0" : "2rem 1.6rem"};
      margin: ${props.isDetail ? "0" : "3rem auto"};
    }
  `,

  Header: css`
    text-align: center;
    margin-bottom: 2rem;
    display: ${props.isDetail ? "none" : "block"};
    
    .viewer-title {
      font-size: 2.6rem;
      font-weight: 900;
      letter-spacing: 0.15em;
      color: #ffffff;
      
      span {
        background: linear-gradient(135deg, #ffffff, #00f2fe);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 25px rgba(0, 242, 254, 0.4);
      }
    }

    .viewer-subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.8rem;
      letter-spacing: 0.05em;
      word-break: keep-all;
    }
  `,

  Viewport: css`
    position: relative;
    width: 100%;
    max-width: 520px;
    height: 400px;
    cursor: grab;
    user-select: none;
    -webkit-user-drag: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      cursor: grabbing;
    }

    @media (max-width: 768px) {
      height: 280px; /* 모바일에서 세로 영역 축소 */
    }
  `,

  // 쏘렌토 360 복각 핵심: 신발 하단에 입체 투영되는 '3D 회전 오빗 링' UI
  OrbitRing: css`
    position: absolute;
    bottom: 25px;
    width: 80%;
    height: 80px;
    border: 1.5px dashed rgba(0, 242, 254, 0.35);
    border-radius: 50%;
    transform: rotateX(75deg); /* Y축 눕힘 처리로 입체감 투영 */
    z-index: 1;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.1),
                inset 0 0 20px rgba(0, 242, 254, 0.05);
    transition: all 0.4s ease;

    &.active {
      border-color: #00f2fe;
      border-style: solid;
      box-shadow: 0 0 35px rgba(0, 242, 254, 0.35),
                  inset 0 0 35px rgba(0, 242, 254, 0.18);
      
      .spin-indicator-text {
        color: #00f2fe;
        text-shadow: 0 0 10px rgba(0, 242, 254, 0.8);
      }
    }

    .spin-indicator-text {
      position: absolute;
      bottom: -32px;
      font-size: 1.2rem;
      font-weight: 900;
      color: rgba(255, 255, 255, 0.35);
      letter-spacing: 0.12em;
      transform: rotateX(-75deg); /* 텍스트는 납작해지지 않고 똑바로 보이도록 보정 */
      transition: all 0.4s ease;
    }

    @media (max-width: 768px) {
      bottom: 15px;
      height: 50px;
      width: 75%;

      .spin-indicator-text {
        bottom: -22px;
        font-size: 1rem;
      }
    }
  `,

  SpriteImage: css`
    width: 320px;
    height: 320px;
    object-fit: contain;
    z-index: 2;
    pointer-events: none;
    transition: opacity 0.18s ease;

    @media (max-width: 768px) {
      width: 220px; /* 모바일에서 320px -> 220px로 축소하여 가로 짤림 원천 방지 */
      height: 220px;
    }
  `,

  Indicator: css`
    position: absolute;
    bottom: 120px;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.6rem 1.6rem;
    background: rgba(6, 9, 14, 0.85);
    border: 1px solid rgba(0, 242, 254, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 30px;
    color: #ffffff;
    font-size: 1.1rem;
    font-weight: 800;
    pointer-events: none;
    z-index: 10;
    letter-spacing: 0.08em;
    box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
    opacity: 0.85;
    
    .material-icons {
      font-size: 1.5rem;
      color: #00f2fe;
      animation: spinIndicator 3s infinite linear;
    }

    @keyframes spinIndicator {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      bottom: 80px; /* 뷰포트 축소 대응 포지셔닝 */
      padding: 0.4rem 1.2rem;
      font-size: 1rem;

      .material-icons {
        font-size: 1.3rem;
      }
    }
  `,

  DotsContainer: css`
    display: flex;
    gap: 0.8rem;
    margin-top: 1.6rem;

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      transition: all 0.3s ease;

      &.active {
        background: #00f2fe;
        box-shadow: 0 0 8px rgba(0, 242, 254, 0.8);
        transform: scale(1.3);
      }
    }
  `
};
</script>

<template>
  <div :class="cx('interactive-360-viewer', Styles.Container)">
    <!-- 뷰어 헤더 -->
    <div :class="cx(Styles.Header)">
      <h3 class="viewer-title">ACS 프로 <span>360° EXPLORER</span></h3>
      <p class="viewer-subtitle">신발을 휙 던지듯 드래그해보세요! 네이버 차량 360도 뷰어처럼 관성을 받아 부드럽게 회전합니다.</p>
    </div>

    <!-- click+drag 뷰포트 영역 (A11y 확보) -->
    <div
      ref="viewerRef"
      :class="cx(Styles.Viewport)"
      role="img"
      aria-label="클릭 후 드래그하여 신발을 360도 회전하며 디테일을 입체적으로 탐색할 수 있는 인터랙티브 뷰어"
      @mousedown="handleDragStart"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 바닥에 입체 투영되는 3D 회전 가이드 오빗 링 -->
      <div :class="[cx(Styles.OrbitRing), { active: isDragging }]">
        <span class="spin-indicator-text">360° INTERACTIVE</span>
      </div>

      <!-- 개별 salomon 이미지 프레임 -->
      <img :src="currentImage" :class="cx(Styles.SpriteImage)" alt="Salomon 360 view" />

      <!-- 인터랙션 유도 배너: 드래그 중이 아닐 때 항상 표시 -->
      <div v-if="!isDragging" :class="cx(Styles.Indicator)">
        <span class="material-icons">sync</span>
        <span>CLICK &amp; DRAG</span>
      </div>
    </div>

    <!-- 인덱스 인디케이터 (현재 프레임 도식화) -->
    <div :class="cx(Styles.DotsContainer)">
      <div
        v-for="n in TOTAL_FRAMES"
        :key="n"
        :class="['dot', { active: currentFrame === n - 1 }]"
      ></div>
    </div>
  </div>
</template>
