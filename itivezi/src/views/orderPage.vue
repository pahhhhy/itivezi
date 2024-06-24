<script setup lang="ts">
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase, ref, child, get } from 'firebase/database'
import { ref as Vueref } from 'vue'
const vegeData = Vueref<any>(null)
// アナリティクスの初期化
const dbRef = ref(getDatabase())
get(child(dbRef, `Vege`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      vegeData.value = snapshot.val()
      console.log(snapshot.val())
    } else {
      console.log('No data available')
    }
  })
  .catch((error) => {
    console.error(error)
  })
</script>

<template>
  <div class="title">
    <h1>注文画面</h1>
  </div>

  <div class="database">
    <h1>My Firebase</h1>
    <!-- <div v-if="isLoading">Loading…</div>
    <div v-else>{{ data }}</div> -->
    <div>{{ vegeData }}</div>
  </div>
</template>
<style>
.title {
  text-align: center;
}
.database {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
