<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";

const isAdminRoute = computed(() => {
  return (
    route.path.startsWith("/admin") ||
    route.path.startsWith("/manage") ||
    route.path.startsWith("/owner")
  );
});

const route = useRoute();
const router = useRouter();
const store = useKnittingStore();

const isCurrent = (path: string) => {
  return route.path === path;
};

// 비밀 관리자 진입 트리거: 🧶 로고를 연속 3번 탭하면 관리자 페이지(/manage)로 조용히 이동
const logoClickCount = ref(0);
let logoClickTimer: any = null;

const onLogoClick = (e: MouseEvent) => {
  logoClickCount.value++;
  clearTimeout(logoClickTimer);
  if (logoClickCount.value >= 3) {
    logoClickCount.value = 0;
    e.preventDefault();
    router.push("/manage");
  } else {
    logoClickTimer = setTimeout(() => {
      logoClickCount.value = 0;
    }, 1200);
  }
};
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <!-- 로고 -->
      <nuxt-link to="/" class="brand-logo" @click="onLogoClick">
        <span class="logo-emoji">🧶</span>
        <div class="logo-text-group">
          <span class="logo-title">앉은누이 뜨개옷장</span>
          <span class="logo-subtitle">혜빈이와 먼작콩 공방 ✨</span>
        </div>
      </nuxt-link>

      <!-- 데스크톱 네비게이션 -->
      <nav class="nav-links">
        <nuxt-link to="/" class="nav-link" :class="{ active: isCurrent('/') }">
          <i class="material-icons nav-icon">home</i> 홈
        </nuxt-link>
        <nuxt-link to="/order" class="nav-link highlight" :class="{ active: isCurrent('/order') }">
          <i class="material-icons nav-icon">edit_document</i> 주문서 작성
        </nuxt-link>
        <!-- 포토 후기 (추후 적용 예정으로 숨김 처리)
        <nuxt-link to="/reviews" class="nav-link" :class="{ active: isCurrent('/reviews') }">
          <i class="material-icons nav-icon">rate_review</i> 포토 후기
        </nuxt-link>
        -->
        <button type="button" class="nav-link btn-plain" @click="store.isOrderLookupModalOpen = true">
          <i class="material-icons nav-icon">search</i> 주문 조회
        </button>
      </nav>

      <!-- 우측 빠른 액션 (구매자용 의견 보내기만 노출 / 관리자 페이지는 아래 대시보드 버튼과 중복 방지를 위해 비움) -->
      <div class="header-actions">
        <template v-if="!isAdminRoute">
          <button
            type="button"
            class="btn-feedback"
            @click="store.isFeedbackModalOpen = true"
            title="의견 및 제작 문의 보내기"
          >
            <span class="btn-icon">💌</span>
            <span class="btn-text">의견 보내기</span>
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1.5px solid #f3ebe1;
  box-shadow: 0 2px 12px rgba(90, 60, 50, 0.04);
}

.header-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.brand-logo:hover {
  transform: scale(1.02);
}

.logo-emoji {
  font-size: 1.8rem;
  background: #fff0f3;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(255, 117, 143, 0.15);
}

.logo-text-group {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #2b1f1d;
  letter-spacing: -0.3px;
}

.logo-subtitle {
  font-size: 0.72rem;
  color: #ff758f;
  font-weight: 600;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #5c4e4b;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #faf4ee;
  color: #ff4d6d;
}

.nav-link.active {
  background: #fff0f3;
  color: #ff4d6d;
  font-weight: 700;
}

.nav-link.highlight {
  color: #ff4d6d;
}

.nav-icon {
  font-size: 18px;
}

.btn-plain {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-notif {
  position: relative;
  background: #fdf6ee;
  border: 1px solid #ebd8cb;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-notif:hover {
  background: #f7ebe0;
  transform: translateY(-1px);
}

.btn-notif.has_unread {
  border-color: #ffd0da;
  background: #fff3f5;
}

.notif-bell-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.btn-notif.has_unread .notif-bell-icon {
  animation: bellSway 3s infinite ease-in-out;
}

@keyframes bellSway {
  0%, 100% { transform: rotate(0); }
  5%, 15% { transform: rotate(14deg); }
  10%, 20% { transform: rotate(-14deg); }
  25% { transform: rotate(0); }
}

.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff3366;
  color: #ffffff;
  font-size: 0.68rem;
  font-weight: 800;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 5px rgba(255, 51, 102, 0.4);
}

.btn-store-shortcut {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fdfaf6;
  border: 1px solid #ebdcd0;
  color: #5c4e4b;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-store-shortcut:hover {
  background: #f7f0e6;
  color: #ff4d6d;
}

.btn-feedback {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff0f3;
  border: 1px solid #ffd6de;
  color: #c9184a;
  padding: 7px 12px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-feedback:hover {
  background: #ffe3e8;
  transform: translateY(-1px);
}

.btn-admin {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f7f3ee;
  border: 1px solid #e8ded4;
  color: #6b5c58;
  padding: 7px 12px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-admin:hover {
  background: #ebe1d5;
  color: #2b1f1d;
}

.btn-admin.logged {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.btn-admin .material-icons {
  font-size: 18px;
}

@media (max-width: 768px) {
  .nav-links {
    display: none;
  }
  .btn-feedback .btn-text,
  .btn-admin .btn-text {
    display: none;
  }
  .btn-feedback,
  .btn-admin {
    padding: 7px 10px;
  }
}
</style>
