<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { cx } from "@emotion/css";
import {AlertOption} from "~/types/site/components/alert";
import {BaseAlertStyle} from "~/components/base/alert/style/BaseAlertStyle";
import BaseBtn from "~/components/base/btn/BaseBtn.vue";

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<AlertOption>(), {
  title : "타이블",
  text : "내용",
  type : "warning",
  isFooter : true,
  checkBtnText : "확인",
  closeBtnText : "닫기",
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * alert 이벤트
   */
  ( eventName: "onAlert", value: boolean ): void,
}>();

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const alertData = reactive({

})

const alertBooleanData = reactive({

})
/************************************************************
 * Function
 ************************************************************/
const alertToggle = ( value : boolean ) => {
  emit( "onAlert", value );
}

/************************************************************
 * Watch & Mounted
 ************************************************************/
onMounted( () => {
  if( !props.isFooter ) {
    setTimeout( () => {
      alertToggle( false );
    }, 1000);
  }
});


</script>
<template>
  <v-alert
      :class="cx( BaseAlertStyle.Default )"
      :type="props.type"
  >
    <template #title>
      <h3 v-text="props.title"></h3>
    </template>
    <template #text>
      <p v-text="props.text"></p>

      <div v-if="props.isFooter" :class="cx( BaseAlertStyle.Footer )">
        <BaseBtn
            :hover="false"
            variant="text"
            @on-click="alertToggle( true )"
        >
          <span v-text="props.checkBtnText"></span>
        </BaseBtn>
        <BaseBtn
            :hover="false"
            variant="text"
            @on-click="alertToggle( false )"
        >
          <span v-text="props.closeBtnText"></span>
        </BaseBtn>
      </div>
    </template>
  </v-alert>
</template>

<style lang="scss"></style>