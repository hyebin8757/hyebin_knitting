<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {Swiper, SwiperSlide} from "swiper/vue";
import {EffectCoverflow, Pagination} from "swiper/modules";

/************************************************************
 * Props
 ************************************************************/

/************************************************************
 * Emit
 ************************************************************/


/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const Data = reactive({

})

const BooleanData = reactive({

})

const modules = [EffectCoverflow, Pagination];
/************************************************************
 * Function
 ************************************************************/

/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <swiper
      effect="coverflow"
      :grabCursor="true"
      :centeredSlides="true"
      slidesPerView="auto"
      :coverflowEffect="{
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
      }"
      :pagination="false"
      :modules="modules"
  >
    <slot name="slide">
      <swiper-slide>
        <span>swiper</span>
      </swiper-slide>
    </slot>
  </swiper>
</template>

<style lang="scss"></style>