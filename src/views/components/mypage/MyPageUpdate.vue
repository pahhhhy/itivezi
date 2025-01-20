<script setup lang="ts">
import { ref,  watchEffect,watch } from 'vue'
import {  updateProfile, type User,getAuth } from 'firebase/auth'
import { getDatabase, ref as fireRef,  onValue, update } from 'firebase/database'
import {useIconStore}from "../../../stores/icon"
import { useVegeStore } from '@/stores/vege'
import { useFireOrderStore } from '@/stores/fireOrder';
import { useUserStore } from '@/stores/userData';
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:vegeElementTables
    }
}
interface vegeElementTables{
  en:number
  farmer:string
  roadStation:string[]
  state:VegeState
  uid:string
  unit:string
  photo:string
}
enum OrderStete{
  Completed="取引完了",
  Uncontacted="未連絡",
  contacted="連絡済み",
  cancel="取引取り消し"
}
interface Ordertables{
    [uid:string]:{
        [uniqueKey:string]:OrdertablesElement
    }
}
interface OrdertablesElement{
  [num:number]:{
    en:number;
    farmer:string
    roadStation:string[]
    state:VegeState
    unique:string
    unit:string
    photo:string
    amount:number
    VegeName:string
}
  orderTime:string
  email:string
  orderName:string
  selectData:string
  state:OrderStete
  totalMoney:number
place:string
}
enum Gender{
  men="男",
  women="女"
}
enum Mode{
  phone="電話",
  name="名前",
  gender="性別",
  place="住所",
  role="役職",
  icon="アイコン"
}
const iconStore = (useIconStore())
const userStore=useUserStore()
const currentUser = ref(userStore.currentUser);
const iconURL=ref<string|null|undefined>(iconStore.iconURL)
const myData = ref<any>()
const myRole = ref<string>('')
const myPlace = ref<string>('')
const myGender = ref<string>('')
const myNumber = ref<number>(0)
const upName = ref<string>('')
const upPlace = ref<string>('')
const upRole = ref<string>(myRole.value)
const upgender=ref<string>(myGender.value)
const upPhone=ref<number>(myNumber.value)
  const auth = getAuth();
  const fireOrderStore=useFireOrderStore()
  const orderAllData = ref<Ordertables>(fireOrderStore.OrderAllData)
const MyvegeData=ref<Vegetables>()
const Myorderdata=ref<Ordertables>()

// 選択された画像とプロフィール画像を格納する変数
const selectedImage = ref<File | null>(null);
const userProfileImage = ref(auth.currentUser?.photoURL || '');
// Modeに対応したboolリストをrefで作成
const modeBoolList = ref<Record<Mode, boolean>>({
  [Mode.phone]: false,
  [Mode.name]: false,
  [Mode.gender]: false,
  [Mode.place]: false,
  [Mode.role]: false,
  [Mode.icon]: false,
});
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
  watch(() => userStore.currentUser, (newUser) => {
  currentUser.value = newUser;
});
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
  initData()
});
watch(() => fireOrderStore.OrderAllData, (newUser) => {
  orderAllData.value = newUser;
  initData()//二個いるのか
}); 
watchEffect(() => {
  // currentUserがnullでない場合のみデータを読み込む
  if (currentUser.value) {
    const countRef = fireRef(getDatabase(), `UserData/${currentUser.value.uid}`)
    onValue(countRef, (snapshot) => {
      myData.value = snapshot.val()
      myRole.value = myData.value.role
      myPlace.value = myData.value.place
      myGender.value = myData.value.gender
      if(myData.value.gender=="men")myGender.value=Gender.men
      else myGender.value=Gender.women
      myNumber.value = myData.value.phoneNumber
    })
  }
})
async function initData(){
  orderAllData.value=fireOrderStore.OrderAllData
  vegeAllData.value=vegeStore.VegeAllData
  currentUser.value=userStore.currentUser
  console.log(currentUser.value?.displayName)
  if(currentUser.value!=null&&currentUser.value?.displayName){
    Myorderdata.value=filterOrdersByOrderName(orderAllData.value,currentUser.value.displayName)
    
  }
  if(currentUser.value?.displayName){
    MyvegeData.value=filterByFarmerName(vegeAllData.value,currentUser.value.displayName)
    
  }
}
initData()
// 画像選択時の処理
async function onFileChange  (e:Event)  {
  const target = e.target as HTMLInputElement;  // HTMLInputElementにキャスト
  if (target && target.files) {
    selectedImage.value = target.files[0];  // 'files'にアクセス
    userProfileImage.value = URL.createObjectURL(selectedImage.value);
  }
  // Firebase Storageに画像をアップロードし、Firebase Authのプロフィールを更新
  if (currentUser.value) {
    await iconStore.uploadImage(selectedImage.value, currentUser.value);
    pushUpdate(Mode.icon, false); 
    iconStore.initURL
    iconURL.value=iconStore.iconURL
  } 
};



