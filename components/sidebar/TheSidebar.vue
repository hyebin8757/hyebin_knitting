<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import { cx } from "@emotion/css";
import {useUtil} from "~/utils/useUtil";
import {SidebarStyle} from "~/components/sidebar/style/SidebarStyle";
import {useSidebarStore} from "~/stores/useSidebarStore";
import {SidebarMenu} from "~/types/site/components/sidebar";
import SidebarList from "~/components/sidebar/list/SidebarList.vue";

const { isEmpty } = useUtil.typeValidation;
const route = useRoute();
const router = useRouter();
const { setSidebarMenuListWidth, setBookmarkList, isBookmarkList, getBookmarkList, removeBookmarkList } = useSidebarStore();

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
      bookmark : false,
    },
    {
      title : "about.html",
      label : "about",
      path : "/about/about",
      bookmark : false,
    },
    {
      title : "contact.css",
      label : "contact",
      path : "/contact/contact",
      bookmark : false,
    },
    {
      title : "project.js",
      label : "project",
      path : "/project/project",
      bookmark : false,
    },
  ],
})

const sidebarBooleanData = reactive({
  isResize : false,
})

const menuListRef = ref( null );
const menuListWidth = ref( 0 );
const bookmarkList = ref<SidebarMenu[]| undefined | []>( [] );

/************************************************************
 * Function
 ************************************************************/
// sidebar menu width 설정
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
 * Watch & Mounted
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

          <SidebarList
              :menu-list="sidebarData.menuList"
              @toggle-bookmark="toggleBookmark"
          />
        </v-list-group>

        <v-list-item :class="cx( SidebarStyle.BookmarkList )">
          <div :class="cx( SidebarStyle.BookmarkTitle )">
            <span>즐겨찾기</span>
          </div>

          <SidebarList
              :is-bookmark="true"
              :menu-list="bookmarkList"
          />
        </v-list-item>
      </v-list>

      <div
         :class="cx('resize-bar', sidebarBooleanData.isResize && 'is-active' )"
         @mousedown="onResizeScreen"
      ></div>
    </div>
  </div>
</template>

<style lang="scss"></style>