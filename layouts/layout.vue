<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {reactive, computed, onMounted, ref, watch} from "vue";
import { cx } from "@emotion/css";
import TheHeader from "~/components/header/TheHeader.vue";
import {LayoutStyle} from "~/layouts/style/LayoutStyle";
import TheSidebar from "~/components/sidebar/TheSidebar.vue";


const route = useRoute();
const router = useRouter();

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const userLayoutBooleanData = reactive( {});

/************************************************************
 * Function
 ************************************************************/


/************************************************************
 * Watch & Mounted
 ************************************************************/


onMounted( () => {

});

</script>

<template>
  <v-app :full-height="false">
    <div :class="cx('wrapper', LayoutStyle.Default )">
      <!-- Header -->
      <TheHeader/>

      <section :class="cx(  'container', LayoutStyle.Container )">
        <!-- Sidebar -->
        <TheSidebar/>

        <!-- 실제 콘텐츠 -->
        <main>
          <slot/>
        </main>
      </section>
    </div>
  </v-app>
</template>

<style lang="scss" scoped></style>