function updateDisName(user: User, name: string) {
  updateProfile(user, { displayName: name })
    .then(() => {
      // 成功時の処理
      
    })
}
async function writeVege(
  vege: string,
  unique: string,
  farmerVege: string,
) {
  const db = getDatabase();
  try {
    await update(fireRef(db, 'Vegetable/' + vege + "/" + unique), {
      farmer: farmerVege,
    });
    console.log(`${vege} (${unique}) のfarmerを ${farmerVege} に更新しました`);
  } catch (error) {
    console.error(`${vege} (${unique}) の更新中にエラーが発生しました:`, error);
  }
}
async function writeOrder(unique: string, newName: string) {
  const db = getDatabase();
  if (currentUser.value != null) {
    try {
      await update(fireRef(db, 'Orders/' + currentUser.value.uid + "/" + unique), {
        orderName: newName,
      });
      console.log(`注文 ${unique} の名義を ${newName} に更新しました`);
    } catch (error) {
      console.error(`注文 ${unique} の更新中にエラーが発生しました:`, error);
    }
  }
}
//Modeによって更新するデータをかえている。trueだったらフォームの表示、falseだったらデータを更新する
async function pushUpdate(element: string, bool: boolean) {
  if (element == Mode.name) {
    modeBoolList.value[Mode.name] = bool
    if (!bool) {
      if (upName.value == '') {
        return
      }
      if (currentUser.value != null&&MyvegeData.value&&Myorderdata.value!=undefined&&currentUser.value.displayName) {
        updateDisName(currentUser.value, upName.value)
        writeUserdata(currentUser.value.uid, { name: upName.value })
        const vegeNameGroup = Object.keys(MyvegeData.value);
        for (let i = 0; i < vegeNameGroup.length; i++) {
          const vegeName = vegeNameGroup[i];
          const uniqueKeys = Object.keys(MyvegeData.value[vegeName]);    
            for (let j = 0; j < uniqueKeys.length; j++) {
              const uniqueKey = uniqueKeys[j];
              await writeVege(vegeName, uniqueKey, upName.value); // 順次更新
            }
          }
          const uniqueinData = Object.keys(Myorderdata.value[currentUser.value.uid]);
          for (let i = 0; i < uniqueinData.length; i++) {
              const uniqueKey = uniqueinData[i];
              await writeOrder(uniqueKey, upName.value); // 順次処理を実行
            }
        
      }
      //変更があったらデータを更新したい（できない）
      location.reload();
    }
  }
  if (element == Mode.role) {
    modeBoolList.value[Mode.role] = bool
    if (!bool) {
      if (currentUser.value != null) writeUserdata(currentUser.value.uid, { role: upRole.value })
    }
  }
  if (element == Mode.place) {
    modeBoolList.value[Mode.place] = bool
    if (!bool) {
      if (upPlace.value == '') {
        return
      }
      if (currentUser.value != null) writeUserdata(currentUser.value.uid, { place: upPlace.value })
    }
  }
  if (element == Mode.gender) {
    modeBoolList.value[Mode.gender] = bool
    if (!bool) {
      
      if (currentUser.value != null) writeUserdata(currentUser.value.uid, { Gender: upgender.value })
    }
  }
  if (element == Mode.phone) {
    modeBoolList.value[Mode.phone] = bool
    if (!bool) {
      if (upPhone.value == 0) {
        return
      }
      if (currentUser.value != null) writeUserdata(currentUser.value.uid, { PhoneNumber: upPhone.value })
    }
  }
  if (element == Mode.icon) {
    modeBoolList.value[Mode.icon] = bool
  }
}
function writeUserdata(
  uid: string,
  data: { role?: string; place?: string; PhoneNumber?: number; Gender?: string; name?: string }
) {
  const db = getDatabase()
  const updates: { [key: string]: any } = {}
  // roleが存在する場合、roleをアップデートする
  if (data.role !== undefined) {
    updates['role'] = data.role
  }
  if (data.place !== undefined) {
    updates['place'] = data.place
  }
  if (data.PhoneNumber !== undefined) {
    updates['phoneNumber'] = data.PhoneNumber
  }
  if (data.Gender !== undefined) {
    updates['gender'] = data.Gender
  }
  if (data.name !== undefined) {
    updates['name'] = data.name
  }

  // いずれかのデータがあればデータベースに書き込む
  if (Object.keys(updates).length > 0) {
    update(fireRef(db, 'UserData/' + uid), updates)
  }
}
function filterByFarmerName(vegetables: Vegetables, farmerName: string): Vegetables {
    const result: Vegetables = {};

    for (const vegeName in vegetables) {
        const filteredEntries: { [uniqueKey: string]: vegeElementTables } = {};
        
        for (const uniqueKey in vegetables[vegeName]) {
            const element = vegetables[vegeName][uniqueKey];
            if (element.farmer === farmerName) {
                filteredEntries[uniqueKey] = element;
            }
        }

        // Only include the vegetable if it has at least one matching entry
        if (Object.keys(filteredEntries).length > 0) {
            result[vegeName] = filteredEntries;
        }
    }

    return result;
}
//全てのデータから自分のデータを抽出する
function filterOrdersByOrderName(orders: Ordertables, orderName: string): Ordertables {
    const result: Ordertables = {};

    for (const uid in orders) {
        const filteredEntries: { [uniqueKey: string]: OrdertablesElement } = {};

        for (const uniqueKey in orders[uid]) {
            const element = orders[uid][uniqueKey];
            if (element.orderName === orderName) {
                filteredEntries[uniqueKey] = element;
            }
        }

        // Include the UID if it has at least one matching entry
        if (Object.keys(filteredEntries).length > 0) {
            result[uid] = filteredEntries;
        }
    }

    return result;
}
</script>
<template>
  <article class="myacount_card">
    <div v-if="!modeBoolList[Mode.icon]" v-on:click="pushUpdate(Mode.icon,true)">
      <div v-if="iconURL != null&&iconURL != '' " class="icon-image"><img v-bind:src="iconURL" alt=""></div>
      <div v-if="iconURL == null||iconURL == '' "><img src="../../../assets/icon.png" alt="" class="aicon-image"></div>
    </div>
    <div v-if="modeBoolList[Mode.icon]" class="changeicon">
      <div v-if="iconURL != null&&iconURL != '' " class="icon-image" v-on:click="pushUpdate(Mode.icon,false)"><img v-bind:src="iconURL" alt=""></div>
      <label for="file-input" class="custom-file-label">
        <i class="bi-upload"></i>
      </label>
      <input type="file" id="file-input" @change="onFileChange" class="hidden-input" />
    </div>
    
      <div v-if="!modeBoolList[Mode.name]" class="changename">
        <h2>{{currentUser?.displayName}}</h2>
        <button v-on:click="pushUpdate(Mode.name,true)"><i class="bi bi-pencil-square"></i> </button>
      </div>
      <div v-if="modeBoolList[Mode.name]" class="changename">
        <input
        class="form-control"
        type="text"
        placeholder="名前"
        aria-label="default input example"
        v-model="upName"
      />
      <button v-on:click="pushUpdate(Mode.name,false)"><i class="bi bi-check-square-fill"></i></button>
      </div>
    <div class="myacount_element">
      <p class="head">TEL</p>
      <p class="element">{{myNumber}}</p>
    </div>
    <div class="myacount_element">
      <p class="head">email</p>
      <p class="element">{{currentUser?.email}}</p>
    </div>
    <div class="myacount_element" v-if="!modeBoolList[Mode.place]">
      <p class="head">住所</p>
      <p class="element">{{myPlace}}</p>
      <button v-on:click="pushUpdate(Mode.place,true)">
        <i class="bi bi-pencil-square"></i>
      </button>
    </div>
    <div class="myacount_element" v-if="modeBoolList[Mode.place]">
      <p class="head">住所</p>
      <input
        class="form-control"
        type="text"
        placeholder="住所"
        aria-label="default input example"
        v-model="upPlace"
      />
      <button v-on:click="pushUpdate(Mode.place,false)">
        <i class="bi bi-pencil-square"></i>
      </button>
    </div>
    <div class="myacount_element">
      <p class="head">役職</p>
      <p class="element">{{myRole}}</p>
    </div>
  </article>
  
