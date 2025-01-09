<script setup lang="ts">
import router from '@/router'
import { ref, watch } from 'vue'

interface Props {
  titleData: titleDataTables
  unique: string
}
interface titleDataTables {
  orderTime: string
  orderName: string
  state: OrderStete
  uid: string
  unique: string
}

enum OrderStete {
  Completed = '取引完了',
  Uncontacted = '未連絡',
  contacted = '連絡済み',
  cancel = '取引取り消し'
}

const props = defineProps<Props>()
const fontColor = ref<string>('black')

// クエリdataを持ったページに異動する
const navigateToDetail = (unique: string | number,uid:string) => {
  console.log(unique)
  router.push({ name: 'Owner-order',  query: {
      unique,
      uid
    } })
}

// propsが変わるたびに文字色をチェック
watch(
  () => props.titleData.state,
  () => checkState()
)

// 状態に応じて文字色を変更
function checkState() {
  switch (props.titleData.state) {
    case OrderStete.Completed:
      fontColor.value = '#008037'
      break
    case OrderStete.Uncontacted:
      fontColor.value = 'red'
      break
    case OrderStete.cancel:
      fontColor.value = 'black'
      break
    case OrderStete.contacted:
      fontColor.value = 'blue'
      break
  }
}

// 初期化時に文字色を設定
checkState()
</script>

<template>
  <article class="order_element" @click="navigateToDetail(props.unique,props.titleData.uid)">
    <div class="name_time">
      <div class="name_state">
        <h4>{{ props.titleData.orderName }}</h4>
        <p :style="{ color: fontColor }">{{ props.titleData.state }}</p>
      </div>
      <p>注文時間：{{ props.titleData.orderTime }}</p>
    </div>
    <button><i class="bi bi-chevron-right"></i></button>
  </article>
</template>

<style scoped>
.name_state {
  display: flex;
}
.name_state h4 {
  width: 65%;
  margin: 0;
}
.name_state p {
  width: 35%;
  margin: 0;
}
.order_element {
  display: flex;
  height: 60px;
  border-top: 1px solid var(--line-color);
  border-bottom: 1px solid var(--line-color);
  width: 100%;
}
.order_element button {
  border: none;
  background-color: white;
  width: 20px;
  color: black;
  font-size: 25px;
  margin: auto;
  margin-right: 5px;
}
.name_time {
  width: 100%;
  height: 100%;
  margin-left: 20px;
}
</style>
