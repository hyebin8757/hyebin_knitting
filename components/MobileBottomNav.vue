<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";

const route = useRoute();
const store = useKnittingStore();

const isCurrent = (path: string) => route.path === path;
const isAdminPage = computed(() => route.path === "/admin");
const isLoginPage = computed(() => route.path === "/admin/login");
</script>

<template>
  <!-- 관리자 로그인 페이지에서는 하단 탭바 숨김 -->
  <nav v-if="!isLoginPage" class="mobile-bottom-nav" :class="{ 'admin-dock': isAdminPage }">
    <!-- ==============================================
         1. 관리자 전용 하단 탭 바 (/admin) - 5등분 완벽 대칭
         ============================================== -->
    <template v-if="isAdminPage">
      <!-- 1) 주문 관리 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.adminActiveTab === 'orders' }"
        @click="store.switchAdminTab('orders')"
      >
        <div class="icon-wrap">
          <i class="material-icons">receipt_long</i>
          <span v-if="store.orders.length > 0" class="nav-unread-badge">
            {{ store.orders.length }}
          </span>
        </div>
        <span>주문관리</span>
      </button>

      <!-- 2) 환불 관리 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.adminActiveTab === 'refunds' }"
        @click="store.switchAdminTab('refunds')"
      >
        <div class="icon-wrap">
          <i class="material-icons">published_with_changes</i>
          <span v-if="store.pendingRefundsCount > 0" class="nav-unread-badge bg-badge-red">
            {{ store.pendingRefundsCount }}
          </span>
        </div>
        <span>환불관리</span>
      </button>

      <!-- 3) 고객 문의 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.adminActiveTab === 'inquiries' }"
        @click="store.switchAdminTab('inquiries')"
      >
        <div class="icon-wrap">
          <i class="material-icons">chat</i>
          <span v-if="store.unreadInquiriesCount > 0" class="nav-unread-badge bg-badge-green">
            {{ store.unreadInquiriesCount }}
          </span>
        </div>
        <span>고객문의</span>
      </button>

      <!-- 4) 포토 후기 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.adminActiveTab === 'reviews' }"
        @click="store.switchAdminTab('reviews')"
      >
        <div class="icon-wrap">
          <i class="material-icons">stars</i>
          <span v-if="store.reviews.length > 0" class="nav-unread-badge bg-badge-amber">
            {{ store.reviews.length }}
          </span>
        </div>
        <span>후기관리</span>
      </button>

      <!-- 5) 알림 & 상점 설정 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.adminActiveTab === 'settings' }"
        @click="store.switchAdminTab('settings')"
      >
        <div class="icon-wrap">
          <i class="material-icons">phonelink_ring</i>
        </div>
        <span>알림설정</span>
      </button>
    </template>

    <!-- ==============================================
         2. 구매자 하단 네비게이션 - 4등분 완벽 대칭 & 균형 정렬
         ============================================== -->
    <template v-else>
      <!-- 1. 홈 -->
      <nuxt-link to="/" class="nav-item" :class="{ active: isCurrent('/') }">
        <i class="material-icons">home</i>
        <span>홈</span>
      </nuxt-link>

      <!-- 2. 주문서 작성 (완벽 대칭 일반 탭 디자인) -->
      <nuxt-link to="/order" class="nav-item" :class="{ active: isCurrent('/order') }">
        <i class="material-icons">edit_document</i>
        <span>주문서 작성</span>
      </nuxt-link>

      <!-- 3. 주문조회 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.isOrderLookupModalOpen }"
        @click="store.isOrderLookupModalOpen = true"
      >
        <i class="material-icons">search</i>
        <span>주문조회</span>
      </button>

      <!-- 4. 의견 / 문의 -->
      <button
        type="button"
        class="nav-item btn-plain"
        :class="{ active: store.isFeedbackModalOpen }"
        @click="store.isFeedbackModalOpen = true"
      >
        <i class="material-icons">chat</i>
        <span>의견/문의</span>
      </button>
    </template>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 540px;
  margin: 0 auto;
  height: 62px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1.5px solid #ebdcd0;
  border-left: 1px solid #efe5db;
  border-right: 1px solid #efe5db;
  z-index: 45;
  padding: 4px 6px max(6px, env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4등분 균등 대칭 */
  align-items: center;
  box-shadow: 0 -4px 20px rgba(43, 31, 29, 0.05);
}

.mobile-bottom-nav.admin-dock {
  grid-template-columns: repeat(5, 1fr); /* 관리자는 5등분 균등 대칭 */
  background: rgba(255, 255, 255, 0.98);
  border-top: 2px solid #ff758f;
}

.nav-item {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #8c7e7b;
  text-decoration: none;
  font-size: 0.74rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 4px 0;
  border-radius: 12px;
  position: relative;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-item .material-icons {
  font-size: 22px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-item:hover,
.nav-item.active {
  color: #ff4d6d;
}

.nav-item.active {
  font-weight: 800;
}

.nav-item.active .material-icons {
  color: #ff4d6d;
  transform: scale(1.1);
}

/* 활성 탭 상단 인디케이터 라인 */
.nav-item.active::after {
  content: "";
  position: absolute;
  top: 0;
  width: 22px;
  height: 3px;
  background: linear-gradient(90deg, #ff758f, #ff4d6d);
  border-radius: 2px;
}

.btn-plain {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

/* 알림 아이콘 래퍼 & 뱃지 */
.icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-unread-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ff3366;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #ffffff;
  box-shadow: 0 1px 4px rgba(255, 51, 102, 0.4);
}

.bg-badge-red {
  background: #ef4444 !important;
}

.bg-badge-green {
  background: #10b981 !important;
}

.bg-badge-amber {
  background: #f59e0b !important;
}
</style>
