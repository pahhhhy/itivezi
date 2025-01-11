<script setup lang="ts">

</script>

<template>
  <div class="floating-button">
    <slot/>
  </div>
</template>

<style scoped>
.floating-button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;

}

</style>