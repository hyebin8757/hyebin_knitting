<script setup lang="ts">
import { ref, inject } from "vue";
import { cx, css } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import Tag from "~/components/tag/Tag.vue";

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

const consoleDataListRef = ref( null );

const consoleDataList = ref([
  {
    text : "Welcome!",
  },
  {
    text : "You’re invited to Min U JU portfolio!!",
  },
]);

const lastEnterTime = ref( 0 );

const technologyList = ref( [
  {
    text : `- <b>모노레포</b>를 활용한 프로젝트 관리`,
  },
  {
    text : `- <b>JavaScript</b> 와 <b>TypeScript</b> 을 활용한 동적 UI 개발`,
  },
  {
    text : `- Vue 에서 <b>EmotionCss</b> 와 TypeScript 이용한 <b>StyledComponents</b> 생성`,
  },
  {
    text : `- <b>StoryBook</b> 을 이용한 컴포넌트 생성 및 컴퍼넌트 문서화`,
  },
  {
    text : `- Css 에서 Scss 를 이용한 <b>스타일 마이그레이션</b> 설계 및 Style 아키텍처 생성`,
  },
]);

/************************************************************
 * Provide / inject Data
 ************************************************************/
const isMobile = inject( "isMobile" );

/************************************************************
 * Function
 ************************************************************/
const setConsoleData = () => {

  const enterDelay = 500;
  const now = Date.now();

  if ( isEmpty( consoleInput.value ) || now - lastEnterTime.value < enterDelay ) {
    return consoleInput.value = "";
  };

  lastEnterTime.value = now;

  consoleDataList.value.push( { text : consoleInput.value } );

  consoleInput.value = "";

  lastEnterTime.value = now;

  if ( isEmpty( consoleDataListRef.value ) ) return;

  setTimeout( () => {
    // @ts-ignore
    consoleDataListRef.value.scrollTop = ( consoleDataListRef.value.scrollHeight + 100 );
  }, 200)
  setTimeout( () => { consoleInput.value = "" },50);
}

const removerConsoleData = ( item : any  ) => {

  if ( isEmpty( item ) ) return;

  consoleDataList.value = consoleDataList.value.filter( dataItem => item !== dataItem );
}

const resetConsoleData = () => {
  consoleDataList.value = consoleDataList.value.filter( ( item, index ) => 2 > index );
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
  alias: [ "/about" ],
} );

</script>

