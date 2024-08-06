<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import BaseDialog from "~/components/base/dialog/BaseDialog.vue";
import {ProjectDialogStyle} from "~/components/dialog/project/style/ProjectDialogStyle";

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  workList : any,
}>(), {
  workList : "",
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
const Data = reactive({

})

const BooleanData = reactive({

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
  <BaseDialog
      :class="cx( ProjectDialogStyle.Default )"
      title="작업 내용"
      max-width="700"
      @update:model-value="updateModelValue"
  >
    <div :class="cx( ProjectDialogStyle.WorkList )">
      <ul v-html="props.workList"></ul>
    </div>
  </BaseDialog>
</template>

<style lang="scss"></style>