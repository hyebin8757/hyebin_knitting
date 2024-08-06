<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import BaseBtn from "~/components/base/btn/BaseBtn.vue";
import {BaseDialogStyle} from "~/components/base/dialog/style/BaseDialogStyle";

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  title : string,
}>(), {
  title : "타이틀",
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  /**
   * dialog 이벤트
   */
  ( eventName: "update:modelValue", value: boolean ): void,
}>();

/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
// const dialog = ref( false );

const dialogData = reactive({

})

const dialogBooleanData = reactive({

})

/************************************************************
 * Function
 ************************************************************/
const updateModelValue = ( value : boolean ) => {
  emit("update:modelValue", value );
}

/************************************************************
 * Watch & Mounted
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
          <span v-text="props.title"></span>
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
            <span>닫기</span>
          </BaseBtn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss"></style>