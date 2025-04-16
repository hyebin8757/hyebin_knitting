<script setup lang="ts">
import { ref } from "vue";
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

      <div
        ref="consoleDataListRef"
        :class="cx( AboutStyle.ConsoleDataList )"
      >
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
          저는 <b>UI 개발</b>에 열정을 가지고 있으며 <b>프론트엔드</b>의 꿈을 가진 <b>퍼블리셔</b>입니다.!
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
          모든 팀과 소통하면서 최선의 방법을 찾아 퍼블리싱 하는 퍼블리셔 민우주 입니다!<br> <br>

          작업 시 컴포넌트 기반 개발, 반응형 UI, 접근성 고려를 기본으로, 유지보수와 확장성을 생각한 퍼블리싱을 지향합니다. <br> <br>

          특히 Vue 생태계에 익숙하며, Nuxt를 활용한 SSR 환경 구성이나 SEO 최적화에도 자신이 있습니다.<br> <br>

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
            css`
                padding-left: 0;
            `
          )"
      >
        <p></p>
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
            css`
                padding-left: 0;
            `
          )"
      >
        <p></p>
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
