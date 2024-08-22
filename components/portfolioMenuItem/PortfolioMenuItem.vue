<script setup lang="ts">
import {reactive} from "vue";
import { cx } from "@emotion/css";
import {useUtil} from "~/utils/useUtil";
import {PortfolioMenuItemStyle} from "~/components/portfolioMenuItem/style/PortfolioMenuItemStyle";

const { useImage } = useUtil.AssetResolverUtil;

/************************************************************
 * Props
 ************************************************************/
const props = withDefaults( defineProps<{
  img : Element,
  index : number,
}>(), {
  img : undefined,
  index : 0,
});

/************************************************************
 * Emit
 ************************************************************/


/************************************************************
 * Data ( ref, reactive, computed... )
 ************************************************************/
const menuItemData = reactive({

})

const menuItemBooleanData = reactive({

})
/************************************************************
 * Function
 ************************************************************/
const onClick = ( index : number ) => {
  console.log("클릭!!!!", index);
}

/************************************************************
 * Watch & Mounted
 ************************************************************/


</script>
<template>
  <div :class="cx( PortfolioMenuItemStyle.Default )" @click="onClick( props.index )">
    <div v-html="props.img || ''" :class="cx( PortfolioMenuItemStyle.Img )"></div>
  </div>
</template>

<style lang="scss"></style>