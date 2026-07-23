<script setup lang="ts">
import { computed, onMounted, ref, provide } from "vue";
import { cx } from "@emotion/css";
import { UserLayoutStyle } from "~/layouts/style/UserLayoutStyle";
import { useUserStore } from "~/stores/useUserStore";

const userStore = useUserStore();
const userRole = computed(() => userStore.userRole);
const loggedInUserName = computed(() => userStore.loggedInUser?.name || '방문자');

const toggleRole = () => {
  userStore.userRole = userStore.userRole === "member" ? "admin" : "member";
};

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const windowWidth = ref(0);

const isMobile = computed(() => {
  return windowWidth.value <= 640;
});

provide("windowWidth", windowWidth);
provide("isMobile", isMobile);

/************************************************************
 * Function
 ************************************************************/
const setWindowWidth = (data: UIEvent) => {
  const target = data.target as Window;
  windowWidth.value = target.innerWidth;
};

/************************************************************
 * Mounted
 ************************************************************/
onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener("resize", setWindowWidth);
});
</script>

<template>
  <v-app :full-height="false">
    <div :class="cx('user-layout-wrapper', UserLayoutStyle.Default)">
      <div :class="cx('user-layout-container', UserLayoutStyle.Container)">
        <!-- Top Header -->
        <header :class="cx('user-layout-header', UserLayoutStyle.Header)">
          <div class="header-logo">
            인천노조 시스템 
            <span v-if="userRole === 'admin'" class="logo-badge" style="background: rgba(225, 60, 60, 0.2); color: var(--system-red-color); border: 1px solid rgba(225, 60, 60, 0.3);">관리자용</span>
            <span v-else class="logo-badge">조합원용</span>
          </div>
          <div class="header-user">
            <span><strong>{{ loggedInUserName }}</strong> 님</span>
          </div>
        </header>

        <!-- Main Body -->
        <main :class="cx('user-layout-main', UserLayoutStyle.Main)">
          <slot />
        </main>

        <!-- Bottom Navigation Bar -->
        <nav :class="cx('user-layout-nav', UserLayoutStyle.BottomNav)">
          <nuxt-link to="/user/attendance" class="nav-item">
            <i class="material-icons">event_available</i>
            <span>출퇴근</span>
          </nuxt-link>
          <nuxt-link to="/user/dues" class="nav-item">
            <i class="material-icons">payments</i>
            <span>회비관리</span>
          </nuxt-link>
          <!-- 나중에 사용할 예정이므로 임시 비활성화(주석 처리)
          <nuxt-link to="/user/deployment" class="nav-item">
            <i class="material-icons">assignment</i>
            <span>배치현황</span>
          </nuxt-link>
          -->
          <nuxt-link to="/user/members" class="nav-item">
            <i class="material-icons">groups</i>
            <span>회원관리</span>
          </nuxt-link>
          <!-- 나중에 사용할 예정이므로 임시 비활성화(주석 처리)
          <nuxt-link to="/user/work" class="nav-item">
            <i class="material-icons">dashboard</i>
            <span>현장정보</span>
          </nuxt-link>
          -->
          <nuxt-link to="/user/mypage" class="nav-item">
            <i class="material-icons">person</i>
            <span>마이페이지</span>
          </nuxt-link>
        </nav>
      </div>
    </div>
  </v-app>
</template>

<style lang="scss" scoped></style>
