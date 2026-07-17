<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '~/stores/useUserStore';

const userStore = useUserStore();
let intervalId: any = null;

onMounted(async () => {
  // 안전한 컨텍스트(app.vue) 위치에서 Supabase 클라이언트를 초기화하여 스토어에 꽂아줍니다.
  try {
    const client = useSupabaseClient();
    userStore.setSupabaseInstance(client);
  } catch (e) {
    console.error("Supabase 클라이언트 초기화 에러:", e);
  }

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
