<script setup lang="ts">
import { ref } from "vue";
import { cx, css } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { AboutStyle } from "assets/style/pages/AboutStyle";

/************************************************************
 * Util, Constants...
 ************************************************************/
import { useUtil } from "~/utils/useUtil";

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/
const route = useRoute();
const router = useRouter();

const { isEmpty } = useUtil.typeValidation;

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
const consoleInput = ref( "" );

const consoleDataList = ref([
  {
    text : "Welcome!",
  },
]);

const lastEnterTime = ref( 0 );

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const setConsoleData = () => {

  const enterDelay = 500;
  const now = Date.now();

  if ( isEmpty( consoleInput.value ) || now - lastEnterTime.value < enterDelay ) return;

  lastEnterTime.value = now;

  consoleDataList.value.push( { text : consoleInput.value } );

  setTimeout( () => { consoleInput.value = "" },50);
}

const removerConsoleData = ( item : any  ) => {

  if ( isEmpty( item ) ) return;

  consoleDataList.value = consoleDataList.value.filter( dataItem => item !== dataItem );
}

const resetConsoleData = () => {
  consoleDataList.value = consoleDataList.value.filter( ( item, index ) => 0 === index );
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
definePageMeta( {
  layout: "layout",
} );

</script>

<template>
  <div :class="cx( AboutStyle.Default )">
    <h2 :class="cx( AboutStyle.Title )">
      환영합니다. 민우주의 <br>
      포트폴리오에 초대합니다!
    </h2>

    <p :class="cx( AboutStyle.Introduction )">인녕하세요. 저는 <b>UI 개발</b>에 열정을 가지고 있으며 <b>프론트엔드</b>의 꿈을 가진 <b>퍼블리셔</b>입니다.</p>

    <div :class="cx( AboutStyle.ConsoleBox )">
      <em :class="cx( AboutStyle.ConsoleBoxGuide )">* 자유롭게 데이터를 추가 해주세요!</em>

      <BaseBtn
          v-if="2 <= consoleDataList.length"
          :class="cx( AboutStyle.ConsoleResetButton )"
          :hover="false"
          @on-click="resetConsoleData"
      >
        <span>전체 삭제</span>
      </BaseBtn>

      <div :class="cx( AboutStyle.ConsoleDataList )">
        <span
            v-for="( item, index ) in consoleDataList"
            :key="index"
        >
          console<em>.log("<b>{{item.text}}</b>");</em>

          <BaseBtn
              v-if="0 !== index"
              :hover="false"
              @on-click="removerConsoleData( item )"
          >
            <span class="material-icons">highlight_off</span>
          </BaseBtn>
        </span>
      </div>

      <div :class="cx( AboutStyle.ConsoleInputBox )">
        <v-text-field
          v-model="consoleInput"
          variant="solo"
          hide-details="auto"
          clearable
          placeholder="console box 에 추가 할 데이터를 입력해주세요."
          @keydown.enter.stop="setConsoleData"
        />

        <BaseBtn
          :hover="false"
          @on-click="setConsoleData"
        >
          <span class="material-icons">upload</span>
        </BaseBtn>
      </div>
    </div>

    <div :class="cx( AboutStyle.InfoBox )">
      <div>
        <span v-text=""/>

      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
