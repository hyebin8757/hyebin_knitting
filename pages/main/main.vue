<script setup lang="ts">
import { onMounted, ref, inject, computed } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
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
const router = useRouter();

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
const mainContentRef = ref( null );

const codeBoxRef = ref( null );

const catBoxRef = ref( null );


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

const codeRef = ref<HTMLElement | null>( null );

const isTyping = ref( false );
let typeTimeoutId : any = null;

const codeLines = ref( [
  `<html>`,

  `<head><title>민우주 포트폴리오</title></head>`,

  `<body>`,

  `<main>`,

  `<b>안녕하세요. 민우주의 퍼블리싱 우주에 오신 걸 환영합니다!</b>`,

  `<p>이곳은 퍼블리셔의 감각과 UI 개발 기술이 함께 어우러진 공간입니다.\nNuxt 기반 SSR · SPA 프로젝트부터, 인터페이스 설계와 컴포넌트 아키텍처까지\n다양한 경험을 정리하고, 저의 기록을 담았습니다.</p>`,

  `<p>저는 사용자 경험과 디자인 흐름을 이해하는 퍼블리셔 입니다.\n작은 디테일도 놓치지 않으며, 협업과 커뮤니케이션을 중요하게 생각합니다.</p>`,

  `<p>이 포트폴리오를 통해\n제가 어떤 생각으로 일하고, 무엇을 중요하게 여기는지\n천천히 둘러보며 느껴보셨으면 좋겠습니다.</p>`,

  `<p>그럼, 퍼블리싱 우주 탐험을 시작해볼까요?</p>`,

  `</main>`,

  `</body>`,

  `</html>`
]);

let parsedLines : any[] = [];
let lineIndex = 0;
let partIndex = 0;
let charIndex = 0;
let currentTarget : any = null;
let cursor : any = null;

const codeGuide = ref( "데이터 생성중 입니다" );

const catGuide = ref( "구경 할래 냥?" );

/************************************************************
 * Provide / inject Data
 ************************************************************/
const windowWidth = inject( "windowWidth" ) as any;
const isWideScreen = computed(() => windowWidth.value > 1800);

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
    isTyping.value = false;
    return cursor?.remove();
  }

  const { wrapper, parts } = parsedLines[lineIndex];
  const part = parts[partIndex];

  if ( !part ) {
    lineIndex++;
    partIndex = 0;
    charIndex = 0;
    typeTimeoutId = setTimeout(typeLine, 300);
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
      currentTarget = document.createElement('div');
      currentTarget.classList.add('text');
      wrapper.appendChild(currentTarget);
    }
  }

  if ( charIndex < part.text.length ) {
    const char = document.createTextNode(part.text[charIndex]);
    currentTarget.insertBefore(char, cursor);
    charIndex++;
    typeTimeoutId = setTimeout(typeLine, 15);
  }
  else {
    partIndex++;
    charIndex = 0;
    typeTimeoutId = setTimeout(typeLine, 36);
  }


  if ( isEmpty( codeRef.value ) ) return;

  codeRef.value.scrollTop = ( codeRef.value.scrollHeight + 100 );
}

const skipTyping = () => {
  if (!isTyping.value) return;
  isTyping.value = false;
  clearTimeout(typeTimeoutId);

  for (let i = lineIndex; i < parsedLines.length; i++) {
    const { wrapper, parts } = parsedLines[i];
    
    if (!wrapper.parentNode) {
      codeRef.value?.appendChild(wrapper);
    }
    
    if (i === lineIndex) {
      wrapper.innerHTML = '';
    }
    
    if (i >= lineIndex) {
      parts.forEach(part => {
        const el = document.createElement('div');
        if (part.type === 'tag') {
          const tagName = part.text.replace(/[</>]/g, '');
          el.classList.add(`tag-${tagName}`);
        } else {
          el.classList.add('text');
        }
        el.textContent = part.text;
        
        el.style.opacity = '0';
        el.style.animation = `slideUpFadeInCode 0.4s ease-out forwards`;
        el.style.animationDelay = `${(i - lineIndex) * 0.05}s`;
        
        wrapper.appendChild(el);
      });
    }
  }
  cursor?.remove();
  if (codeRef.value) {
    codeRef.value.scrollTop = codeRef.value.scrollHeight + 100;
  }
}

const changeCodeGuide = () => {

  if ( !codeBoxPending.value ) return;

  setTimeout( () => codeGuide.value = "빨리 눌러주세요!!", 500 );

  setTimeout( () => codeGuide.value = "진짜 안눌러요??", 1500 );

  setTimeout( () => codeGuide.value = "알겠어 제가 실행 할께요!!", 3000 );

  setTimeout( () => {
    if ( !codeBoxPending.value ) return;
    setCodeBox();
    isTyping.value = true;
    typeLine();
  }, 4500 );
}

