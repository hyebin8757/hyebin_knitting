<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide } from "vue";
import { useRoute } from "vue-router";
import CoupleDialogModal from "~/components/CoupleDialogModal.vue";

import { useCoupleStore } from "~/stores/useCoupleStore";

const route = useRoute();
const coupleStore = useCoupleStore();
const windowWidth = ref(0);

const isNavActive = (targetPath: string) => {
  const currentPath = (route.path || '').replace(/\/$/, '') || '/';
  if (targetPath === '/home') {
    return currentPath === '/home' || currentPath === '' || currentPath === '/';
  }
  return currentPath.startsWith(targetPath);
};

let resizeAnimationFrame: number | null = null;
const setWindowWidth = () => {
  if (typeof window !== "undefined") {
    if (resizeAnimationFrame) cancelAnimationFrame(resizeAnimationFrame);
    resizeAnimationFrame = requestAnimationFrame(() => {
      windowWidth.value = window.innerWidth;
    });
  }
};

provide("windowWidth", windowWidth);

onMounted(() => {
  setWindowWidth();
  window.addEventListener("resize", setWindowWidth, { passive: true });
  coupleStore.fetchAllData();
});

onBeforeUnmount(() => {
  if (resizeAnimationFrame) cancelAnimationFrame(resizeAnimationFrame);
  window.removeEventListener("resize", setWindowWidth);
});
</script>

<template>
  <v-app :full-height="false" class="couple-app-root">
    <div class="app-viewport-wrapper">
      <!-- Main Mobile Container (max-w-[480px]) -->
      <div class="mobile-container">
        <!-- Top App Bar Header -->
        <header class="couple-header">
          <div class="header-content">
            <div class="brand-badge">
              <span class="heart-icon">💖</span>
              <span class="brand-title">혜빈이와 먼작콩</span>
            </div>
            <div class="couple-tag">
              <span class="tag-mint">혜빈</span>
              <span class="tag-heart">♥</span>
              <span class="tag-pet">🐾 먼작콩</span>
            </div>
          </div>
        </header>

        <!-- Page Main Slot -->
        <main class="couple-main-body">
          <slot />
        </main>

        <!-- Bottom Navigation Bar (6 Items) -->
        <nav class="couple-bottom-nav">
          <nuxt-link to="/home" class="nav-item nav-home" :class="{ active: isNavActive('/home') }">
            <div class="nav-icon">
              <i class="material-icons">favorite</i>
            </div>
            <span class="nav-label">홈</span>
          </nuxt-link>

          <nuxt-link to="/utility" class="nav-item nav-utility" :class="{ active: isNavActive('/utility') }">
            <div class="nav-icon">
              <i class="material-icons">lightbulb</i>
            </div>
            <span class="nav-label">공과금</span>
          </nuxt-link>

          <nuxt-link to="/living" class="nav-item nav-living" :class="{ active: isNavActive('/living') }">
            <div class="nav-icon">
              <i class="material-icons">account_balance_wallet</i>
            </div>
            <span class="nav-label">생활비</span>
          </nuxt-link>

          <nuxt-link to="/savings" class="nav-item nav-savings" :class="{ active: isNavActive('/savings') }">
            <div class="nav-icon">
              <i class="material-icons">savings</i>
            </div>
            <span class="nav-label">적금/자산</span>
          </nuxt-link>

          <nuxt-link to="/debt" class="nav-item nav-debt" :class="{ active: isNavActive('/debt') }">
            <div class="nav-icon">
              <i class="material-icons">credit_card</i>
            </div>
            <span class="nav-label">대출/빚</span>
          </nuxt-link>

          <nuxt-link to="/schedule" class="nav-item nav-schedule" :class="{ active: isNavActive('/schedule') }">
            <div class="nav-icon">
              <i class="material-icons">event</i>
            </div>
            <span class="nav-label">약속</span>
          </nuxt-link>
        </nav>
        <CoupleDialogModal />
      </div>
    </div>
  </v-app>
</template>

<style scoped>
.couple-app-root {
  background-color: #f7f4f0 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif;
  min-height: 100vh;
  color: #333333;
}

.app-viewport-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: #f7f4f0;
}

.mobile-container {
  width: 100%;
  max-width: 540px;
  margin: 0 auto;
  min-height: 100vh;
  background: #fffdfa;
  box-shadow: 0 0 25px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 80px; /* Space for bottom nav */
  touch-action: manipulation;
  -webkit-overflow-scrolling: touch;
  font-size: 11.5px;
}

/* Header */
.couple-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 253, 250, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(240, 230, 220, 0.8);
  padding: 12px 16px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.heart-icon {
  font-size: 1.2rem;
}

