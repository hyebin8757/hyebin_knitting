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
          ></v-list-item>
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