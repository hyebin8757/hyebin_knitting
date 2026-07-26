<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/user/ledger');
    }
  ]
});
</script>

<template>
  <div></div>
</template>
