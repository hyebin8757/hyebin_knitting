<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { cx } from "@emotion/css";
import {AlertOption} from "~/types/site/components/alert";
import {useUtil} from "~/utils/useUtil";
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import {BaseAlertStyle} from "~/components/base/alert/style/BaseAlertStyle";

const { isNotEmpty } = useUtil.typeValidation;

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<AlertOption>(), {
  title : "타이틀",
  text : "내용",
  type : "warning",
  checkBtnText : "확인",
  closeBtnText : "닫기",
  isFooter : true,
  isCheckBtn : true,
  isCloseBtn : true,
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * alert 이벤트
   */
  ( eventName: "update:modelValue", value: boolean ): void,

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
  emit( "update:modelValue", false );
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
    <template #title v-if="isNotEmpty(props.title)">
      <h3 v-text="props.title"></h3>
    </template>
    <template #text>
      <p v-if="isNotEmpty(props.text)" v-text="props.text"></p>

      <div v-if="props.isFooter" :class="cx( BaseAlertStyle.Footer )">
        <BaseBtn
            v-if="props.isCheckBtn"
            :hover="false"
            variant="text"
            @on-click="alertToggle( true )"
        >
          <span v-text="props.checkBtnText"></span>
        </BaseBtn>
        <BaseBtn
            v-if="props.isCloseBtn"
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