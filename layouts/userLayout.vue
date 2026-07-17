<script setup lang="ts">
import { computed, onMounted, ref, provide } from "vue";
import { cx } from "@emotion/css";
import { UserLayoutStyle } from "~/layouts/style/UserLayoutStyle";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/

/************************************************************
 * Utils, Constants...
 ************************************************************/

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/

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
 * Watch
 ************************************************************/

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
            인천노조 시스템 <span class="logo-badge">조합원용</span>
          </div>
          <div class="header-user">
            <span><strong>홍길동</strong> 님</span>
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
          <nuxt-link to="/user/deployment" class="nav-item">
            <i class="material-icons">assignment</i>
            <span>배치현황</span>
          </nuxt-link>
          <nuxt-link to="/user/members" class="nav-item">
            <i class="material-icons">groups</i>
            <span>회원관리</span>
          </nuxt-link>
          <nuxt-link to="/user/work" class="nav-item">
            <i class="material-icons">dashboard</i>
            <span>현장정보</span>
          </nuxt-link>
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
