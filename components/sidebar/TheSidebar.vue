<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import { cx } from "@emotion/css";
import {useUtil} from "~/utils/useUtil";
import {SidebarStyle} from "~/components/sidebar/style/SidebarStyle";

const { isEmpty } = useUtil.typeValidation;
const route = useRoute();
const router = useRouter();

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const sidebarData = reactive({
  menuButtonList : [
    {
      label : "main",
      tooltip : "메인",
      iconName : "home",
      path : "/main/main",
    },
    {
      label : "project",
      tooltip : "프로젝트",
      iconName : "code",
      path : "/project/project",
    },
    {
      label : "about",
      tooltip : "자기소개서",
      iconName : "create",
      path : "/about/about",
    },
    {
      label : "contact",
      tooltip : "연락처",
      iconName : "mail_outline",
      path : "/contact/contact",
    },
  ],

  menuListValue : ["portfolio"],
  menuList : [
    {
      title : "home.vue",
      label : "main",
      path : "/main/main",
    },
    {
      title : "about.html",
      label : "about",
      path : "/about/about",
    },
    {
      title : "contact.css",
      label : "contact",
      path : "/contact/contact",
    },
    {
      title : "project.js",
      label : "project",
      path : "/project/project",
    },
  ],
})

const sidebarBooleanData = reactive({
  isResize : false,
})

const menuListRef = ref( null );

/************************************************************
 * Function
 ************************************************************/
const onResizeScreen = () => {
  sidebarBooleanData.isResize = true;

  addEventListener("mousemove", ( e : MouseEvent ) => {
    if ( !sidebarBooleanData.isResize || isEmpty( menuListRef.value ) ) {
      return;
    }

    menuListRef.value.style.width = ( e.clientX - 50 ) + "px"
  });

  addEventListener("mouseup", ( e : MouseEvent ) => {
    sidebarBooleanData.isResize = false;
  });
}

const setActive = ( label : string ) => {
  if ( isEmpty( label ) ) {
    return "";
  }

  return route.path.includes( label ) && 'is-active'
}

const movePage = ( path : string ) => {
  if ( isEmpty( path ) ) {
    return;
  }

  router.push( path );
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted( () => {
  console.log("route.path",route.path);
});

/**
 * 버튼 종류 및 메뉴 리스트
 * - 메인 ( home )
 * - 프로젝트 ( projects )
 * - about
 * - contact
 * - blog??


 <div :class="cx()">

 </div>

 */
</script>
<template>
  <div :class="cx('sidebar', SidebarStyle.Default )">
    <div :class="cx( SidebarStyle.MenuButtonList )">
      <v-btn
        v-for="( item, index ) in sidebarData.menuButtonList"
        :key="index"
        :class="cx( setActive( item.label ) )"
        :label="item.label"
        variant="text"
        @click="movePage( item.path )"
      >
        <span class="material-icons-outlined" v-text="item.iconName"></span>
        <v-tooltip
            :content-class="item.label"
            activator="parent"
            location="end"
        >{{item.tooltip}}</v-tooltip>
      </v-btn>
    </div>
    <div ref="menuListRef" :class="cx( SidebarStyle.MenuList )">
      <v-list
          v-model:opened="sidebarData.menuListValue"
      >
        <v-list-group value="portfolio" >
          <template v-slot:activator="{ props }">
            <v-list-item
                v-bind="props"
                title="PORTFOLIO"
                :ripple="false"
            ></v-list-item>
          </template>

          <v-list-item
              v-for="( item, index ) in sidebarData.menuList"
              :key="index"
              :title="item.title"
              :class="cx( setActive( item.label ))"
              @click="movePage( item.path )"
          >
            <template #prepend>
              <img v-if="0 === index" src="@/assets/images/icon/icon_vue.svg" alt="vue">
              <svg v-if="1 === index" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#e44d26" class="Tab_icon__XOYo5"><path d="m12 17.56l4.07-1.13.55-6.1h-7.24l-.18-2.03h7.6l.2-1.99h-10l.56 6.01h6.89l-.23 2.58-2.22.6-2.22-.6-.14-1.66h-2l.29 3.19 4.07 1.13m-7.93-14.56h15.86l-1.43 16.2-6.5 1.8-6.5-1.8-1.43-16.2z"></path></svg>
              <svg v-if="2 === index" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#42a5f5" class="Tab_icon__XOYo5"><path d="m5 3l-.65 3.34h13.59l-.44 2.16h-13.58l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64h-3.34l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21 1.54-7.76h-16.94z"></path></svg>
              <svg v-if="3 === index" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffca28" class="Tab_icon__XOYo5"><path d="m3 3h18v18h-18v-18m4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.8 2.53-2.55v-5.78h-1.7v5.74c0 .86-.35 1.08-.9 1.08-.58 0-.82-.4-1.09-.87l-1.38.83m5.98-.18c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8z"></path></svg>
            </template>
          </v-list-item>
        </v-list-group>
      </v-list>
      <div
         :class="cx('resize-bar', sidebarBooleanData.isResize && 'is-active' )"
         @mousedown="onResizeScreen"
      ></div>
    </div>
  </div>
</template>

<style lang="scss"></style>