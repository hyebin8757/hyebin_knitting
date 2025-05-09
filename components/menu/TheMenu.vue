<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { MenuStyle } from "~/components/menu/style/MenuStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

import { useMenuStore } from "~/stores/useMenuStore";

/************************************************************
 * Types, Interface
 ************************************************************/
import { TabMenuList } from "~/types/site/components/tabMenuList";

type MenuActive = "main" | "about" | "contact" | "" ;

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const route = useRoute();
const router = useRouter();

const { isEmpty } = useUtil.typeValidation;

const {
  getAfterMenuList,
  getRestoreMenuList,
  setAfterMenuList,
  setMenuGarbageList,
  setRestoreMenuList,
  isMenuGarbageList,
  isRestoreMenuList,
  menuReset
} = useMenuStore();

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  restoreMenu : string,
}>(), {
  restoreMenu : "",
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  ( eventName: "" ): void,
}>();

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const menuData = reactive<{
  originalMenuList : TabMenuList[],
  isActive : MenuActive,
}>({
  originalMenuList : [
    {
      title : "home.vue",
      path : "/main/main",
      value : "main",
    },
    {
      title : "about.html",
      path : "/about/about",
      value : "about",
    },
    {
      title : "contact.css",
      path : "/contact/contact",
      value : "contact",
    },
    {
      title : "project.js",
      path : "/project/project",
      value : "project",
    },
  ],

  isActive : "",
})

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const menuBooleanData = reactive({
  isProject : false,
})

const menuList = ref( menuData.originalMenuList );

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
// 페이지 이동
const movePage = ( menu : TabMenuList ) => {
  if ( isEmpty( menu ) ) {
    return;
  }

  menuData.isActive = menu.value;

  router.push( menu.path );
}

// menu 활성화 설정
const showMenu = ( path : string ) => {
  if ( isEmpty( path ) ) {
    return;
  }

  menuData.isActive = path.split( "/").at(-1);
}

// 메뉴 설정
const setMenuList = ( menu : TabMenuList | TabMenuList[] ) => {
  if ( Array.isArray( menu ) ) {
    return menuList.value.filter( menuItem => !menu.some( singleMenu => singleMenu.value === menuItem.value ) );
  }
  else {
    return menuList.value.filter( menuItem => menu.value !== menuItem.value );
  }
}

// 메뉴 삭제
const menuClose = ( event : Event, menu : TabMenuList, index : number  ) => {
  event.stopPropagation();

  if ( isEmpty( menu ) ||  1 === menuList.value.length ) {
    return;
  }

  const isLastMenu = ( index + 1 ) === menuList.value.length;

  setMenuGarbageList( menu );

  menuList.value = setMenuList( menu );

  setAfterMenuList( menuList.value );

  if ( menuData.isActive !== menu.value ) {
    return;
  }

  const firstMenu = menuList.value[0];

  isLastMenu ? movePage( firstMenu ) : movePage( menuList.value[index] );
}

// 메뉴 reset
const onMenuReset = () => {
  menuList.value = menuData.originalMenuList;
  menuReset();
}

defineExpose({ onMenuReset });

/************************************************************
 * Watch
 ************************************************************/
watch( () => route.path, ( newPath : string ) => {
  showMenu( newPath );
});

// 변경된 메뉴 리스트 설정
watch( () => props.restoreMenu, ( newValue : string ) => {
  const restoreMenu = menuData.originalMenuList.filter( menu =>  newValue === menu.value )[0];

  if ( menuList.value.some( menu => restoreMenu.value === menu.value ) ) {
    return;
  }

  menuList.value.push( restoreMenu );

  setRestoreMenuList( menuList.value );
});

/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {
  showMenu( route.path );

  if ( isMenuGarbageList ) {
    menuList.value = getAfterMenuList;
  }
  else if ( isRestoreMenuList ) {
    menuList.value = getRestoreMenuList;
  }
});

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <div :class="cx( 'menu',  MenuStyle.Default )">
    <BaseBtn
      v-for="( item, index ) in menuList"
      :key="index"
      :class="menuData.isActive === item.value && 'is-active'"
      :ripple="true"
      @on-click="movePage( item )"
    >
      <img v-if="'main' === item.value" src="@/assets/images/icon/icon_vue.svg" alt="vue">
      <svg v-if="'about' === item.value" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#e44d26" class="Tab_icon__XOYo5"><path d="m12 17.56l4.07-1.13.55-6.1h-7.24l-.18-2.03h7.6l.2-1.99h-10l.56 6.01h6.89l-.23 2.58-2.22.6-2.22-.6-.14-1.66h-2l.29 3.19 4.07 1.13m-7.93-14.56h15.86l-1.43 16.2-6.5 1.8-6.5-1.8-1.43-16.2z"></path></svg>
      <svg v-if="'contact' === item.value" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#42a5f5" class="Tab_icon__XOYo5"><path d="m5 3l-.65 3.34h13.59l-.44 2.16h-13.58l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64h-3.34l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21 1.54-7.76h-16.94z"></path></svg>
      <svg v-if="'project' === item.value" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffca28" class="Tab_icon__XOYo5"><path d="m3 3h18v18h-18v-18m4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.8 2.53-2.55v-5.78h-1.7v5.74c0 .86-.35 1.08-.9 1.08-.58 0-.82-.4-1.09-.87l-1.38.83m5.98-.18c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8z"></path></svg>
      <span v-text="item.title"></span>
      <v-tooltip
        content-class=""
        location="top"
      >
        <template v-slot:activator="{ props }">
          <span v-bind="props" class="material-icons" @click="menuClose( $event, item, index )">close</span>
        </template>
        <div>
          <span>*메뉴 삭제가 {{ 1 < menuList.length ? `가능` : `불가능` }}합니다.</span>
        </div>
      </v-tooltip>
    </BaseBtn>
  </div>
</template>

<style lang="scss"></style>
