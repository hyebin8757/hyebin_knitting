<script setup lang="ts">
import { inject } from "vue";
import { cx, css } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { ProjectCardStyle } from "~/components/project/card/style/ProjectCardStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/
import type { ProjectList } from "~/types/site/components/project";

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const { useImage } = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<ProjectList>(), {
  title: "",
  service: "",
  path: "",
  imgSrc: "",
  date : "",
  tagList : () => [ { name : "" } ],
  workList : "",
  localImg : false,
  isBest : false,
  isSecurity : false,
  isWorkBtn : false,
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  ( eventName: "" ): void,
}>();

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const isHover = inject( "isHover" );

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const onHoverToggle = ( value : boolean ) => {
  isHover.value = value;
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
  <div
      :class="cx( ProjectCardStyle.Default )"
      @mouseenter="onHoverToggle( true )"
      @mouseleave="onHoverToggle( false )"
  >
    <div :class="cx( ProjectCardStyle.ImgBox, props.isBest && 'is-best' )">
      <img :src="useImage( props.imgSrc )" alt="">
    </div>

    <div :class="cx( ProjectCardStyle.Title )">
      <h2 v-html="props.title"/>
    </div>

    <div :class="cx( 'info-box', ProjectCardStyle.InfoBox )">
      <div :class="cx( ProjectCardStyle.Service )">
        <em>서비스</em>
        <b v-html="props.service"/>
      </div>

      <div :class="cx( ProjectCardStyle.LabelBox )">
        <v-chip
          v-for="( item, index ) in props.tagList"
          :key="index"
        >
          <span v-text=" '# ' + item.name "/>
        </v-chip>
      </div>

      <ul :class="cx( ProjectCardStyle.DataBox )">
<!--        <li v-if="props.date">-->
<!--          <div>-->
<!--            <img src="" alt="">-->
<!--            <span>작업 기간</span>-->
<!--          </div>-->

<!--          <span v-text="props.date"/>-->
<!--        </li>-->

        <li
          v-if="props.workList?.length"
          v-for="( item, index ) in props.workList"
          :key="index"
        >
          <span>-</span>
          <span v-text="item.text"/>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss"></style>
