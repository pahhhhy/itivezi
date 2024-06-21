<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <AppHeader></AppHeader>

  <RouterView />
</template>

<style scoped>
* {
  width: 100%;
  height: 100%;
}
</style>
