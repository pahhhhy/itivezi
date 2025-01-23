<script setup lang="ts">
//Vueとfirebaseで同じrefという関数があって競合しているのでfirebaseの方をfireRefにしている
import { ref,watch} from 'vue'
import { useVegeStore } from "@/stores/vege"
import { useUserStore } from '@/stores/userData';
import router from '@/router';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
            en:number;
            farmer:string
            roadStation:string[]
            state:VegeState
            uid:string
            unit:string
            photo:string
        }
    }
}
const userStore=useUserStore()
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
const vegeKeys = ref<string[]>(vegeStore.getKeys())
const uproadVegeData=ref<Vegetables>({})
const vegeName=ref<string>("")
  const uproadName=ref<string>("")
const stepNum = ref<number>(0)
const step1Error=ref<boolean>(false)
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  vegeKeys.value= vegeStore.getKeys()
});
const currentUser = ref(userStore.currentUser);
watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
function pushReg(){
router.push("/registration")
}
async function changeVege() {
  if(vegeName.value!=""){
    await vegeStore.updateNewVegeData(vegeName.value)
  uproadName.value=vegeName.value
  vegeName.value=""
  }else{
    step1Error.value=true
  }
  
}
function inputVege(){
  if(vegeName.value!=""){
    step1Error.value=false
  }
}
</script>

<template>
    <article class="newVege-card">
      <div class="title">
        <h1>新しい野菜の追加</h1>
      </div>
      <article v-if="stepNum==0">
        <div class="mb-3">
            <label for="VegeNameInput" class="form-label">新しい野菜名</label>
            <input type="text" class="form-control" id="VegeNameInput" placeholder="野菜名" v-model="vegeName" v-on:change="inputVege">
          </div>
          <div v-for="(element,vegeName) in uproadVegeData" :key="vegeName">
            <p>{{vegeName}}</p>
          </div>
          <h1 style="color: red" v-show="step1Error">
            野菜を入力してください
          </h1>
          <h1 style="color:green" v-if="uproadName!=''">{{uproadName}}を追加しました</h1>
          <button v-on:click="changeVege" class="btn btn-primary">追加</button>
          <button v-on:click="pushReg()" class="btn btn-primary" >登録画面へ</button>
      </article>
    </article>
  
</template>
<style>
.title {
  text-align: center;
  border-bottom: 1px solid black;
}
.newVege-card{
  width: 340px;
  height: 600px;
  margin: 0 auto;
  border: 10px;
  background-color: white;
  margin-top: 20px;
  padding: 10px;
}
.newVege-card button{
  font-size: 1.2rem;
    padding: 15px 30px;
    margin: 5px;
    border-radius: 30px;
    border: none;
    color: white;
    background-color: var(--main-color);
}

</style>
