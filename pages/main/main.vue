<script setup lang="ts">
import { onMounted, ref } from "vue";
import { cx } from "@emotion/css";
import { useRoute } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { MainStyle } from "~/assets/style/pages/MainStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";
import BaseBtn from "~/components/base/btn/BaseBtn.vue";

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const route = useRoute();

const { isEmpty } = useUtil.typeValidation;
const { useImage } = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const buttonList = ref([
  {
    value : "닫기",
    iconName : "close",
    className : "close",
  },
  {
    value : "확대",
    iconName : "zoom_out_map",
    className : "zoom",
  },
]);

const isHeartEvent = ref( false );

const codeBoxPending = ref( true );

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const setCodeBox = () => {

  onHeartEvent();

  codeBoxPending.value = false;
}

const onHeartEvent = () => {

  if ( isHeartEvent.value ) return;

  isHeartEvent.value = true;

  setTimeout( () => isHeartEvent.value = false, 1000 )
}

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {

});


/************************************************************
 * Layout
 ************************************************************/
definePageMeta( {
  layout: "layout",
} );

</script>

<template>
  <div ref="mainRef" :class="cx( MainStyle.Default )">
    <div :class="cx( MainStyle.Title )">
      민우주의 퍼블리싱 우주에 오신 걸 환영합니다!
      <img src="@/assets/images/img/cat_logo.svg" alt="">
    </div>

    <div :class="cx( MainStyle.Content )">
      <div :class="cx( MainStyle.CodeBox )">
        <div :class="cx( MainStyle.CodeBoxHeader )">
          <div>
            <ButtonGroup :button-list="buttonList" />

            <div>
              <span>template</span>
            </div>
          </div>

          <div>
            <span>LIVE</span>
          </div>
        </div>

        <div :class="cx( MainStyle.CodeBoxContent )">
          <div
            v-if="codeBoxPending"
            :class="cx( MainStyle.CodeBoxPending )"
          >
            <img src="@/assets/images/img/img_loading.svg" alt="">

            <span>데이터 생성중...</span>
          </div>

        </div>
      </div>
      
      <div :class="cx( MainStyle.CatBox )">
        <div :class="cx( MainStyle.CatBoxGuide )">
          <b>구경 할래 냥?</b>
        </div>

        <div :class="cx( MainStyle.CatBoxImg )">
          <img src="@/assets/images/img/img_nameplate.png" alt="">
          <img src="@/assets/images/img/img_cat_main.png" alt="">
        </div>

        <BaseBtn
          :class="cx( { 'is-active' : isHeartEvent } )"
          :hover="false"
          variant="text"
          @on-click="setCodeBox"
        >
          <img src="@/assets/images/icon/icon_heart.png" alt="">
        </BaseBtn>
      </div>
    </div>

    <div :class="cx( MainStyle.ButtonGroup )">
      <BaseBtn
        :hover="false"
        variant="text"
        @on-click=""
      >
        <img src="@/assets/images/icon/icon_project.png" alt="">
        <span>프로젝트 보러가기</span>
      </BaseBtn>

      <BaseBtn
        :hover="false"
        variant="text"
        @on-click=""
      >
        <img src="@/assets/images/icon/icon_contact.png" alt="">
        <span>나에게 연락하기</span>
      </BaseBtn>
    </div>
  </div>
</template>

<style lang="scss"></style>
