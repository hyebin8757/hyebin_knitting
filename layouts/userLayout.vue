<script setup lang="ts">
// Modern fallback for userLayout
</script>

<template>
  <div class="user-layout-root">
    <slot />
  </div>
</template>

<style scoped>
.user-layout-root {
  min-height: 100vh;
}
</style>
