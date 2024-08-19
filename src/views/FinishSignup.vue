<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
<template>
  <h1>登録が完了しました。</h1>
  <RouterLink v-bind:to="{ name: 'AppTop' }" class="link">homeに戻る</RouterLink>
</template>
