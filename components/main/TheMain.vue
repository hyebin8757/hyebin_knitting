<script setup lang="ts">
import {defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";
import { cx } from "@emotion/css";
import { useRoute } from "vue-router";
import {useUtil} from "~/utils/useUtil";
import {MainStyle} from "~/components/main/style/MainStyle";

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
 * Data ( ref, reactive, computed... )
 ************************************************************/
const mainData = reactive({
  catPosition : { top: 0, left: 0 },
  catStateSrc : "/assets/images/img/cat.svg",
});

const mainBooleanData = reactive({
  isMove : false,
  isJumping : false,
  isAnimation : false,
});

const mainRef = ref( null );
const catRef = ref( null );
const constelacaoRef = ref( null );
const meteoroRef = ref( null );
const numeroAleatorio = ref( 5000 );
const estrelas = ref<any[]>([]);
const portfolioMenuItem = defineAsyncComponent(() => import( "@/components/portfolioMenuItem/PortfolioMenuItem.vue" ));

/************************************************************
 * Function
 ************************************************************/
// 초기 고양이 위치 선정
const resetPosition = () => {
    if ( isEmpty( mainRef.value ) || isEmpty( catRef.value ) ) {
      return;
    }

    mainData.catPosition.top = mainRef.value.clientHeight - catRef.value.clientHeight;
    mainData.catPosition.left = mainRef.value.clientWidth / 2 - catRef.value.clientWidth + 50;

    catRef.value.style.top = `${mainData.catPosition.top}px`;
    catRef.value.style.left = `${mainData.catPosition.left}px`;
}

// 고양이 이미지 변경
const changeCat = ( src : string ) => {
  if ( !mainBooleanData.isMove ) {
    mainBooleanData.isMove = true;
  }

  if ( mainBooleanData.isJumping ) {
    return;
  }

  mainData.catStateSrc = src;
}

// 고양이 움직임 설정
const moveCat = async ( event : Event )  => {
  if ( isEmpty( mainRef.value ) || isEmpty( catRef.value ) ) {
    return;
  }

  const moveSpeed = 30;

  // const isCheck =  await checkCollision();

  switch( event?.key ) {
    case 'ArrowUp':
      mainData.catPosition.top = Math.max(mainData.catPosition.top - moveSpeed, 0);
      changeCat("/assets/images/img/cat_move.svg");
      break;
    case 'ArrowDown':
      mainData.catPosition.top = Math.min(mainData.catPosition.top + moveSpeed, mainRef.value.clientHeight - catRef.value.clientHeight );
      changeCat("/assets/images/img/cat_move.svg");
      break;
    case 'ArrowLeft':
      mainData.catPosition.left = Math.max(mainData.catPosition.left - moveSpeed, 0);
      changeCat("/assets/images/img/cat_move.svg");
      catRef.value.classList.add("is-left");
      break;
    case 'ArrowRight':
      mainData.catPosition.left = Math.min(mainData.catPosition.left + moveSpeed, mainRef.value.clientWidth - catRef.value.clientWidth );
      changeCat("/assets/images/img/cat_move.svg");
      catRef.value.classList.remove("is-left");
      break;
    case ' ':
      changeCat("/assets/images/img/cat_jump.svg");
      catRef.value.classList.remove("is-rest");
      jumpCat();
      break;
  }

  checkCollision();

  catRef.value.style.top = `${mainData.catPosition.top}px`;
  catRef.value.style.left = `${mainData.catPosition.left}px`;
}


// 고양이 점프
const jumpCat = () => {
  if ( mainBooleanData.isJumping || isEmpty( catRef.value ) ) {
    return;
  }

  mainBooleanData.isJumping = true;

  const jumpHeight = 50;
  const jumpDuration = 800;
  const originalTop = mainData.catPosition.top;

  let startTime = Date.now();

  const jumpInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const progress = elapsedTime / ( jumpDuration / 2 );

    if ( progress < 1 ) {
      mainData.catPosition.top = originalTop - jumpHeight * progress;
    } else if (progress < 2) {
      mainData.catPosition.top = originalTop - jumpHeight * (2 - progress);
    } else {
      mainData.catPosition.top = originalTop;
      clearInterval(jumpInterval);
      mainBooleanData.isJumping = false;
      setTimeout( () => {
        changeCat("/assets/images/img/cat_rest.svg");
        catRef.value.classList.add("is-rest");
      }, 200)
    }

    catRef.value.style.top = `${mainData.catPosition.top}px`;
  }, 16);
};


const checkCollision = () => {
  // .getBoundingClientRect()
  const aboutEl = document.querySelector( ".menu-item__0" );
  const contactEl = document.querySelector( ".menu-item__1" );
  const projectEl = document.querySelector( ".menu-item__2" );

  const checkElList = [];

  if ( isEmpty( aboutEl ) || isEmpty( contactEl ) || isEmpty( projectEl ) ) {
    return;
  }

  checkElList.push( aboutEl.getBoundingClientRect(), contactEl.getBoundingClientRect(), projectEl.getBoundingClientRect() );

  console.log("checkElList",checkElList);

  checkElList.forEach( ( item, index ) => {
    console.log("================================================")
    console.log( item.top - mainData.catPosition.top )
    console.log("================================================")
    console.log( item.right )
    console.log(  mainData.catPosition.left )
    console.log("================================================")
    // mainData.catPosition.top
    // mainData.catPosition.left
  });

  // console.log("aaa",mainData.catPosition.top
  // ,mainData.catPosition.left);
}

