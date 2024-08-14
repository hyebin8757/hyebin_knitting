<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {BaseBtnStyle} from "~/components/base/btn/style/BaseBtnStyle";

type BtnVariant = "outlined" | "tonal" | "text" | "plain" | "flat" | "elevated";

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  ripple? : boolean,
  variant? : BtnVariant,
  hover? : boolean,
}>(), {
  ripple : false,
  variant : "text",
  hover : true,
});

/************************************************************
 * Emit
 ************************************************************/
const emit = defineEmits<{
  ( eventName: "onClick" ): void,
}>();

const onClick = () => {
  emit("onClick");
}
/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const baseBtnData = reactive({

})

const baseBtnBooleanData = reactive({

})
/************************************************************
 * Function
 ************************************************************/

/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <v-btn
      :class="cx( BaseBtnStyle.Default, props.hover || 'is-hover-none')"
      :variant="props.variant"
      :ripple="props.ripple"
      @click="onClick"
  >
    <slot name="default">
      <span>사용 기술</span>
    </slot>
  </v-btn>
</template>

<style lang="scss"></style>