<script setup lang="ts">
import {onMounted, reactive, toRef } from "vue";
import {cx} from "@emotion/css";
import {useUtil} from "~/utils/useUtil";
// import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import type {ProjectList} from "~/types/site/components/project";
import { ProjectStyle } from "~/assets/style/pages/ProjectStyle";
import ProjectDialog from "~/components/dialog/project/ProjectDialog.vue";

const {isNotEmpty} = useUtil.typeValidation;
const {useImage} = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<ProjectList>(), {
  title: "",
  content: "",
  path: "",
  imgSrc: "",
  tag : "",
  workList : "",
  localImg : false,
  isSecurity : false,
  isWorkBtn : false,
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * card 이벤트
   */
  ( eventName: "onClick" ): void,
}>();

const onClick = () => {
  emit( "onClick" );
}

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const projectCardData = reactive( {
  title: toRef( props, "title" ).value,
  content: toRef( props, "content" ).value,
  path: toRef( props, "path" ).value,
  imgSrc: toRef( props, "imgSrc" ).value,
  tag: toRef( props, "tag" ).value,
  workList: toRef( props, "workList" ).value,
  localImg: toRef( props, "localImg" ).value,
  isSecurity: toRef( props, "isSecurity" ).value,
  isWorkBtn: toRef( props, "isWorkBtn" ).value,
});

const projectCardBooleanData = reactive( {
  isDialog : false,
  isAlert : false
} );

/************************************************************
 * Function
 ************************************************************/
const movePage = ( path: string, security? : boolean ) => {
  if ( security ) {
    projectCardBooleanData.isAlert = security

    return;
  }

  // window.open( path );
}

const onAlertToggle = ( value : boolean ) => {
  projectCardBooleanData.isAlert = value;
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted(() => {

})


</script>
<template>
  <div
      :class="cx( ProjectStyle.Card, 'project-card' )"
      @click="onClick"
  >
    <div :class="cx( ProjectStyle.CardLine )"></div>
    <div :class="cx( ProjectStyle.CardImg )">
      <img v-if="props.localImg" :src="useImage(props.imgSrc)" alt="cardImg">
      <img v-else :src="props.imgSrc" alt="cardImg">
    </div>
    <div :class="cx( ProjectStyle.CardContainer )">
      <div :class="cx( ProjectStyle.CardContent )">
        <div>
          <h3 :class="cx( ProjectStyle.CardTitle )" v-html="props.title"></h3>
          <p :class="cx( ProjectStyle.CardText )" v-text="props.content"></p>
        </div>
        <div v-if="isNotEmpty( props.tag )" :class="cx( ProjectStyle.CardTag )">
          <p v-text="props.tag"></p>
        </div>
      </div>
      <div :class="cx( ProjectStyle.CardBtnGroup )">
        <BaseBtn
            @on-click="movePage( props.path, props.isSecurity )"
        >
          <span>이동</span>
        </BaseBtn>
      </div>
    </div>
  </div>
  <ProjectDialog
      v-model="projectCardBooleanData.isDialog"
      :work-list="props.workList"
  />
  <BaseAlert
      v-if="props.isSecurity && projectCardBooleanData.isAlert"
      title="안내"
      text="보안상 이유로 이동되지 않습니다."
      :is-footer="false"
      @on-alert="onAlertToggle"
  />
</template>

<style lang="scss"></style>

