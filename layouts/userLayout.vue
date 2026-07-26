<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, provide } from "vue";
import { cx } from "@emotion/css";
import { UserLayoutStyle } from "~/layouts/style/UserLayoutStyle";
import { useUserStore } from "~/stores/useUserStore";

const userStore = useUserStore();
const userRole = computed(() => userStore.userRole);
const loggedInUserName = computed(() => userStore.loggedInUser?.name || '방문자');

const isGroup7OrAdmin = computed(() => {
  if (userRole.value === 'admin') return true;
  return userStore.loggedInUser?.group === 7;
});

// 객선 장부 접근 권한: 관리자(admin) 및 간부조 정택광 전용
const isLedgerAuthorized = computed(() => {
  if (userRole.value === 'admin') return true;
  return userStore.loggedInUser?.name === '정택광';
});

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
 * Mounted & Unmounted
 ************************************************************/
onMounted(() => {
  windowWidth.value = window.innerWidth;
  window.addEventListener("resize", setWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", setWindowWidth);
});
</script>

<template>
  <v-app :full-height="false">
    <div :class="cx('user-layout-wrapper', UserLayoutStyle.Default)">
      <div :class="cx('user-layout-container', UserLayoutStyle.Container)">
        <!-- Top Header -->
        <header :class="cx('user-layout-header', UserLayoutStyle.Header)">
          <div class="header-logo">
            인천 항운 노조 시스템
            <span v-if="userRole === 'admin'" class="logo-badge" style="background: rgba(225, 60, 60, 0.2); color: var(--system-red-color); border: 1px solid rgba(225, 60, 60, 0.3);">관리자용</span>
            <span v-else class="logo-badge">조합원용</span>
          </div>
          <div class="header-user">
            <nuxt-link 
              to="/user/mypage" 
              style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #ffffff;
                text-decoration: none;
                background: rgba(255, 255, 255, 0.08);
                padding: 0.4rem 0.9rem;
                border-radius: 0.8rem;
                border: 1px solid rgba(255, 255, 255, 0.12);
                cursor: pointer;
                transition: all 0.2s;
              "
              title="마이페이지 이동"
            >
              <i class="material-icons" style="font-size: 1.6rem; color: #88c5ff;">account_circle</i>
              <span style="font-size: 1.3rem;"><strong>{{ loggedInUserName }}</strong> 님</span>
            </nuxt-link>
          </div>
        </header>

        <!-- Main Body -->
        <main :class="cx('user-layout-main', UserLayoutStyle.Main)">
          <slot />
        </main>

        <!-- Bottom Navigation Bar -->
        <nav 
          :class="cx('user-layout-nav', UserLayoutStyle.BottomNav)"
          :style="{ gridTemplateColumns: `repeat(${ (isGroup7OrAdmin ? 1 : 0) + (isLedgerAuthorized ? 1 : 0) + 4 }, 1fr)` }"
        >
          <nuxt-link to="/user/attendance" class="nav-item">
            <i class="material-icons">event_available</i>
            <span>출퇴근</span>
          </nuxt-link>
          <nuxt-link to="/user/ships" class="nav-item">
            <i class="material-icons">directions_boat</i>
            <span>운항정보</span>
          </nuxt-link>
          <nuxt-link to="/user/weather" class="nav-item">
            <i class="material-icons">thunderstorm</i>
            <span>날씨</span>
          </nuxt-link>
          <nuxt-link v-if="isGroup7OrAdmin" to="/user/dues" class="nav-item">
            <i class="material-icons">payments</i>
            <span>회비관리</span>
          </nuxt-link>
          <nuxt-link to="/user/members" class="nav-item">
            <i class="material-icons">groups</i>
            <span>회원관리</span>
          </nuxt-link>
          <nuxt-link v-if="isLedgerAuthorized" to="/user/ledger" class="nav-item">
            <i class="material-icons">assignment</i>
            <span>객선장부</span>
          </nuxt-link>
        </nav>
      </div>
    </div>
  </v-app>
</template>

<style lang="scss" scoped></style>
