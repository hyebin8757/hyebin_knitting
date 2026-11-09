<script setup lang="ts">
import { onMounted } from 'vue';
import { useKnittingStore } from '~/stores/useKnittingStore';

const knittingStore = useKnittingStore();

onMounted(() => {
  knittingStore.loadFromLocalStorage();
});
</script>

<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<style>
/* 전역 스크롤바 및 기본 스타일 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background-color: #faf7f2;
  color: #2b1f1d;
  -webkit-font-smoothing: antialiased;
}

/* 숫자 폰트 고정 */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
