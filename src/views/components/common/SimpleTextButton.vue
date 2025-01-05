<script setup lang="ts">

interface Props {
  disabled?: boolean
  fontSize?: string
  bold?: boolean
}
const {disabled = false, fontSize = '1rem'} = defineProps<Props>()

interface Emits {
  (event: 'click'): void
}
const emit = defineEmits<Emits>()

</script>

<template>
  <button class="simple-text-button" @click="emit('click')" :disabled="disabled">
    <slot></slot>
  </button>
</template>

<style scoped>
.simple-text-button {
  border: none;
  background: none;
  cursor: v-bind("disabled ? 'not-allowed' : 'pointer'");
  font-size: v-bind(fontSize);
  color: v-bind("disabled ? 'gray' : 'var(--text-color)'");
  font-weight: v-bind("bold ? 'bold' : 'normal'");
}

</style>