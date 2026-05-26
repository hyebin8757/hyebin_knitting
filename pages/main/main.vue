<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, inject, computed } from "vue";
import { cx } from "@emotion/css";
import { useRoute, useRouter } from "vue-router";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import MainNoticeDialog from "~/components/dialog/main/MainNoticeDialog.vue";

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
const isNoticePopupOpen = ref( false );
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

const codeBoxPending = ref( false );

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
    cursor?.remove();
    cursor = null;
    return;
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

    // 깜빡이는 타이핑 커서 생성 및 배치
    if ( !cursor ) {
      cursor = document.createElement('span');
      cursor.className = 'cursor';
    }
    currentTarget.appendChild( cursor );
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
  cursor = null;
  if (codeRef.value) {
    codeRef.value.scrollTop = codeRef.value.scrollHeight + 100;
  }
}

// changeCodeGuide removed for optimized instant loading UX

const changeCatGuide = ( type? : string, value? : boolean ) => {

  if ( !value ) {
    return catGuide.value = "구경 할래 냥?";
  }

  if ( "project" === type ) {
    catGuide.value = "오! 좋아 프로젝트 구경 시켜줄께~";
  } else if ( "store" === type ) {
    catGuide.value = "와! 프리미엄 오마주 스토어 구경가자 냥!";
  } else {
    catGuide.value = "연락? 무조건 환영이야~";
  }
}

const goToShoppingMall = () => {
  router.push( "/shopping" );
}

/************************************************************
 * Canvas Starry Sky Animation
 ************************************************************/
interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleDir: number;
  r: number;
  g: number;
  b: number;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  speed: number;
  alpha: number;
  life: number;
  maxLife: number;
}

const canvasRef = ref<HTMLCanvasElement | null>( null );
let starsList: Star[] = [];
let shootingStarsList: ShootingStar[] = [];
let animationFrameId: number | null = null;
let bgGradient: CanvasGradient | null = null;
let resizeTimeoutId: any = null;
const isDark = ref( false );
let darkObserver: MutationObserver | null = null;

let logicalWidth = 0;
let logicalHeight = 0;
const isCanvasVisible = ref( true );
let observer: IntersectionObserver | null = null;

const hexToRgb = ( hex : string ) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
  return result ? {
    r: parseInt( result[1], 16 ),
    g: parseInt( result[2], 16 ),
    b: parseInt( result[3], 16 )
  } : { r: 255, g: 255, b: 255 };
}

const checkDarkMode = () => {
  const isDarkMode = !document.documentElement.hasAttribute( "dark-mode" );
  if ( isDark.value !== isDarkMode ) {
    isDark.value = isDarkMode;
    bgGradient = null; // 그라데이션 캐시 초기화
    if ( canvasRef.value ) {
      initStars( logicalWidth, logicalHeight );
    }
  }
}

const initStars = ( width : number, height : number ) => {
  const count = Math.floor( ( width * height ) / 9000 ); // 별 밀도 최적화
  const generatedStars: Star[] = [];
  const isDarkMode = !document.documentElement.hasAttribute( "dark-mode" );
  const colors = isDarkMode 
    ? [ "#ffffff", "#fff7eb", "#e3f2fd", "#fffde7" ]
    : [ "#1e40af", "#0284c7", "#4f46e5", "#7c3aed", "#d97706", "#0d9488" ]; // 라이트 모드용 고대비 프리미엄 별 색상 조합 (시인성 및 웹 접근성 극대화)

  for ( let i = 0; i < count; i++ ) {
    const rgb = hexToRgb( colors[ Math.floor( Math.random() * colors.length ) ] );
    generatedStars.push( {
      x: Math.random() * width,
      y: Math.random() * height,
      size: isDarkMode ? (Math.random() * 1.4 + 0.6) : (Math.random() * 1.8 + 0.8), // 라이트 모드에서 더 잘 보이도록 크기 소폭 조절
      alpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: 0.003 + Math.random() * 0.012,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b
    } );
  }
  starsList = generatedStars;
};

