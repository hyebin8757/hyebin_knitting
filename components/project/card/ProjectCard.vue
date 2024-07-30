<script setup lang="ts">
import {reactive} from "vue";
import {cx} from "@emotion/css";
import {useUtil} from "~/utils/useUtil";
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import {ProjectStyle} from "~/components/project/style/ProjectStyle";
import type {ProjectList} from "~/types/site/components/project";

const {useImage} = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<ProjectList>(), {
  title: "",
  content: "",
  path: "",
  imgSrc: "",
  localImg : false,
});

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const projectCardData = reactive( {} );

/************************************************************
 * Function
 ************************************************************/
const movePage = ( path: string ) => {
  // window.open( path );
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted(() => {
  console.log("props.localImg", props.localImg)
})


</script>
<template>
  <div
      :class="cx( ProjectStyle.Card )"
  >
    <div :class="cx( ProjectStyle.CardImg )">
      <img v-if="props.localImg" :src="useImage(props.imgSrc)" alt="cardImg">
      <img v-else :src="props.imgSrc" alt="cardImg">
    </div>
    <div :class="cx( ProjectStyle.CardContent )">
      <h3 :class="cx( ProjectStyle.CardTitle )" v-text="props.title"></h3>
      <p :class="cx( ProjectStyle.CardText )" v-text="props.content"></p>
    </div>
    <div :class="cx( ProjectStyle.CardBtnGroup )">
      <BaseBtn
          @on-click=""
      >
        <span>사용 기술</span>
      </BaseBtn>
      <BaseBtn
          @on-click="movePage( props.path )"
      >
        <span>이동</span>
      </BaseBtn>
    </div>
  </div>
</template>

<style lang="scss"></style>

