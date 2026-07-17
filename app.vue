<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from '~/stores/useUserStore';

const userStore = useUserStore();

onMounted(async () => {
  await userStore.fetchAllData();
});
</script>
<template>
	<nuxt-layout>
		<nuxt-page/>
	</nuxt-layout>
</template>
