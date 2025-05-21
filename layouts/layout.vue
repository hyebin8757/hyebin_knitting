<script setup lang="ts">
import {useRoute, useRouter} from "vue-router";
import { computed, onBeforeMount, onMounted, ref, provide } from "vue";
import { cx } from "@emotion/css";
import TheHeader from "~/components/header/TheHeader.vue";
import TheSidebar from "~/components/sidebar/TheSidebar.vue";
import TheMenu from "~/components/menu/TheMenu.vue";
import {useUtil} from "~/utils/useUtil";
import {LayoutStyle} from "~/layouts/style/LayoutStyle";

const route = useRoute();
const router = useRouter();

const { isEmpty } = useUtil.typeValidation;

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const restoreMenu = ref( "" );

const windowWidth = ref( 0 );

const menuRef = ref( null );

const isMobile = computed( () => {
  return 1024 >= windowWidth.value;
});

const mobileSidebar = ref( false );


provide( "windowWidth", windowWidth );

provide( "isMobile", isMobile );

provide( "mobileSidebar", mobileSidebar );

/************************************************************
 * Function
 ************************************************************/
// 삭제 된 메뉴 복원
const onRestore = ( label : string ) => {
  restoreMenu.value = label;
}

// 메뉴 reset
const onMenuReset = () => {
  if ( isEmpty( menuRef.value ) ) {
    return;
  }

  menuRef.value.onMenuReset();
}

const setWindowWidth = ( data : any ) => {
  windowWidth.value = data.target.innerWidth;
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted( () => {

  windowWidth.value = window.innerWidth;

  window.addEventListener( "resize", setWindowWidth )
});

onBeforeMount( () => {

});

</script>

<template>
  <v-app :full-height="false">
    <div :class="cx('wrapper', LayoutStyle.Default )">
      <!-- Header -->
      <TheHeader @on-menu-reset="onMenuReset"/>

      <section :class="cx(  'container', LayoutStyle.Container )">
        <!-- Sidebar -->
        <TheSidebar @on-restore="onRestore"/>

        <!-- 실제 콘텐츠 -->
        <main :class="cx( LayoutStyle.Main )">
          <!-- menu -->
          <TheMenu ref="menuRef"  :restore-menu="restoreMenu"/>

          <slot/>
        </main>
      </section>
    </div>
  </v-app>
</template>

<style lang="scss" scoped></style>