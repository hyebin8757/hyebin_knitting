<script setup lang="ts">
  import {onMounted, reactive, watch} from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { useUtil } from "~/utils/useUtil";
import { TabMenuList } from "~/types/site/components/tabMenuList";
import { MenuStyle } from "~/components/menu/style/MenuStyle";

const route = useRoute();
const router = useRouter();
const { isEmpty } = useUtil.typeValidation;
const { useImage } = useUtil.AssetResolverUtil;

type MenuActive = "main" | "about" | "contact" | "" ;
/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const menuData = reactive<{
  menuList : TabMenuList[],
  isActive : MenuActive,
}>({
  menuList : [
    {
      title : "home.vue",
      imgSrc : "/assets/images/icon/icon_vue.svg",
      path : "/main/main",
      value : "main",
    },
    {
      title : "about.html",
      imgSrc : "",
      path : "/about/about",
      value : "about",
    },
    {
      title : "contact.css",
      imgSrc : "",
      path : "/contact/contact",
      value : "contact",
    },
    {
      title : "project.js",
      imgSrc : "",
      path : "/project/project",
    },
  ],

  isActive : "",
})

const menuBooleanData = reactive({
  isProject : false,
})

/************************************************************
 * Function
 ************************************************************/
const movePage = ( path : string ) => {
  if ( isEmpty( path ) ) {
    return;
  }

  router.push( path );
}

const setActive = ( value : string ) => {
  if ( isEmpty( value ) ) {
    return;
  }

  return menuData.isActive === value && "is-active";
}

const showMenu = ( path : string ) => {
  if ( isEmpty( path ) ) {
    return;
  }

  menuBooleanData.isProject = path.includes("project");
  menuData.isActive = path.split( "/").at(-1);
}


/************************************************************
 * Watch & Mounted
 ************************************************************/
watch( () => route.path, ( newPath : string ) => {
  showMenu( newPath );
});

onMounted( () => {
  showMenu( route.path );
});


</script>
<template>
  <div v-if="!menuBooleanData.isProject" :class="cx( MenuStyle.Default )">
    <BaseBtn
      v-for="( item, index ) in menuData.menuList"
      :key="index"
      :class="setActive( item.value || '' )"
      :ripple="true"
      @on-click="movePage( item.path )"
    >
      <img :src="useImage( item.imgSrc )" alt="iconMenu">
      <span v-text="item.title"></span>
      <span class="material-icons">close</span>
    </BaseBtn>
  </div>
</template>

<style lang="scss"></style>