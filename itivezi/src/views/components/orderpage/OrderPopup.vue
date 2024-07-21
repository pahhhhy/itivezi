<script setup lang="ts">
const refreshPage = () => {
  location.reload() // 現在のページをリロード
}
</script>
<template>
  <div class="card popup" style="width: 30rem">
    <div class="card-body">
      <h5 class="card-title">送信が完了しました</h5>
      <button v-on:click="refreshPage" class="btn btn-primary">初めに戻る</button>
    </div>
  </div>
</template>
<style>
.popup {
  position: absolute !important;
  top: 30%;
  left: 30%;
  z-index: 1;
}
</style>
