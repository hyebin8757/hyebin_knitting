<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";

const route = useRoute();
const router = useRouter();
const store = useKnittingStore();

const isOpen = ref(false);
const dontShowToday = ref(false);

// 대상 상품 정보
const targetProduct = computed(() => {
  if (store.popupNotice.type !== "product" || !store.popupNotice.targetProductId) return null;
  return store.products.find((p) => p.id === store.popupNotice.targetProductId) || null;
});

// 표시할 대표 이미지 (직접 설정한 URL 우선, 없으면 대상 상품 이미지)
const displayImage = computed(() => {
  if (store.popupNotice.imageUrl) return store.popupNotice.imageUrl;
  if (targetProduct.value) {
    return targetProduct.value.image || (targetProduct.value.images && targetProduct.value.images[0]) || "";
  }
  return "";
});

// 버튼 텍스트 앞의 중복 이모지를 안전하게 제거하여 아이콘이 1개만 깔끔하게 노출되도록 정리
const cleanPrimaryBtnText = computed(() => {
  const raw =
    store.popupNotice.actionButtonText ||
    (targetProduct.value ? `${targetProduct.value.name} 주문서 작성하기` : "주문서 바로가기");
  // 텍스트 맨 앞의 이모지/특수문자 기호 제거 (아이콘 중복 방지)
  return raw.replace(/^[\s\p{Extended_Pictographic}\u200d\ufe0f🍎🧶📢🌟🛒🛍️👉✨]+/u, "").trim() || raw;
});

const cleanBadgeText = computed(() => {
  const raw =
    store.popupNotice.badgeText ||
    (store.popupNotice.type === "product" ? "신상품 안내" : "공지사항");
  return raw.replace(/^[\s\p{Extended_Pictographic}\u200d\ufe0f🍎🧶📢🌟🛒🛍️👉✨]+/u, "").trim() || raw;
});

// 팝업 표시 기간 검사
const isWithinPeriod = () => {
  if (store.popupNotice.isAlways) return true;
  const now = Date.now();

  if (store.popupNotice.startDate) {
    const start = new Date(store.popupNotice.startDate).getTime();
    if (!isNaN(start) && now < start) return false;
  }

  if (store.popupNotice.endDate) {
    const end = new Date(store.popupNotice.endDate).getTime();
    if (!isNaN(end) && now > end) return false;
  }

  return true;
};

// 팝업 오픈 조건 판별
const checkAndOpenPopup = () => {
  // 관리자 및 관리자 관련 라우트에서는 절대 노출하지 않음
  if (route.path.startsWith("/admin") || route.path.startsWith("/manage") || route.path.startsWith("/owner")) {
    return;
  }

  // 관리자 설정에서 비활성화된 경우
  if (!store.popupNotice.isActive) {
    return;
  }

  // 기간 설정 체크
  if (!isWithinPeriod()) {
    return;
  }

  // "오늘 하루 안보기" 체크 여부 확인
  if (typeof window !== "undefined") {
    const hideUntil = localStorage.getItem("knitting_hide_popup_until");
    if (hideUntil && Date.now() < Number(hideUntil)) {
      return;
    }
  }

  // 약간의 딜레이 후 부드럽게 팝업 오픈
  setTimeout(() => {
    isOpen.value = true;
  }, 350);
};

// 관리자 미리보기 또는 수동 트리거 감지
watch(
  () => store.isUserNoticeModalOpen,
  (val) => {
    if (val) {
      isOpen.value = true;
    }
  }
);

onMounted(() => {
  checkAndOpenPopup();
});

// 팝업 닫기 처리
const closeModal = () => {
  if (dontShowToday.value && typeof window !== "undefined") {
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    localStorage.setItem("knitting_hide_popup_until", String(endOfDay));
  }
  isOpen.value = false;
  store.isUserNoticeModalOpen = false;
};

// 새 상품 바로가기 (주문서로 이동 및 해당 상품 자동 선택)
const handleGoToOrder = () => {
  const pId = store.popupNotice.targetProductId;
  closeModal();
  if (pId) {
    router.push({ path: "/order", query: { select: pId } });
  } else {
    router.push("/order");
  }
};

