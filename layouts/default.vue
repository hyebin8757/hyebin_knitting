<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";
import KnittingHeader from "~/components/KnittingHeader.vue";
import KnittingFooter from "~/components/KnittingFooter.vue";
import MobileBottomNav from "~/components/MobileBottomNav.vue";
import FeedbackModal from "~/components/FeedbackModal.vue";
import OrderLookupModal from "~/components/OrderLookupModal.vue";
import ReviewWriteModal from "~/components/ReviewWriteModal.vue";
import NotificationModal from "~/components/NotificationModal.vue";
import CustomAlertModal from "~/components/CustomAlertModal.vue";
import UserNoticeModal from "~/components/UserNoticeModal.vue";

const route = useRoute();
const store = useKnittingStore();

const isAdminRoute = computed(() => {
  return (
    route.path.startsWith("/admin") ||
    route.path.startsWith("/manage") ||
    route.path.startsWith("/owner")
  );
});

onMounted(() => {
  store.loadFromLocalStorage();
});
</script>

<template>
  <div class="mobile-outer-container">
    <div class="site-wrapper" :class="{ 'admin-mode': isAdminRoute }">
      <KnittingHeader />

      <main class="site-main">
        <slot />
      </main>

      <!-- 구매자 전용 푸터 (관리자 페이지에서는 숨김 처리) -->
      <KnittingFooter v-if="!isAdminRoute" />

      <MobileBottomNav />

      <!-- 전역 모달들 (알림 모달은 오직 관리자 페이지에서만 마운트) -->
      <NotificationModal v-if="isAdminRoute" />
      <UserNoticeModal v-if="!isAdminRoute" />
      <FeedbackModal />
      <OrderLookupModal />
      <ReviewWriteModal />
      <CustomAlertModal />
    </div>
  </div>
</template>

<style scoped>
.mobile-outer-container {
  min-height: 100vh;
  background-color: #f5ede4;
  display: flex;
  justify-content: center;
}

.site-wrapper {
  width: 100%;
  max-width: 540px; /* 모바일 중심 앱 규격 (모바일 화면에선 100%, PC에선 세련된 모바일 뷰) */
  min-height: 100vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background-color: #faf7f2;
  font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
  color: #2b1f1d;
  box-shadow: 0 0 35px rgba(60, 40, 30, 0.08);
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
}

.site-main {
  width: 100%;
  flex: 1 0 auto;
  min-height: 0;
  height: auto;
  padding-bottom: 0;
}
</style>
