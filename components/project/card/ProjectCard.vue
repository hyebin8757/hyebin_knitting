<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {useUtil} from "~/utils/useUtil";
import {ProjectStyle} from "~/components/project/style/ProjectStyle";
import type {ProjectList} from "~/types/site/components/project";

const { useImage } = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  cardList : ProjectList[],
}>(), {
  cardList : [
    {
      title : "",
      content : "",
      path : "",
      imgSrc : "",
    },
  ] as ProjectList[],
} );

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const projectCardData = reactive({});

/************************************************************
 * Function
 ************************************************************/
const movePage = ( path : string ) => {
  window.open( path );
}

/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <div
      v-for="( item, index ) in props.cardList"
      :key="index"
      :class="cx( ProjectStyle.Card )"
      @click="movePage( item.path )"
  >
    <div :class="cx( ProjectStyle.CardImg )">
      <img :src="useImage(item.imgSrc)" alt="cardImg">
    </div>
    <div :class="cx( ProjectStyle.CardContent )">
      <h3 :class="cx( ProjectStyle.CardTitle )" v-text="item.title"></h3>
      <p :class="cx( ProjectStyle.CardText )" v-text="item.content"></p>
    </div>
  </div>
</template>

<style lang="scss"></style>