</template>
<style>
p{
  margin: 0;
}
.myacount_card{
  width: 512px;
  border: none;
  background-color: white;
  border-radius: 5px;
  margin :20px auto;
  padding: 5px 20px;
}
.icon-image{
  height: 75px;
  width: 75px;
  margin: 5px auto;
}
.icon-image img{
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.changename{
  display: flex;
  justify-content: center;
  align-items: center;
}
.changeicon{
  display: flex;
  justify-content: center;
  align-items: center;
}
.changeicon>.icon-image{
  height: 50px;
  width: 50px;
  margin: 5px;
}
.changename h2{
  font-size: 24px;
}
.changename button{
  border: none;
  background-color: white;
  margin-left: 10px;
}
.changename i{
  color: var(--main-color);
  font-size: 18px;
  display: flex;
  align-items: center;
}
.myacount_element{
  display: flex;
}
.head{
  width: 20%;
  margin: 0;
  margin-bottom: 5px;
  font-size: 20px;
}
.element{
  width: 70%;
  margin: 0;
  margin-bottom: 5px;
  font-size: 20px;
}
.myacount_card i{
  width: 10%;
  color: var(--main-color);
  font-size: 18px;
}
.myacount_element button{
  border: none;
  background-color: white;
}
.toggle-button {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}
.UP_elements {
  display: flex;
  width: 40%;
  height: 50px;
}
.hidden-input {
  display: none;
}
@media (max-width: 575.98px) { 
  .myacount_card{
    width: 340px;
  }
  .icon-image{
    height: 50px;
    width: 50px;
  }
  .changename h2{
    font-size: 18px;
  }
  .head{
    font-size: 16px;
  }
  .element{
    font-size: 16px;
  }
}
</style>
