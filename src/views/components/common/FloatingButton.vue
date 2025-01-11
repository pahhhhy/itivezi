<script setup lang="ts">

interface Emits {
  (event: 'click'): void
}
const emit = defineEmits<Emits>();
</script>
<template>
  <button @click="emit('click')">
    <slot/>
  </button>
</template>

<style scoped>
button {
  background-color: var(--sub-color);
  color: white;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;


  object-position:  center;

  width: 3rem;
  height: 3rem;
}
</style>