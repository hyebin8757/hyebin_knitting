<script setup lang="ts">
import { reactive } from "vue";
import { cx } from "@emotion/css";
import { useRouter } from "vue-router";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { HeaderStyle } from "~/components/header/style/HeaderStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/
import { useUserStore } from "~/stores/useUserStore";
import ButtonGroup from "~/components/buttonGroup/ButtonGroup.vue";

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const router = useRouter();

const { isLogin, logout } = useUserStore();

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * menu reset 이벤트
   */
  ( eventName: "onMenuReset" ): void,
}>();

// menu reset
const onMenuReset = ( text : string ) => {
  if ( "MenuReset" !== text ) {
    return;
  }

  emit( "onMenuReset" );
}
/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const headerData = reactive({
  menuList : [
    {
      text : "File",
    },
    {
      text : "Edit",
    },
    {
      text : "View",
    },
    {
      text : "Go",
    },
    {
      text : "Run",
    },
    {
      text : "Terminal",
    },
    {
      text : "Help",
    },
    {
      text : "MenuReset",
    },
  ],

  searchInput : "",
})

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const headerBooleanData = reactive({
  searchInputLoading : false,
  isLightMode : true,
})

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
// 검색
const onSearch = () => {
  console.log("search")
}

// 로그인 페이지로 이동
const onLogin = () => {
  router.push("/login/login");
}

// 다크모드 설정
const changeMode = () => {

  headerBooleanData.isLightMode = !headerBooleanData.isLightMode;

  onDarkMode();
}

const onDarkMode = () => {

  const htmlDom = document.documentElement;

  if ( !headerBooleanData.isLightMode ) {
    return htmlDom.removeAttribute( "dark-mode" );
  }

  htmlDom.setAttribute( "dark-mode", "true" )
}

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {
  onDarkMode();
})

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <div :class="cx('header', HeaderStyle.Default )">
    <div :class="cx('left', HeaderStyle.Left )">
      <ButtonGroup/>

      <div :class="cx('menu-list', HeaderStyle.MenuList)">
        <span
          v-for="( item, index ) in headerData.menuList"
          :key="index"
          v-text="item.text"
          @click="onMenuReset( item.text )"
        ></span>
      </div>
    </div>

    <div :class="cx('center', HeaderStyle.Center )">
      <div :class="cx( HeaderStyle.Title )">
        <span>Min U Ju - IntelliJ IDEA</span>
      </div>
      <div :class="cx( HeaderStyle.Profile )">
        <img src="@/assets/images/img/profile.jpg" alt="profile">
        <v-tooltip
          content-class="header-profile"
          activator="parent"
          location="bottom"
        >
          <img src="@/assets/images/img/profile.jpg" alt="profile">
        </v-tooltip>
      </div>
    </div>

    <div :class="cx('right', HeaderStyle.Right )">
      <v-btn
        :class="cx( HeaderStyle.ModeButton )"
        :ripple="false"
        variant="text"
        @click="changeMode"
      >
        <span class="material-icons" v-text="headerBooleanData.isLightMode ? 'dark_mode' : 'light_mode' "></span>
      </v-btn>
      <v-btn
        v-if="!isLogin"
        :class="cx( 'login-btn' )"
        :ripple="false"
        variant="text"
        @click="onLogin"
      >
        <span>로그인</span>
      </v-btn>
      <v-btn
        v-if="isLogin"
        :class="cx( 'logout-btn' )"
        :ripple="false"
        variant="text"
        @click="logout"
      >
        <span>로그아웃</span>
        <span class="material-icons">logout</span>
      </v-btn>
      <!--      <v-text-field-->
      <!--          v-model="headerData.searchInput"-->
      <!--          :class="cx( HeaderStyle.SearchInput )"-->
      <!--          :loading="headerBooleanData.searchInputLoading"-->
      <!--          append-inner-icon="mdi-magnify"-->
      <!--          density="compact"-->
      <!--          variant="solo"-->
      <!--          hide-details-->
      <!--          single-line-->
      <!--          clearable-->
      <!--          @click:append-inner="onSearch"-->
      <!--      ></v-text-field>-->
    </div>
  </div>
</template>

<style lang="scss"></style>