.brand-title {
  font-size: 1.22rem;
  font-weight: 800;
  color: #4a3e3d;
  letter-spacing: -0.3px;
}

.couple-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #fbf2ec;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.92rem;
  font-weight: 700;
}

.tag-pink {
  color: #e57373;
}

.tag-heart {
  color: #ff8a80;
  font-size: 0.88rem;
}

.tag-mint {
  color: #4db6ac;
}

.tag-pet {
  color: #ffb74d;
  margin-left: 2px;
}

:global(body.modal-open) {
  overflow: hidden !important;
  touch-action: none;
}

/* Main Body */
.couple-main-body {
  flex: 1;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* Bottom Navigation */
.couple-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 68px;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid rgba(240, 230, 220, 0.9);
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  z-index: 50;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.06);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #bbb4b0;
  transition: color 0.2s ease, transform 0.15s ease;
  padding: 6px 0 4px 0;
  position: relative;
  gap: 2px;
}

.nav-item:active {
  transform: scale(0.92);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 30px;
  border-radius: 16px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.nav-icon i {
  font-size: 1.6rem;
  transition: font-size 0.2s ease;
}

.nav-label {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  transition: color 0.2s ease;
}

.nav-item.active,
.nav-item.router-link-active,
.nav-item.router-link-exact-active {
  color: #ff7043;
}

.nav-item.active .nav-icon,
.nav-item.router-link-active .nav-icon,
.nav-item.router-link-exact-active .nav-icon {
  background: #ffebe5;
  color: #ff5722;
  transform: scale(1.08);
}

.nav-item.active .nav-icon i,
.nav-item.router-link-active .nav-icon i,
.nav-item.router-link-exact-active .nav-icon i {
  font-size: 1.65rem;
}

/* --- 메뉴 탭별 전용 시그니처 테마 컬러 매칭 --- */
/* 1. 홈 (러블리 핑크) */
.nav-item.nav-home.active,
.nav-item.nav-home.router-link-active { color: #e91e63; }
.nav-item.nav-home.active .nav-icon,
.nav-item.nav-home.router-link-active .nav-icon { background: #ffe4ec; color: #e91e63; box-shadow: 0 2px 8px rgba(233, 30, 99, 0.2); }

/* 2. 공과금 (오렌지) */
.nav-item.nav-utility.active,
.nav-item.nav-utility.router-link-active { color: #f57c00; }
.nav-item.nav-utility.active .nav-icon,
.nav-item.nav-utility.router-link-active .nav-icon { background: #fff3e0; color: #f57c00; box-shadow: 0 2px 8px rgba(245, 124, 0, 0.2); }

/* 3. 생활비 (에메랄드 그린) */
.nav-item.nav-living.active,
.nav-item.nav-living.router-link-active { color: #2e7d32; }
.nav-item.nav-living.active .nav-icon,
.nav-item.nav-living.router-link-active .nav-icon { background: #e8f5e9; color: #2e7d32; box-shadow: 0 2px 8px rgba(46, 125, 50, 0.2); }

/* 4. 적금/자산 (시원한 스카이블루) */
.nav-item.nav-savings.active,
.nav-item.nav-savings.router-link-active { color: #0284c7; }
.nav-item.nav-savings.active .nav-icon,
.nav-item.nav-savings.router-link-active .nav-icon { background: #e0f2fe; color: #0284c7; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.2); }

/* 5. 대출/빚 (강렬한 레드) */
.nav-item.nav-debt.active,
.nav-item.nav-debt.router-link-active { color: #e53935; }
.nav-item.nav-debt.active .nav-icon,
.nav-item.nav-debt.router-link-active .nav-icon { background: #ffebee; color: #e53935; box-shadow: 0 2px 8px rgba(229, 57, 53, 0.2); }

/* 6. 약속 (인디고 퍼플) */
.nav-item.nav-schedule.active,
.nav-item.nav-schedule.router-link-active { color: #3f51b5; }
.nav-item.nav-schedule.active .nav-icon,
.nav-item.nav-schedule.router-link-active .nav-icon { background: #e8eaf6; color: #3f51b5; box-shadow: 0 2px 8px rgba(63, 81, 181, 0.2); }

/* Small screen tweaks (320px) */
@media (max-width: 360px) {
  .couple-main-body {
    padding: 12px;
  }
  .brand-title {
    font-size: 1.05rem;
  }
  .couple-tag {
    padding: 4px 8px;
    font-size: 0.78rem;
  }
  .nav-label {
    font-size: 0.78rem;
  }
}
</style>