const drawStarrySky = () => {
  if ( !isCanvasVisible.value ) {
    animationFrameId = null;
    return;
  }

  const canvas = canvasRef.value;
  if ( !canvas ) return;

  const ctx = canvas.getContext( "2d", { alpha: false } ); // 알파 채널 제외로 블렌딩 최적화
  if ( !ctx ) return;

  const isDarkMode = !document.documentElement.hasAttribute( "dark-mode" );

  // 캐싱된 그라데이션 적용 (매 프레임 생성 방지)
  if ( !bgGradient ) {
    bgGradient = ctx.createLinearGradient( 0, 0, 0, logicalHeight );
    if ( isDarkMode ) {
      bgGradient.addColorStop( 0, "#010c17" );
      bgGradient.addColorStop( 0.5, "#00070e" );
      bgGradient.addColorStop( 1, "#000205" );
    } else {
      bgGradient.addColorStop( 0, "#dbeafe" );  // 라이트 모드용 감성적인 하늘빛 블루 그라데이션
      bgGradient.addColorStop( 0.6, "#f1f5f9" ); // 부드러운 화이트 그레이
      bgGradient.addColorStop( 1, "#ffffff" );   // 최하단 퓨어 화이트
    }
  }
  ctx.fillStyle = bgGradient;
  ctx.fillRect( 0, 0, logicalWidth, logicalHeight );

  // 별 드로잉 최적화: arc 대신 fillRect 적용으로 드로우콜 속도 대폭 개선
  // rgba() 활용으로 ctx.globalAlpha 호출 제거
  starsList.forEach( ( star ) => {
    star.alpha += star.twinkleSpeed * star.twinkleDir;
    if ( star.alpha >= 1 ) {
      star.alpha = 1;
      star.twinkleDir = -1;
    } else if ( star.alpha <= 0.15 ) {
      star.alpha = 0.15;
      star.twinkleDir = 1;
    }

    ctx.fillStyle = `rgba(${star.r}, ${star.g}, ${star.b}, ${star.alpha})`;
    ctx.fillRect( star.x - star.size / 2, star.y - star.size / 2, star.size, star.size );
  } );

  // 유성 생성 주기 최적화 (논리 해상도 기준)
  if ( Math.random() < 0.0012 && shootingStarsList.length < 2 ) {
    shootingStarsList.push( {
      x: Math.random() * logicalWidth * 0.8 + logicalWidth * 0.2,
      y: Math.random() * logicalHeight * 0.3 - 50,
      dx: -4 - Math.random() * 4,
      dy: 3 + Math.random() * 3,
      length: 60 + Math.random() * 80,
      speed: 1.5 + Math.random() * 1.5,
      alpha: 1,
      life: 0,
      maxLife: 40 + Math.random() * 30,
    } );
  }

  for ( let i = shootingStarsList.length - 1; i >= 0; i-- ) {
    const ss = shootingStarsList[ i ];
    ss.x += ss.dx * ss.speed;
    ss.y += ss.dy * ss.speed;
    ss.life++;
    ss.alpha = Math.max( 0, 1 - ss.life / ss.maxLife );

    if ( ss.life >= ss.maxLife || ss.x < -100 || ss.y > logicalHeight + 100 ) {
      shootingStarsList.splice( i, 1 );
      continue;
    }

    const grad = ctx.createLinearGradient(
      ss.x, ss.y,
      ss.x - ss.dx * ( ss.length / 10 ),
      ss.y - ss.dy * ( ss.length / 10)
    );
    if ( isDarkMode ) {
      grad.addColorStop( 0, `rgba(255, 255, 255, ${ss.alpha})` );
      grad.addColorStop( 1, "rgba(255, 255, 255, 0)" );
    } else {
      // 라이트 모드용 고대비 및 프리미엄 유성 연출 (더 깊고 선명한 인디고/보랏빛 꼬리)
      grad.addColorStop( 0, `rgba(79, 70, 229, ${ss.alpha})` );
      grad.addColorStop( 1, "rgba(99, 102, 241, 0)" );
    }

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo( ss.x, ss.y );
    ctx.lineTo(
      ss.x - ss.dx * ( ss.length / 10 ),
      ss.y - ss.dy * ( ss.length / 10 )
    );
    ctx.stroke();
  }

  animationFrameId = requestAnimationFrame( drawStarrySky );
};

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if ( !canvas ) return;

  const rect = canvas.parentElement?.getBoundingClientRect();
  if ( rect ) {
    const dpr = window.devicePixelRatio || 1;
    logicalWidth = rect.width;
    logicalHeight = rect.height;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext( "2d" );
    if ( ctx ) {
      ctx.scale( dpr, dpr );
    }

    bgGradient = null; // 리사이즈 시 그라데이션 재생성을 위해 초기화
    initStars( logicalWidth, logicalHeight );
  }
};

