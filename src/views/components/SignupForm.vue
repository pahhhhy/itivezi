<script setup lang="ts">
interface Emits {
  (event: 'onInput', email: string, password: string, name: string): void
}
const emit = defineEmits<Emits>()
function emitEmail(event: Event) {
  const element = event.target as HTMLInputElement

  emit('onInput', element.value, '', '')
}
function emitPassword(event: Event) {
  const element = event.target as HTMLInputElement
  emit('onInput', '', element.value, '')
}
function emitName(event: Event) {
  const element = event.target as HTMLInputElement
  emit('onInput', '', '', element.value)
}
</script>
<template>
  <div class="mb-3">
    <label for="exampleFormControlInput1" class="form-label">アカウント名</label>
    <input
      type="text"
      class="form-control"
      id="exampleFormControlInput1"
      placeholder="name"
      v-on:input="emitName"
    />
  </div>
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
  <div id="passwordHelpBlock" class="form-text">
    パスワードは 8 ～ 20
    文字で、文字と数字を含める必要があります。スペース、特殊文字、絵文字を含めることはできません。
  </div>
</template>
