<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '~/stores/useUserStore';

const userStore = useUserStore();
let intervalId: any = null;

onMounted(async () => {
  await userStore.fetchAllData();
  
  // 다른 기기(휴대폰)에서 등록/수정한 데이터를 실시간 동기화하기 위해 5초마다 자동 갱신
  intervalId = setInterval(async () => {
    await userStore.fetchAllData();
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
