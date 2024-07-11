<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import {reactive, computed, onMounted, ref, watch} from "vue";
import { cx } from "@emotion/css";


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
    <div :class="cx('wrapper')">
      <main>
        <slot/>
      </main>
    </div>
  </v-app>
</template>

<style lang="scss" scoped></style>