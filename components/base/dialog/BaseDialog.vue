<script setup lang="ts">
import { cx } from "@emotion/css";

/************************************************************
 * Components
 ************************************************************/
import BaseBtn from "~/components/base/btn/BaseBtn.vue";

/************************************************************
 * Style
 ************************************************************/
import { BaseDialogStyle } from "~/components/base/dialog/style/BaseDialogStyle";

/************************************************************
 * Utils, Constants...
 ************************************************************/

/************************************************************
 * Types, Interface
 ************************************************************/

/************************************************************
 * External Dependencies ( 외부 종속성 )
 ************************************************************/

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  title? : string,
  isCheck? : boolean,
  checkBtnText? : string,
  closeBtnText? : string,
}>(), {
  title : "타이틀",
  isCheck : false,
  checkBtnText : "확인",
  closeBtnText : "닫기",
});


/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * dialog 이벤트
   */
  ( eventName: "update:modelValue", value: boolean ): void,
  ( eventName: "onCheck"): void,
}>();

const updateModelValue = ( value : boolean ) => {
  emit("update:modelValue", value );
}

const onCheck = () => {
  emit("onCheck");
}

/************************************************************
 * Raw Data ( 원시 데이터 )
 ************************************************************/

/************************************************************
 * Dynamic Data ( 동적 데이터 )
 ************************************************************/

/************************************************************
 * Provide / inject Data
 ************************************************************/

/************************************************************
 * Function
 ************************************************************/

/************************************************************
 * Watch
 ************************************************************/

/************************************************************
 * Mounted
 ************************************************************/

/************************************************************
 * Layout
 ************************************************************/

</script>

<template>
  <v-dialog
    v-if="true"
    :class="cx( BaseDialogStyle.Default )"
    @update:model-value="updateModelValue"
  >
    <v-card>
      <template #title>
        <div class="title">
          <slot name="title">
            <span v-text="props.title"></span>
          </slot>
        </div>

        <BaseBtn
          :hover="false"
          variant="text"
          @on-click="updateModelValue( false )"
        >
          <span class="material-icons">close</span>
        </BaseBtn>
      </template>
      <v-card-text>
        <slot name="default"/>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <slot name="footer">
          <BaseBtn
            :hover="false"
            variant="flat"
            @on-click="updateModelValue( false )"
          >
            <span v-text="props.closeBtnText"></span>
          </BaseBtn>
          <BaseBtn
            v-if="props.isCheck"
            :hover="false"
            variant="flat"
            @on-click="onCheck"
          >
            <span v-text="props.checkBtnText"></span>
          </BaseBtn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss"></style>
