<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {SidebarStyle} from "~/components/sidebar/style/SidebarStyle";

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
      label : "home",
      iconName : "home",
      path : "",
    },
    {
      label : "",
      iconName : "code",
      path : "",
    },
    {
      label : "",
      iconName : "create",
      path : "",
    },
    {
      label : "",
      iconName : "mail_outline",
      path : "",
    },
  ],

  menuListValue : ["portfolio"],
  menuList : [
    {
      title : "home.vue",
      path : "",
    },
    {
      title : "about.html",
      path : "",
    },
    {
      title : "project.js",
      path : "",
    },
    {
      title : "contact.css",
      path : "",
    },
  ],
})



const sidebarBooleanData = reactive({

})

/************************************************************
 * Function
 ************************************************************/

/************************************************************
 * Watch & Mounted
 ************************************************************/


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
        :label="item.label"
        variant="text"
      >
        <span class="material-icons-outlined" v-text="item.iconName"></span>
      </v-btn>
    </div>
    <div :class="cx( SidebarStyle.MenuList )">
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
          ></v-list-item>
        </v-list-group>
      </v-list>
    </div>
  </div>
</template>

<style lang="scss"></style>