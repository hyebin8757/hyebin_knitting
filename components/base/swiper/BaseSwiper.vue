<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {Swiper, SwiperSlide} from "swiper/vue";
import {EffectCards} from "swiper/modules";

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

// const modules = [EffectCoverflow, Pagination];
const modules = [EffectCards];
/************************************************************
 * Function
 ************************************************************/

/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <swiper
      :effect="'cards'"
      :grabCursor="true"
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