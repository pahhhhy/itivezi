<script setup lang="ts">
interface Emits {
  (event: 'onInput', email: string, password: string): void
}
const emit = defineEmits<Emits>()
function emitEmail(event: Event) {
  const element = event.target as HTMLInputElement
  
  emit('onInput', element.value, '')
}
function emitPassword(event: Event) {
  const element = event.target as HTMLInputElement
  emit('onInput', '', element.value)
}
</script>
<template>
  <div class="mb-3">
    <label for="exampleFormControlInput1" class="form-label">Email address</label>
    <input
      type="email"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="name@example.com"
      v-on:input="emitEmail"
    />
  </div>
  <label for="inputPassword5" class="form-label">Password</label>
  <input
    type="password"
    id="inputPassword5"
    class="form-control"
    aria-labelledby="passwordHelpBlock"
    v-on:input="emitPassword"
  />
  <div id="passwordHelpBlock" class="form-text">
    Your password must be 8-20 characters long, contain letters and numbers, and must not contain
    spaces, special characters, or emoji.
  </div>
</template>
