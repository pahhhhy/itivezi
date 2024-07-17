<script setup lang="ts">
interface Porps {
  vegekeys: string[]
  vegealldata: { [key: string]: any[] }
  Selectvege: number[]
  Selectdate: Date[]
  SelectMen: string[]
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'changemen', element: string[]): void
}
const emit = defineEmits<Emits>()
const porps = defineProps<Porps>()
</script>

<template>
  <section>
    <h1>Step3</h1>
    <article v-for="(element, index) in porps.Selectvege" v-bind:key="element">
      <h1>{{ porps.vegekeys[element] }}</h1>
      <p>生産者：{{ porps.vegealldata[porps.vegekeys[porps.Selectvege]][SelectMen].s }}</p>
      <h3 v-show="Step2Num != 0">単位:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].unit }}</h3>
      <h3 v-show="Step2Num != 0">単価:{{ VegeAllData[vegekeys[SelectVege]][SelectMen].en }}円</h3>
    </article>
    

    <!-- スクロールで値が変わるのと０以下を書くことができるのがまずい -->
    <input
      class="form-control"
      type="number"
      placeholder="何組買いますか？"
      aria-label="default input example"
      v-model="vegetableCount"
      v-on:change="changeMoney(VegeAllData[vegekeys[SelectVege]][SelectMen].en)"
    />
    <h1>何組：{{ vegetableCount }}組</h1>
    <h1>合計：{{ Totalmoney }}円</h1>
    <h1 style="color: red" v-show="Step3error && vegetableCount == 0">個数を指定してください</h1>
    <!-- 今日より前を選択不可にしないと -->
    <VueDatePicker
      v-model="selectedDate"
      format="yyyy/MM/dd"
      locale="ja"
      model-type="yyyy-MM-dd"
      week-start="0"
      :enable-time-picker="false"
      auto-apply
      no-today
    />
    <h1>{{ selectedDate }}</h1>
    <h1 style="color: red" v-show="Step3error && selectedDate == null">日付を選択してください</h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
    <button v-on:click="onStep(false)" class="btn btn-primary">戻る</button>
  </section>
</template>
<style></style>
