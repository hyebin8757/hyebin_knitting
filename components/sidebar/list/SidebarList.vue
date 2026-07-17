<script setup lang="ts">
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/

/************************************************************
 * Utils, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

import { useUserStore } from "~/stores/useUserStore";

import { useMenuStore } from "~/stores/useMenuStore";

/************************************************************
 * Types, Interface
 ************************************************************/
import { SidebarMenu } from "~/types/site/components/sidebar";

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const route = useRoute();
const router = useRouter();

const { isEmpty } = useUtil.typeValidation;

const { isLogin } = useUserStore();

const { removeMenuGarbageList } = useMenuStore();

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  menuList : SidebarMenu[],
  isBookmark? : boolean,
}>(), {
  menuList : [
    {
      title :  "",
      label : "",
      path : "",
      bookmark : false,
    }
  ],
  isBookmark : false,
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * 즐결찾기 이벤트
   */
  ( eventName: "toggleBookmark", item : SidebarMenu ): void,

  /**
   * menu 복원 이벤트
   */
  ( eventName: "onRestore", label : string ): void,
}>();

// 메뉴별 페이지 이동
const movePage = ( item : SidebarMenu ) => {
  if ( isEmpty( item.path ) ) {
    return;
  }

  removeMenuGarbageList( item );

  emit( "onRestore", item.label );

  router.push( item.path );
}


// 즐겨 찾기 토글
const toggleBookmark = ( event : Event, item : SidebarMenu ) => {
  event.stopPropagation();
  emit( "toggleBookmark", item );
}

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
// select / menu button active 설정
const setActive = ( label : string ) => {
  if ( isEmpty( label ) ) {
    return "";
  }

  return route.path.includes( label ) && 'is-active'
}

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <v-list-item
    v-for="( item, index ) in props.menuList"
    :key="index"
    :title="item.title"
    :class="props.isBookmark || cx( setActive( item.label ))"
    @click="movePage( item )"
  >
    <template #prepend>
<!--      <img v-if=" 'main' === item.label" src="@/assets/images/icon/icon_vue.svg" alt="vue">-->
    </template>

    <template #append v-if="!props.isBookmark && isLogin">
      <span :class="cx('material-icons', 'bookmark', item.bookmark && 'is-active' )" @click="toggleBookmark( $event, item )">star</span>
    </template>
  </v-list-item>
</template>

<style lang="scss"></style>
