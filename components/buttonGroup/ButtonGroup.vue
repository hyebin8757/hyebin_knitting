<script setup lang="ts">
import { cx } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { BaseButtonGroupStyle } from "~/components/buttonGroup/style/BaseButtonGroupStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * Utility ( 유틸리티 )
 ************************************************************/

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  buttonList? : any,
}>(), {
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
  ]
});

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Composable
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/

</script>

<template>
  <div :class="cx('button-group', BaseButtonGroupStyle.Default )">
    <div
      v-for="( item, index ) in props.buttonList"
      :key="index"
      :class="cx('button-item', item.className )"
    >
      <span class="material-icons" v-text="item.iconName"></span>
      <label v-text="item.value"></label>
    </div>
  </div>
</template>

<style lang="scss"></style>
