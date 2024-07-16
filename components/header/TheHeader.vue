<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import { HeaderStyle } from "~/components/header/style/HeaderStyle";

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const headerData = reactive({
  buttonList : [
    {
      value : "닫기",
      iconName : "close",
      className : "close",
    },
    {
      value : "최소화",
      iconName : "remove",
      className : "remove",
    },
    {
      value : "확대",
      iconName : "zoom_out_map",
      className : "zoom",
    },
  ],

  searchInput : "",
})

const headerBooleanData = reactive({
  searchInputLoading : false
})

/************************************************************
 * Function
 ************************************************************/
const onSearch = () => {
  console.log("search")
}

/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <div :class="cx('header', HeaderStyle.Default )">
    <div :class="cx('left', HeaderStyle.Left )">
      <div :class="cx('button-group', HeaderStyle.ButtonGroup )">
        <div
            v-for="( item, index ) in headerData.buttonList"
            :key="index"
            :class="cx('button-item', item.className )"
        >
          <span class="material-icons" v-text="item.iconName"></span>
          <label v-text="item.value"></label>
        </div>
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
      <v-text-field
          v-model="headerData.searchInput"
          :class="cx( HeaderStyle.SearchInput )"
          :loading="headerBooleanData.searchInputLoading"
          append-inner-icon="mdi-magnify"
          density="compact"
          variant="solo"
          hide-details
          single-line
          clearable
          @click:append-inner="onSearch"
      ></v-text-field>
    </div>
  </div>
</template>

<style lang="scss"></style>