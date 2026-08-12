<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useCoupleStore } from '~/stores/useCoupleStore';

const coupleStore = useCoupleStore();
let intervalId: any = null;

onMounted(async () => {
  await coupleStore.fetchAllData();
  
  // 5초마다 자동 갱신 (Supabase 실시간 동기화)
  intervalId = setInterval(async () => {
    await coupleStore.fetchAllData();
  }, 5000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>
<template>
	<nuxt-layout>
		<nuxt-page/>
	</nuxt-layout>
</template>
