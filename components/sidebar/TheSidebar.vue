<script setup lang="ts">
import { inject, onMounted, reactive, ref } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";

/************************************************************
 * Components
 ************************************************************/
import SidebarList from "~/components/sidebar/list/SidebarList.vue";

/************************************************************
 * Style
 ************************************************************/
import { SidebarStyle } from "~/components/sidebar/style/SidebarStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

import { useUserStore } from "~/stores/useUserStore";
import { useSidebarStore } from "~/stores/useSidebarStore";

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

const {
  setSidebarMenuListWidth,
  setBookmarkList,
  getBookmarkList,
  isBookmarkList,
  removeBookmarkList
} = useSidebarStore();

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * menu 복원 이벤트
   */
  ( eventName: "onRestore", label : string ): void,
}>();

// 삭제 된 메뉴 복원
const onRestore = ( label : string ) => {

  mobileSidebar.value && ( mobileSidebar.value = false );

  emit( "onRestore", label );
}

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const sidebarData = reactive({
  menuButtonList : [
    {
      label : "main",
      tooltip : "메인",
      iconName : "home",
      path : "/main",
    },
    {
      label : "project",
      tooltip : "프로젝트",
      iconName : "code",
      path : "/project",
    },
    {
      label : "about",
      tooltip : "자기소개서",
      iconName : "create",
      path : "/about",
    },
    {
      label : "contact",
      tooltip : "연락처",
      iconName : "mail_outline",
      path : "/contact",
    },
  ],

  menuListValue : ["portfolio"],
  menuList : [
    {
      title : "home.vue",
      label : "main",
      path : "/main",
      bookmark : false,
    },
    {
      title : "about.html",
      label : "about",
      path : "/about",
      bookmark : false,
    },
    {
      title : "contact.css",
      label : "contact",
      path : "/contact",
      bookmark : false,
    },
    {
      title : "project.js",
      label : "project",
      path : "/project",
      bookmark : false,
    },
  ],
})

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const sidebarBooleanData = reactive({
  isResize : false,
})

const menuListRef = ref( null );
const menuListWidth = ref( 0 );
const bookmarkList = ref<SidebarMenu[]| undefined | []>( [] );

const isHovered = ref( false );
const buttonY = ref( 0 );

const updateButtonY = ( e : MouseEvent ) => {
  const resizeBar = ( menuListRef.value as HTMLElement | null )?.querySelector( '.resize-bar' );
  if ( resizeBar ) {
    const rect = resizeBar.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    buttonY.value = Math.max( 20, Math.min( relativeY, rect.height - 20 ) );
  }
};

const onMouseMove = ( e : MouseEvent ) => {
  updateButtonY( e );
};

const onMouseLeave = () => {
  if ( !sidebarBooleanData.isResize ) {
    isHovered.value = false;
  }
};

/************************************************************
 * Provide / inject Data
 ************************************************************/
const mobileSidebar = inject( "mobileSidebar" );

/************************************************************
 * Function
 ************************************************************/
// sidebar menu width 설정
const onResizeScreen = ( e : MouseEvent ) => {
  sidebarBooleanData.isResize = true;
  updateButtonY( e );

  const handleMouseMove = ( event : MouseEvent ) => {
    if ( !sidebarBooleanData.isResize || isEmpty( menuListRef.value ) ) {
      return;
    }
    menuListRef.value.style.width = ( event.clientX - 50 ) + "px";
    updateButtonY( event );
  };

  const handleMouseUp = () => {
    sidebarBooleanData.isResize = false;
    isHovered.value = false;
    window.removeEventListener( "mousemove", handleMouseMove );
    window.removeEventListener( "mouseup", handleMouseUp );
  };

  window.addEventListener( "mousemove", handleMouseMove );
  window.addEventListener( "mouseup", handleMouseUp );
}

// select / menu button active 설정
const setActive = ( label : string ) => {
  if ( isEmpty( label ) ) {
    return "";
  }

  return route.path.includes( label ) && 'is-active'
}

// 메뉴별 페이지 이동
const movePage = ( path : string ) => {
  if ( isEmpty( path ) ) {
    return;
  }

  router.push( path );
}

// 즐겨 찾기 토글
const toggleBookmark = ( item : SidebarMenu ) => {
  item.bookmark = !item.bookmark;

  if ( !item.bookmark ) {
    bookmarkList.value =  removeBookmarkList( item );
    return;
  }

  bookmarkList.value = setBookmarkList( item );
}

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {
  menuListWidth.value = menuListRef.value ? menuListRef.value.offsetWidth : 0;

  setSidebarMenuListWidth( menuListWidth.value );

  if ( isBookmarkList ) {
    bookmarkList.value = getBookmarkList;

    sidebarData.menuList.forEach((item: SidebarMenu) => {
      const matchingSubItem = bookmarkList.value?.find(subItem => item.label === subItem.label);

      if ( matchingSubItem ) {
        item.bookmark = matchingSubItem.bookmark;
      }
    });
  }
});

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <div :class="cx('sidebar', SidebarStyle.Default, { 'is-show-mobile' : mobileSidebar } )">
    <div :class="cx( 'menu-button-list', SidebarStyle.MenuButtonList )">
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

    <div ref="menuListRef" :class="cx( 'menu-list', SidebarStyle.MenuList )">
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

          <SidebarList
            :menu-list="sidebarData.menuList"
            @toggle-bookmark="toggleBookmark"
            @on-restore="onRestore"
          />
        </v-list-group>

        <v-list-item :class="cx( 'bookmark-list', SidebarStyle.BookmarkList )">
          <div :class="cx( SidebarStyle.BookmarkTitle )">
            <span>즐겨찾기</span>
            <v-tooltip
              v-if="!isLogin"
              content-class=""
              location="top"
            >
              <template v-slot:activator="{ props }">
                <span v-bind="props" class="material-icons">error_outline</span>
              </template>
              <div>
                <span>* 로그인 시 사용 가능합니다.</span>
              </div>
            </v-tooltip>
          </div>

          <SidebarList
            v-if="isLogin"
            :is-bookmark="true"
            :menu-list="bookmarkList"
            @on-restore="onRestore"
          />
        </v-list-item>
      </v-list>

      <div
        :class="cx('resize-bar', sidebarBooleanData.isResize && 'is-active' )"
        @mousedown="onResizeScreen"
        @mouseenter="isHovered = true"
        @mouseleave="onMouseLeave"
        @mousemove="onMouseMove"
      >
        <transition name="fade">
          <button
            v-if="isHovered || sidebarBooleanData.isResize"
            class="resize-button"
            :style="{ top: `${buttonY}px` }"
            @mousedown.stop="onResizeScreen"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="m8 18-6-6 6-6M16 6l6 6-6 6"/>
            </svg>
          </button>
        </transition>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
