<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { cx } from "@emotion/css";
import { definePageMeta } from "~/.nuxt/imports";

/************************************************************
 * Components
 ************************************************************/

/************************************************************
 * Style
 ************************************************************/
import { ContactStyle } from "~/assets/style/pages/ContactStyle";

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
const { isEmpty, isNotEmpty } = useUtil.typeValidation;

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/
const contactData = reactive({
  socialsList : [
    {
      title : "email",
      text : `<a href="mailto:dnwnekek2@gmail.com" ref="email">
                <span>dn</span><span>wk</span><span>ek</span><span>e2</span><span>@g</span><span>ma</span><span>il</span><span>.com</span>
              </a>
      `,
      html : true,
    },
    {
      title : "github",
      text : "miuju",
      html : false,
    },
    {
      title : "kakao",
      text : `<a href="">kakao open chat</a>`,
      html : true,
    },
  ],
});

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/
const contactBooleanData = reactive({
  isVideo : false,
});

const emphasisRef =  ref( null );
const listAreaRef =  ref( null );
const emailEl =  ref( null );
const spanElAll =  ref( null );
const timer = ref();
const spanTimerList = ref<any[]>([]);

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/
const escapeHtml = ( str : string ) => {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const setCursor = ( type : string ) => {
  switch ( type ) {
    case "email" :
      hoverEmail();
      break;
  }
}

const removeCursor = () => {
  contactBooleanData.isVideo = false;
  clearTimeout( timer.value );

  if ( isNotEmpty( spanTimerList.value.length )  ) {
    spanElAll.value?.forEach( item => item.classList.remove("is-active"));
    spanTimerList.value.forEach( item => {clearTimeout( item ) });
  }
}

const hoverEmail = () => {
  contactBooleanData.isVideo = true;

  if ( isEmpty( listAreaRef.value ) ) {
    return;
  }

  emailEl.value = listAreaRef.value?.querySelector(".text a[ref='email']");
  spanElAll.value = emailEl.value?.querySelectorAll("span");

  spanElAll.value?.forEach( ( item : Element, index : number ) => {
    if ( isEmpty( item ) ) {
      return;
    }
    const spanTimer = setTimeout(() => {
      item.classList.add("is-active");
    }, Number(`${index+1}000`));

    spanTimerList.value.push( spanTimer );
  })

  timer.value = setTimeout(() => {
    const emailElHref = emailEl.value?.href;

    emailElHref && ( window.location.href = emailElHref );
  }, 8000);
}


/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/
onMounted(()=> {
  if( isEmpty( emphasisRef.value ) ) {
    return;
  }

  emphasisRef.value?.setAttribute("data-heading", emphasisRef.value.innerText);
});

/************************************************************
 * Layout
 ************************************************************/
definePageMeta( {
  layout: "layout",
} );

</script>

<template>
  <div :class="cx('contact', ContactStyle.Default )">
    <div :class="cx( ContactStyle.Me )">
      <img src="@/assets/images/img/img_me1.png" alt="">

      <div>
        <img src="@/assets/images/img/img_name.png" alt="">
        <img src="@/assets/images/img/img_cat.png" alt="">
      </div>
    </div>

    <div :class="cx( ContactStyle.Content )">
      <div :class="cx( ContactStyle.ListArea )">
        <b>SOCIALS</b>

        <ul
            ref="listAreaRef"
        >
          <li
              v-for="( item, index ) in contactData.socialsList"
              :key="index"
              :class="cx( ContactStyle.ListItem )"
          >
            <span v-text="item.title" class="title"></span>
            <span class="colon"> : </span> <br>
            <span v-if="!item.html" v-text="item.text" class="text"></span>
            <span v-if="item.html" v-html="item.text" class="text" @mouseenter="setCursor( item.title )" @mouseleave="removeCursor"></span>
          </li>
        </ul>
      </div>

      <div v-if="contactBooleanData.isVideo" :class="cx( ContactStyle.Video )">
        <video autoplay  muted>
          <source src="@/assets/video/contact/video_contact.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