const changeCatGuide = ( type? : string, value? : boolean ) => {

  if ( !value ) {
    return catGuide.value = "구경 할래 냥?";
  }

  catGuide.value = "project" === type ? "오! 좋아 프로젝트 구경 시켜줄께~" : "연락? 무조건 환영이야~";
}

/************************************************************
 * Watch
 ************************************************************/
// watch( () => , () => {
//
// });

/************************************************************
 * Mounted
 ************************************************************/
onMounted( () => {
  setTimeout( () => changeCodeGuide(), 1000 );
});


/************************************************************
 * Layout
 ************************************************************/
definePageMeta( {
  layout: "layout",
  alias: [ "/main" ],
} );

</script>

<template>
  <div ref="mainRef" :class="cx( 'main', MainStyle.Default )">
    <div :class="cx( 'main-title', MainStyle.Title )">
      민우주의 퍼블리싱 우주에 <br> 오신 걸 환영합니다!
      <img src="@/assets/images/img/cat_logo.svg" alt="">
    </div>

    <div
      ref="mainContentRef"
      :class="cx('main-content', MainStyle.Content )"
    >
      <div
        ref="codeBoxRef"
        :class="cx( 'code-box', MainStyle.CodeBox )"
      >
        <div :class="cx( 'code-box-header', MainStyle.CodeBoxHeader )">
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

        <div :class="cx( 'code-box-content', MainStyle.CodeBoxContent )" @click="skipTyping">
          <div
            v-if="codeBoxPending"
            :class="cx( MainStyle.CodeBoxPending )"
          >
            <img src="@/assets/images/img/img_loading.svg" alt="">

            <span>
              <em v-text="codeGuide"/>...( <img src="@/assets/images/icon/icon_heart.png" alt=""> 버튼을 CLICK 해주세요! )
            </span>
          </div>

          <div
            ref="codeRef"
            :class="cx( 'code-box-code', MainStyle.CodeBoxCode )"
          />

          <!-- 스킵 안내 툴팁 -->
          <div v-if="isTyping" class="skip-tooltip" @click.stop="skipTyping">
            화면을 클릭하면 건너뜁니다 ⏭
          </div>
        </div>

        <!-- 데스크탑 미만일 때 코드박스 내부에 고양이 렌더링 -->
        <div
            v-if="!isWideScreen"
            ref="catBoxRef"
            :class="cx( 'cat-box', MainStyle.CatBox )"
        >
          <div :class="cx( 'cat-box-guide', MainStyle.CatBoxGuide )">
            <b v-text="catGuide"/>
          </div>

          <div :class="cx( 'cat-box-img', MainStyle.CatBoxImg )">
            <img src="@/assets/images/img/img_nameplate.png" alt="">
            <img src="@/assets/images/img/img_cat_main.png" alt="">
          </div>

          <BaseBtn
            :class="cx( { 'is-active' : isHeartEvent } )"
            :hover="false"
            variant="text"
            @on-click="() => { if(codeBoxPending){ setCodeBox(); isTyping = true; typeLine(); } }"
          >
            <img src="@/assets/images/icon/icon_heart.png" alt="">
          </BaseBtn>
        </div>
      </div>

      <!-- 1800px 이상 데스크탑일 때 메인 컨텐츠 내부에 고양이 렌더링 -->
      <div
          v-if="isWideScreen"
          ref="catBoxRef"
          :class="cx( 'cat-box', MainStyle.CatBox )"
      >
        <div :class="cx( 'cat-box-guide', MainStyle.CatBoxGuide )">
          <b v-text="catGuide"/>
        </div>

        <div :class="cx( 'cat-box-img', MainStyle.CatBoxImg )">
          <img src="@/assets/images/img/img_nameplate.png" alt="">
          <img src="@/assets/images/img/img_cat_main.png" alt="">
        </div>

        <BaseBtn
          :class="cx( { 'is-active' : isHeartEvent } )"
          :hover="false"
          variant="text"
          @on-click="() => { if(codeBoxPending){ setCodeBox(); isTyping = true; typeLine(); } }"
        >
          <img src="@/assets/images/icon/icon_heart.png" alt="">
        </BaseBtn>
      </div>
    </div>

    <div :class="cx( 'main-button-group', MainStyle.ButtonGroup )">
      <BaseBtn
        :hover="false"
        variant="text"
        @on-click="() => router.push( '/project/project' )"
        @mouseenter="changeCatGuide( 'project', true )"
        @mouseleave="changeCatGuide( false )"
      >
        <img src="@/assets/images/icon/icon_project.png" alt="">
        <span>프로젝트 보러가기</span>
      </BaseBtn>

      <BaseBtn
        :hover="false"
        variant="text"
        @on-click="() => router.push( '/contact/contact' )"
        @mouseenter="changeCatGuide( 'contact', true )"
        @mouseleave="changeCatGuide( false )"
      >
        <img src="@/assets/images/icon/icon_contact.png" alt="">
        <span>연락하기</span>
      </BaseBtn>
    </div>
  </div>
</template>

<style lang="scss"></style>
