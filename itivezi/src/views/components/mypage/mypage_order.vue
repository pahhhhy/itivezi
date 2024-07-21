<script setup lang="ts">
import { getDatabase, ref as Fireref, child, get, onValue, set, remove } from 'firebase/database'
import { ref as Vueref, computed, onMounted, watch } from 'vue'
function ReadData(element: string) {
  const CountRef = Fireref(getDatabase(), 'testOrder/' + element)
  const Data = Vueref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Data
}
</script>
<template>
  <h1>タイトル</h1>
</template>
<style></style>