// 메인 배경 화면 속 별
const init = () => {
  let style = ["style1", "style2", "style3", "style4"];
  let tam = ["tam1", "tam1", "tam1", "tam2", "tam3"];
  let opacity = ["opacity1", "opacity1", "opacity1", "opacity2", "opacity2", "opacity3"];

  let qtdeEstrelas = 250;
  let widthWindow = window.innerWidth;
  let heightWindow = window.innerHeight;

  for ( let i = 0; i < qtdeEstrelas; i++ ) {
    let component = null;
    let props = {};

    switch ( i ) {
      case 0 :
        component = portfolioMenuItem;
        props = {
          img : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#e44d26" class="Tab_icon__XOYo5"><path d="m12 17.56l4.07-1.13.55-6.1h-7.24l-.18-2.03h7.6l.2-1.99h-10l.56 6.01h6.89l-.23 2.58-2.22.6-2.22-.6-.14-1.66h-2l.29 3.19 4.07 1.13m-7.93-14.56h15.86l-1.43 16.2-6.5 1.8-6.5-1.8-1.43-16.2z"></path></svg>`,
          index : i,
        };
        break;
      case 1 :
        component = portfolioMenuItem;
        props = {
          img : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#42a5f5" class="Tab_icon__XOYo5"><path d="m5 3l-.65 3.34h13.59l-.44 2.16h-13.58l-.66 3.33h13.59l-.76 3.81-5.48 1.81-4.75-1.81.33-1.64h-3.34l-.79 4 7.85 3 9.05-3 1.2-6.03.24-1.21 1.54-7.76h-16.94z"></path></svg>`,
          index : i,
        };
        break;
      case 2 :
        component = portfolioMenuItem;
        props = {
          img : `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffca28" class="Tab_icon__XOYo5"><path d="m3 3h18v18h-18v-18m4.73 15.04c.4.85 1.19 1.55 2.54 1.55 1.5 0 2.53-.8 2.53-2.55v-5.78h-1.7v5.74c0 .86-.35 1.08-.9 1.08-.58 0-.82-.4-1.09-.87l-1.38.83m5.98-.18c.5.98 1.51 1.73 3.09 1.73 1.6 0 2.8-.83 2.8-2.36 0-1.41-.81-2.04-2.25-2.66l-.42-.18c-.73-.31-1.04-.52-1.04-1.02 0-.41.31-.73.81-.73.48 0 .8.21 1.09.73l1.31-.87c-.55-.96-1.33-1.33-2.4-1.33-1.51 0-2.48.96-2.48 2.23 0 1.38.81 2.03 2.03 2.55l.42.18c.78.34 1.24.55 1.24 1.13 0 .48-.45.83-1.15.83-.83 0-1.31-.43-1.67-1.03l-1.38.8z"></path></svg>`,
          index : i,
        };
        break;
      default :
        component = 'span';
    }

    estrelas.value.push({
      component: component,
      props : props,
      classes: `
        estrela ${style[getRandomArbitrary(0, 4)]} ${opacity[getRandomArbitrary(0, 6)]} ${tam[getRandomArbitrary(0, 5)]}
        ${ i < 3 && `menu-item__${i}` }
      `,
      style: `animation-delay: .${getRandomArbitrary(0, 9)}s; left: ${getRandomArbitrary(0, widthWindow)}px; top: ${getRandomArbitrary(0, heightWindow)}px;`,
    });
  }

  setTimeout(() => {
    carregarMeteoro( numeroAleatorio.value );
  }, numeroAleatorio.value );
};

const getRandomArbitrary = ( min : number, max : number ) => {
  return Math.floor(Math.random() * ( max - min ) ) + min;
}

const carregarMeteoro = ( aleatorio : number ) => {
  if ( isEmpty( meteoroRef.value ) ) {
    return;
  }

  let style = ["style1", "style2", "style3", "style4"];

  setTimeout(carregarMeteoro, aleatorio);

  numeroAleatorio.value = getRandomArbitrary(5000, 10000);

  let meteoro = "<div class='meteoro "+ style[getRandomArbitrary(0, 4)] +"'></div>";

  meteoroRef.value.innerHTML = meteoro;

  setTimeout(() => {
    if ( isEmpty( meteoroRef.value ) ) {
      return;
    }

    meteoroRef.value.innerHTML = "";
  }, 1000);
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted( () => {
  init();

  resetPosition();

  document.addEventListener( "keydown", moveCat );
});

onBeforeUnmount( () => {
  document.removeEventListener('keydown', moveCat );
})

</script>
<template>
  <div ref="mainRef" :class="cx( MainStyle.Default )">
    <div v-if="!mainBooleanData.isMove" :class="cx( MainStyle.Title )">
      <span>Hello 'Min U Ju' World</span>
      <img src="@/assets/images/img/cat_logo.svg" alt="">
    </div>

    <div class="noite"></div>

    <div ref="constelacaoRef" :class="cx('constelacao', mainBooleanData.isAnimation && 'is-animation-none' )">
      <component
          v-for="( estrela, index ) in estrelas"
          :key="index"
          :is="estrela.component"
          :class="estrela.classes"
          :style="estrela.style"
          v-bind="estrela.props"
      >
      </component>
    </div>

    <div class="lua">
      <div class="textura"></div>
    </div>

    <div ref="meteoroRef" class="chuvaMeteoro"></div>

    <div class="floresta">
      <img src="https://raw.githubusercontent.com/interaminense/starry-sky/master/src/img/bgTree.png" alt="" />
    </div>
    <div ref="catRef" :class="cx( MainStyle.Cat )">
      <div v-if="!mainBooleanData.isMove" :class="cx( MainStyle.Guide )">
        <span>반갑다냥~!</span>
      </div>
      <img :src="useImage( mainData.catStateSrc )" alt="cat">
    </div>
  </div>
</template>

<style lang="scss"></style>