// 메인 홈 해당 상품 위치로 스크롤 이동 & 반짝임 하이라이트
const handleScrollToProduct = () => {
  const pId = store.popupNotice.targetProductId;
  closeModal();
  if (!pId) return;

  if (route.path === "/") {
    const el = document.getElementById(`product-${pId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("product-card-highlight");
      setTimeout(() => {
        el.classList.remove("product-card-highlight");
      }, 3000);
      return;
    }
  }

  // 메인 홈이 아니면 메인 홈으로 이동 후 스크롤
  router.push({ path: "/", hash: `#product-${pId}` });
};
</script>

<template>
  <transition name="popup-fade">
    <div v-if="isOpen" class="site-popup-backdrop" @click.self="closeModal">
      <div class="site-popup-dialog" role="dialog" aria-modal="true">
        <!-- 상단 헤더 & 닫기 버튼 -->
        <div class="popup-head">
          <span
            class="popup-badge"
            :class="{ 'badge-product': store.popupNotice.type === 'product', 'badge-notice': store.popupNotice.type === 'notice' }"
          >
            <i class="material-icons badge-icon">{{ store.popupNotice.type === 'product' ? 'auto_awesome' : 'campaign' }}</i>
            <span>{{ cleanBadgeText }}</span>
          </span>
          <button type="button" class="btn-top-close" @click="closeModal" aria-label="닫기">
            ✕
          </button>
        </div>

        <!-- 팝업 메인 컨텐츠 영역 -->
        <div class="popup-content">
          <!-- 팝업 이미지 -->
          <div v-if="displayImage" class="popup-image-wrap">
            <img :src="displayImage" :alt="store.popupNotice.title" class="popup-banner-img" />
            <div v-if="store.popupNotice.type === 'product' && targetProduct" class="product-price-pill">
              {{ targetProduct.name }} • {{ targetProduct.price.toLocaleString() }}원
            </div>
          </div>

          <!-- 타이틀 & 본문 내용 -->
          <h3 class="popup-title">{{ store.popupNotice.title }}</h3>
          <p class="popup-body-text">{{ store.popupNotice.content }}</p>

          <!-- 새 상품 안내일 경우: 전용 상품 타겟 액션 바 -->
          <div v-if="store.popupNotice.type === 'product' && targetProduct" class="product-target-actions">
            <!-- 1순위: 주문서 바로가기 (해당 상품 자동 담기) -->
            <button
              type="button"
              class="btn-action-primary"
              @click="handleGoToOrder"
            >
              <i class="material-icons">shopping_bag</i>
              <span>{{ cleanPrimaryBtnText }}</span>
            </button>

            <!-- 2순위: 메인 홈 상품 구경하기 링크 -->
            <button
              v-if="route.path === '/'"
              type="button"
              class="btn-action-secondary"
              @click="handleScrollToProduct"
            >
              <i class="material-icons">photo_library</i>
              <span>메인 홈에서 실물 사진 구경하기</span>
            </button>
          </div>

          <!-- 일반 공지이고 바로가기 버튼이 활성화된 경우 -->
          <div v-else-if="store.popupNotice.showActionButton" class="product-target-actions">
            <button
              type="button"
              class="btn-action-primary"
              @click="handleGoToOrder"
            >
              <i class="material-icons">arrow_forward</i>
              <span>{{ cleanPrimaryBtnText }}</span>
            </button>
          </div>
        </div>

        <!-- 팝업 하단 (오늘 하루 안보기 + 닫기) -->
        <div class="popup-footer">
          <label class="dont-show-label">
            <input
              v-model="dontShowToday"
              type="checkbox"
              class="dont-show-checkbox"
            />
            <span>오늘 하루 동안 보지 않기</span>
          </label>
          <button type="button" class="btn-footer-close" @click="closeModal">
            닫기
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 팝업 페이드 트랜지션 */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
  transform: scale(0.94);
}

/* 팝업 백드롭 */
.site-popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(43, 31, 29, 0.65);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 16px;
  box-sizing: border-box;
}

/* 팝업 다이얼로그 박스 */
.site-popup-dialog {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(43, 31, 29, 0.25);
  border: 2px solid #ffd6de;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  animation: popupPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popupPop {
  0% {
    transform: scale(0.92) translateY(12px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

/* 헤더 */
.popup-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 8px;
}

.popup-badge {
  font-size: 0.76rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-product {
  background: #fff0f3;
  color: #ff4d6d;
  border: 1px solid #ffd6de;
}

.badge-notice {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
}

.btn-top-close {
  background: #f7f3ee;
  border: none;
  color: #8c7e7b;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-top-close:hover {
  background: #ebe5dc;
  color: #2b1f1d;
}

/* 본문 */
.popup-content {
  padding: 6px 18px 16px;
  display: flex;
  flex-direction: column;
}

.popup-image-wrap {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 12px;
  box-shadow: 0 4px 14px rgba(43, 31, 29, 0.08);
  aspect-ratio: 4 / 3;
  background: #faf6f0;
}

.popup-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.product-price-pill {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(43, 31, 29, 0.78);
  backdrop-filter: blur(4px);
  color: #ffffff;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}

.popup-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: #2b1f1d;
  margin: 0 0 8px;
  line-height: 1.35;
  word-break: keep-all;
}

.popup-body-text {
  font-size: 0.86rem;
  color: #635350;
  line-height: 1.55;
  margin: 0 0 16px;
  white-space: pre-line;
  word-break: keep-all;
}

/* 액션 버튼 그룹 */
.product-target-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-action-primary {
  width: 100%;
  background: linear-gradient(135deg, #ff4d6d, #ff758f);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(255, 77, 109, 0.35);
  transition: all 0.2s ease;
}

.btn-action-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(255, 77, 109, 0.45);
}

.btn-action-secondary {
  width: 100%;
  background: #fdfbf7;
  color: #4a3e3d;
  border: 1.5px solid #ebdcd0;
  border-radius: 14px;
  padding: 9px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-action-secondary:hover {
  border-color: #ff758f;
  background: #ffffff;
  color: #ff4d6d;
}

/* 하단 풋터 바 */
.popup-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: #faf6f0;
  border-top: 1px solid #f0e6dc;
}

.dont-show-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #7a6c69;
  cursor: pointer;
  user-select: none;
}

.dont-show-checkbox {
  accent-color: #ff4d6d;
  width: 15px;
  height: 15px;
  cursor: pointer;
}

.btn-footer-close {
  background: none;
  border: none;
  color: #524442;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
}

.btn-footer-close:hover {
  color: #2b1f1d;
  text-decoration: underline;
}

/* 모바일 320px~350px 대응 */
@media (max-width: 360px) {
  .site-popup-dialog {
    max-width: 95%;
  }

  .popup-head {
    padding: 12px 14px 6px;
  }

  .popup-content {
    padding: 4px 14px 14px;
  }

  .popup-title {
    font-size: 1.05rem;
  }

  .popup-body-text {
    font-size: 0.82rem;
  }

  .btn-action-primary {
    font-size: 0.86rem;
    padding: 10px 12px;
  }

  .popup-footer {
    padding: 8px 14px;
  }

  .dont-show-label {
    font-size: 0.74rem;
  }
}
</style>
