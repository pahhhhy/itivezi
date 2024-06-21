<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="title">
    <h1>TOP</h1>
  </div>

  <p><RouterLink v-bind:to="{ name: 'orderpage' }">注文</RouterLink></p>
</template>
<style>
.title {
  text-align: center;
}
</style>