const handleResizeDebounced = () => {
  if ( resizeTimeoutId ) {
    clearTimeout( resizeTimeoutId );
  }
  resizeTimeoutId = setTimeout( () => {
    resizeCanvas();
  }, 150 );
};

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
  setTimeout( () => {
    isTyping.value = true;
    typeLine();
  }, 500 );

  // 오늘 하루 보지 않기 타임스탬프 체크
  const expiry = localStorage.getItem("main_notice_expiry");
  const now = new Date().getTime();
  if (!expiry || now > parseInt(expiry, 10)) {
    isNoticePopupOpen.value = true;
  }

  // 다크모드 리액티브 감지 설정
  isDark.value = !document.documentElement.hasAttribute( "dark-mode" );
  darkObserver = new MutationObserver( () => {
    checkDarkMode();
  } );
  darkObserver.observe( document.documentElement, {
    attributes: true,
    attributeFilter: [ "dark-mode" ]
  } );

  if ( canvasRef.value ) {
    resizeCanvas();
    
    // IntersectionObserver 초기화 및 감지 시작
    observer = new IntersectionObserver( ( entries ) => {
      entries.forEach( ( entry ) => {
        isCanvasVisible.value = entry.isIntersecting;
        if ( entry.isIntersecting ) {
          if ( !animationFrameId ) {
            drawStarrySky();
          }
        } else {
          if ( animationFrameId ) {
            cancelAnimationFrame( animationFrameId );
            animationFrameId = null;
          }
        }
      } );
    }, { threshold: 0 } );

    observer.observe( canvasRef.value );
    window.addEventListener( "resize", handleResizeDebounced );
  }
} );

onBeforeUnmount( () => {
  if ( animationFrameId ) {
    cancelAnimationFrame( animationFrameId );
  }
  if ( resizeTimeoutId ) {
    clearTimeout( resizeTimeoutId );
  }
  if ( darkObserver ) {
    darkObserver.disconnect();
  }
  if ( observer ) {
    observer.disconnect();
  }
  window.removeEventListener( "resize", handleResizeDebounced );
} );


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
    <canvas ref="canvasRef" class="star-canvas"></canvas>
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
            @on-click="onHeartEvent"
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
          @on-click="onHeartEvent"
        >
          <img src="@/assets/images/icon/icon_heart.png" alt="">
        </BaseBtn>
      </div>
    </div>

    <div :class="cx( 'main-button-group', MainStyle.ButtonGroup )">
      <BaseBtn
        :hover="false"
        variant="text"
        @on-click="() => router.push( '/project' )"
        @mouseenter="changeCatGuide( 'project', true )"
        @mouseleave="changeCatGuide( false )"
      >
        <img src="@/assets/images/icon/icon_project.png" alt="">
        <span>프로젝트 보러가기</span>
      </BaseBtn>

      <BaseBtn
        :hover="false"
        variant="text"
        @on-click="goToShoppingMall"
        @mouseenter="changeCatGuide( 'store', true )"
        @mouseleave="changeCatGuide( false )"
      >
        <img src="@/assets/images/icon/icon_store.png" alt="">
        <span>오마주 스토어 입장</span>
      </BaseBtn>

      <BaseBtn
        :hover="false"
        variant="text"
        @on-click="() => router.push( '/contact' )"
        @mouseenter="changeCatGuide( 'contact', true )"
        @mouseleave="changeCatGuide( false )"
      >
        <img src="@/assets/images/icon/icon_contact.png" alt="">
        <span>연락하기</span>
      </BaseBtn>
    </div>

    <!-- 신규 쇼핑몰 런칭 공지 팝업 -->
    <MainNoticeDialog
      v-model="isNoticePopupOpen"
      @on-check="goToShoppingMall"
    />
  </div>
</template>

<style lang="scss"></style>
