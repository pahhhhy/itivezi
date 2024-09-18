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
    <label for="exampleFormControlInput1" class="form-label">メールアドレス</label>
    <input
      type="email"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="name@example.com"
      v-on:input="emitEmail"
    />
  </div>
  <label for="inputPassword5" class="form-label">パスワード</label>
  <input
    type="password"
    id="inputPassword5"
    class="form-control"
    aria-labelledby="passwordHelpBlock"
    v-on:input="emitPassword"
  />
  
</template>
<style>
label{
  color: #434343;
}
</style>
