<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useKnittingStore } from "~/stores/useKnittingStore";

const router = useRouter();
const store = useKnittingStore();

onMounted(() => {
  store.loadFromLocalStorage();
  if (store.isAdminLoggedIn) {
    router.replace("/admin");
  } else {
    router.replace("/admin/login");
  }
});
</script>

<template>
  <div class="manage-redirecting">
    <div class="spinner"></div>
    <p>관리자 페이지로 연결 중...</p>
  </div>
</template>

<style scoped>
.manage-redirecting {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #8c7e7b;
  font-size: 0.95rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #ebdcd0;
  border-top-color: #ff4d6d;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
