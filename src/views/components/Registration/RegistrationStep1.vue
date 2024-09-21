<script setup lang="ts">
import { ref,watch } from 'vue'
interface Vegetables{
    [key:string]:{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:string
            uid:string
            unit:string
            photo:string
        }
    }
}
interface Props {
  vegeList: number[]
  vegeKeys: string[]
  uproadData:Vegetables
  uniquwKey:string|null
}
interface Emits {
  (event: 'OnStep', Next: boolean): void
  (event: 'updateUproadData', element: Vegetables): void
  (event: 'changeSelectList', element: number[]): void
}
import { useUserStore } from '@/stores/userData';
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const myName=ref<string|null|undefined>(currentUser.value?.displayName) 
const myUid=ref<string|undefined>(currentUser.value?.uid)
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
  myName.value=currentUser.value?.displayName
  myUid.value=currentUser.value?.uid
});
const emit = defineEmits<Emits>()
const props = defineProps<Props>()
const selectVege = ref<string>("")
  const selectVegeList = ref<number[]>(props.vegeList)
const step1Error = ref<boolean>(false)
const uproadData=ref<Vegetables>(props.uproadData)
function onStep(next:boolean) {
  if(!next)emit('OnStep', false)
  else{
    if (selectVegeList.value.length == 0) {
    step1Error.value = true
  } else {
    step1Error.value = false
    emit('OnStep', true)
  }
}
  
}
function changeVege() {
  if(props.uniquwKey&&myName.value&&myUid.value){
    for(let i:number=0;i<selectVegeList.value.length;i++){
    selectVege.value=props.vegeKeys[selectVegeList.value[i]]
    uproadData.value[selectVege.value]={
    [props.uniquwKey]:{
      en: -1,
      farmer: myName.value,
      roadStation: "",
      state: "Available",
      uid: myUid.value,
      unit: "",
      photo: "none"
    }
  }
  }
  }else{
    console.error("myUidnaizo")
  }
  emit('updateUproadData', uproadData.value)
  emit("changeSelectList",selectVegeList.value)
}
// チェックボックスの状態が変わったときの関数
function handleCheckboxChange(item:number) {
  selectVege.value=props.vegeKeys[item]
  delete uproadData.value[selectVege.value]
  emit('updateUproadData', uproadData.value)
  emit("changeSelectList",selectVegeList.value)
}

// selectedVegeを監視して、変化を検知
watch(selectVegeList, (newVal, oldVal) => {
  const removedItems = oldVal.filter(item => !newVal.includes(item))
  if (removedItems.length > 0) {
    removedItems.forEach(item => handleCheckboxChange(item))
  }
})
</script>
<template>
  <!-- {{ uproadData }} -->
  <section>
    <h1>野菜を選択してください</h1>
    <div class="form">
      <div class="form-check" v-for="(element, index) in props.vegeKeys" :key="element">
        <input
          class="form-check-input"
          type="checkbox"
          :value="index"
          v-model="selectVegeList"
          v-on:change="changeVege"
          :id="'flexCheckIndeterminate' + index"
        />
        <label class="form-check-label" :for="'flexCheckIndeterminate' + index">
          {{ element }}
        </label>
      </div>
    </div>

    <p>Selected Vegetables: {{ selectVegeList }}</p>
    <h1 style="color: red" v-show="step1Error && selectVegeList.length == 0">
      野菜を選択してください
    </h1>
    <button v-on:click="onStep(true)" class="btn btn-primary">次へ</button>
  </section>
</template>
<style></style>