<template>
  <div :class="cx( 'about', AboutStyle.Default )">
    <div :class="cx( 'console-box', AboutStyle.ConsoleBox )">
      <em :class="cx( 'console-box-guide', AboutStyle.ConsoleBoxGuide )">* 자유롭게 데이터를 추가 해주세요!</em>

      <BaseBtn
          v-if="3 <= consoleDataList.length"
          :class="cx( 'reset-btn', AboutStyle.ConsoleResetButton, { 'is-mobile-btn' : isMobile } )"
          :hover="false"
          @on-click="resetConsoleData"
      >
        <span>전체 삭제</span>
        <span v-if="isMobile" class="material-icons">highlight_off</span>
      </BaseBtn>

      <div
        ref="consoleDataListRef"
        :class="cx( AboutStyle.ConsoleDataList )"
      >
        <span
            v-for="( item, index ) in consoleDataList"
            :key="index"
        >
          console<em>.log( "<b>{{item.text}}</b>" );</em>

          <BaseBtn
              v-if="2 <= index"
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
          @keydown.enter.prevent="setConsoleData"
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
      <Tag
          tag-name="html"
          padding="1"
      />

      <Tag
          tag-name="head"
          padding="3"
      />

      <Tag
          tag-name="title"
          padding="5"
      />

      <div
          :class="cx(
            css`
                padding-left: 7rem;
            `
          )"
      >
        <p :class="cx( AboutStyle.Introduction )">
          저는 <b>UI 개발</b>에 열정을 가지고 있으며  <b>프론트 개발</b>에도 관심이 많은 <b>퍼블리셔</b>입니다.!
        </p>
      </div>

      <Tag
          tag-name="title"
          padding="5"
          is-end
      />

      <Tag
          tag-name="head"
          padding="3"
          is-end
      />

      <Tag
          tag-name="body"
          padding="3"
      />

      <Tag
          tag-name="header"
          padding="5"
          options="class"
          options-text="자기소개"

      />

      <div
          :class="cx(
            css`
                padding-left: 7rem;
            `
          )"
      >
        <p :class="cx( AboutStyle.Introduction )">
          안녕하세요! <br><br>
          저는 디자인과 사용자 경험을 웹에 자연스럽게 녹여내는 것을 좋아하며 <br>
          <b>모든 팀과 소통하면서</b> 최선의 방법을 찾아 퍼블리싱 하는 <b>퍼블리셔 민우주</b> 입니다!<br> <br>

          작업 시 <b>컴포넌트 기반 개발, 반응형 UI, 접근성</b> 고려를 기본으로, 유지보수와 확장성을 생각한 퍼블리싱을 지향합니다. <br> <br>

          특히 <b>Vue</b> 생태계에 익숙하며, <b>Nuxt</b>를 활용한 <b>SSR 환경</b> 구성이나 <b>SEO 최적화</b>에도 자신이 있습니다.<br> <br>

          작은 디테일까지 놓치지 않는 꼼꼼함과 개발자와 디자이너 사이에서 원활한 커뮤니케이션을 통해 <br>
          프로젝트의 완성도를 높이는 데 기여하는 퍼블리셔가 되기 위해 끊임없이 배우고 성장하고 있습니다!
        </p>
      </div>

      <Tag
          tag-name="header"
          padding="5"
          is-end
      />

      <Tag
          tag-name="main"
          padding="5"
          options="class"
          options-text="기술 / 경험"
      />

      <div
          :class="cx(
            AboutStyle.Introduction,
            AboutStyle.ExperienceBox,
            css`
                padding-left: 7rem;
            `
          )"
      >
        <div>
          <b>기술</b>

          <ul>
            <li
              v-for="( item, index ) in technologyList"
              :key="index"
              v-html="item.text"
            />
          </ul>
        </div>

        <div>
          <b>경험</b>

          <p :class="cx( AboutStyle.Introduction )">
            다수의 공공기관 및 기업에서 요구하는 니즈에 맞춰 웹/앱 서비스의 <br>
            퍼블리싱, 유지보수, 리뉴얼을 진행하며 다양한 문제를 경험했고, <br>
            이를 해결해 나가며 지속적으로 배우고 성장하고 있습니다.
          </p>
        </div>
      </div>

      <Tag
          tag-name="main"
          padding="5"
          is-end
      />

      <Tag
          tag-name="footer"
          padding="5"
          options="class"
          options-text="경력 / 교육"
      />

      <div
          :class="cx(
            AboutStyle.Introduction,
            AboutStyle.ExperienceBox,
            css`
                padding-left: 7rem;
            `
          )"
      >
        <div>
          <b>경력</b>

          <p :class="cx( AboutStyle.Introduction )">
            (주)리마커블 소프트
            - 웹퍼블리셔 ( 2021.08 ~ 현재 )
          </p>
        </div>

        <div>
          <b>교육</b>

          <p :class="cx( AboutStyle.Introduction )">
            이젠아케데미(서울)
            - 웹디자인/웹퍼블리셔 과정 수료 ( 2021.03 ~ 2021.08 )
          </p>
        </div>
      </div>

      <Tag
          tag-name="footer"
          padding="5"
          is-end
      />

      <Tag
          tag-name="body"
          padding="3"
          is-end
      />

      <Tag
          tag-name="html"
          padding="1"
          is-end
      />
    </div>
  </div>
</template>

<style lang="scss"></style>
