<script setup lang="ts">
import { onMounted, ref } from "vue";
import { cx } from "@emotion/css";
import { useRoute } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";

/************************************************************
 * Style
 ************************************************************/
import { MainStyle } from "~/assets/style/pages/MainStyle";

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

const codeRef = ref( null );

const codeLines = ref( [
  ` <template>안녕하세요</template>`,
  `<head> 인사말 </head>`
]);

let parsedLines : any[] = [];
let lineIndex = 0;
let partIndex = 0;
let charIndex = 0;
let currentTarget : any = null;
let cursor : any = null;

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

// 파싱 로직: 태그와 일반 텍스트 분리
const parseLine = ( line : string ) => {

  const regex = /(<\/?[a-zA-Z]+>)|([^<>]+)/g;

  const parts = [];

  let match;

  while ( ( match = regex.exec(line) ) ) {
    if ( match[1] ) {
      parts.push({ type: 'tag', text: match[1] });
    }
    else if ( match[2] ) {
      parts.push({ type: 'text', text: match[2] });
    }
  }

  return parts;
};

// 파싱된 전체 라인 저장
parsedLines = codeLines.value.map(( line, index ) => ({
  parts: parseLine(line),
  wrapper: Object.assign(document.createElement('div'), {
    className: `line-${index}`
  }),
}));

const typeLine = () => {

  if ( lineIndex >= parsedLines.length ) {
    return cursor?.remove();
  }

  const { wrapper, parts } = parsedLines[lineIndex];
  const part = parts[partIndex];

  if ( !part ) {
    lineIndex++;
    partIndex = 0;
    charIndex = 0;
    setTimeout(typeLine, 300);
    return;
  }

  if ( 0 === charIndex && 0 === partIndex ) {
    codeRef.value?.appendChild( wrapper ); // 줄이 시작되자마자 붙여!
  }

  if ( 0 === charIndex ) {
    if ( "tag" === part.type ) {
      currentTarget = document.createElement('div');

      const tagName = part.text.replace(/[</>]/g, '');
      currentTarget.classList.add(`tag-${tagName}`);

      wrapper.appendChild(currentTarget);
    }
    else {
      currentTarget = wrapper;
    }
  }

  if ( charIndex < part.text.length ) {
    const char = document.createTextNode(part.text[charIndex]);
    currentTarget.insertBefore(char, cursor);
    charIndex++;
    setTimeout(typeLine, 25);
  }
  else {
    partIndex++;
    charIndex = 0;
    setTimeout(typeLine, 100);
  }
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
              <span>Portfolio</span>
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

            <span>
              데이터 생성중...( <img src="@/assets/images/icon/icon_heart.png" alt=""> CLICK! )
            </span>
          </div>

          <div
            ref="codeRef"
            :class="cx( MainStyle.CodeBoxCode )"
          />
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
          @on-click="() => { setCodeBox(); typeLine(); }"
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
        <span>연락하기</span>
      </BaseBtn>
    </div>
  </div>
</template>

<style lang="scss"></style>
