<script setup lang="ts">
import { ref,  watchEffect,watch } from 'vue'
import {  updateProfile, type User } from 'firebase/auth'
import { getDatabase, ref as fireRef,  onValue, update } from 'firebase/database'
import {useRoadStationStore}from "../../../stores/roadStation"
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
interface Props {
  currentUser: User | null
  vegeAllData:any
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
  role="役職"
}
const props = defineProps<Props>()
const isToggle = ref<boolean>(false)
function pushToggle() {
  isToggle.value = !isToggle.value;
}
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
watchEffect(() => {
  // currentUserがnullでない場合のみデータを読み込む
  if (props.currentUser) {
    const countRef = fireRef(getDatabase(), `testUser/${props.currentUser.uid}`)
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
function updateDisName(user: User, name: string) {
  updateProfile(user, { displayName: name })
    .then(() => {
      // 成功時の処理
      
    })
}
const elementsBool = ref<boolean[]>(new Array(6).fill(false))
function pushUpdate(element: string, bool: boolean) {
  if (element == Mode.name) {
    elementsBool.value[0] = bool
    if (!bool) {
      if (upName.value == '') {
        return
      }
      if (props.currentUser != null) {
        updateDisName(props.currentUser, upName.value)
        writeUserdata(props.currentUser.uid, { name: upName.value })
        for(let i:number=0;i<MyvegeData.value.length;i++){
          writeVege(MyvegeData.value[i][0],MyvegeData.value[i][1],MyvegeData.value[i][2],upName.value)
        }
        for(let i:number=0;i<roadStationUnitTempList.value.length;i++){
          for(let j:number=0;j<Myorderdata.value[roadStationUnitTempList.value[i]].length;j++){
          writeOrder(roadStationUnitTempList.value[i],Myorderdata.value[roadStationUnitTempList.value[i]][j],upName.value)
        }
        }
      }
    }
  }
  if (element == Mode.role) {
    elementsBool.value[2] = bool
    if (!bool) {
      if (props.currentUser != null) writeUserdata(props.currentUser.uid, { role: upRole.value })
    }
  }
  if (element == Mode.place) {
    elementsBool.value[3] = bool
    if (!bool) {
      if (upPlace.value == '') {
        return
      }
      if (props.currentUser != null) writeUserdata(props.currentUser.uid, { place: upPlace.value })
    }
  }
  if (element == Mode.gender) {
    elementsBool.value[4] = bool
    if (!bool) {
      
      if (props.currentUser != null) writeUserdata(props.currentUser.uid, { Gender: upgender.value })
    }
  }
  if (element == Mode.phone) {
    elementsBool.value[5] = bool
    if (!bool) {
      if (upPhone.value == 0) {
        return
      }
      if (props.currentUser != null) writeUserdata(props.currentUser.uid, { PhoneNumber: upPhone.value })
    }
  }
}
function readOrderAllData(): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testOrders/')
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
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
    update(fireRef(db, 'testUser/' + uid), updates)
  }
}
function extractFarmerInfo(data: any): [string, string, string][] {
    const result: [string, string, string][] = [];

    if (!data || typeof data !== 'object') {
      console.log("asdwasdwasdw")
        return result;
    }

    Object.entries(data).forEach(([location, crops]) => {
        if (!crops || typeof crops !== 'object') return;

        Object.entries(crops as any).forEach(([cropName, items]) => {
            if (!items || typeof items !== 'object') return;

            Object.entries(items as any).forEach(([itemId, info]) => {
                if (typeof info === 'object' && info !== null && 'farmer' in info) {
                    const farmer = (info as { farmer: string }).farmer;
                    if (farmer === props.currentUser?.displayName) {
                        result.push([location, cropName, itemId]);
                    }
                }
            });
        });
    });

    return result;
}
function extractOrderLocations(data: any, targetName: string|null): { [location: string]: string[] } {
  const result: { [location: string]: string[] } = {};
  if(targetName==null)return result
  for (const location in data) {
    result[location] = [];

    for (const id in data[location]) {
      const orders = data[location][id];

      for (const orderDate in orders) {
        const order = orders[orderDate];

        if (order.orderName === targetName) {
          result[location].push(orderDate);
        }
      }
    }
  }

  return result;
}
const OrderAllData=ref<any>([])
const MyvegeData=ref<[string, string, string][]>(extractFarmerInfo(props.vegeAllData))
const Myorderdata=ref<any>()
async function initData(){
  OrderAllData.value=await readOrderAllData()
  if(props.currentUser!=null){
    Myorderdata.value=extractOrderLocations(OrderAllData.value,props.currentUser.displayName)
  }
  
}
initData()
// vegeAllData を監視
watch(() => props.vegeAllData, () => {
  MyvegeData.value=extractFarmerInfo(props.vegeAllData)
});
async function writeVege(
  road:string,
  vege: string,
  unique:string,
  farmerVege: string,
  
) {
  const db = getDatabase()
  
    update(fireRef(db, 'testVege/' +road+"/"+ vege+"/"+ unique), {
      farmer: farmerVege,
    })
  
}
async function writeOrder(
  road:string,
  day:string,
  nweName:string
  
) {
  const db = getDatabase()
  if(props.currentUser!=null){
    update(fireRef(db, 'testOrders/' +road+"/"+ props.currentUser.uid+"/"+ day), {
      orderName: nweName,
    })
  }
    
  
}
</script>
<template>
  <!-- {{ props.vegeAllData }} -->
    <!-- {{MyvegeData}} -->
     {{ Myorderdata }}
  <button v-on:click="pushToggle()" class="toggle-button">
    <i class="bi bi-caret-down-fill" v-show="!isToggle"></i>
    <i class="bi bi-caret-up-fill" v-show="isToggle"></i>
    <h2>自分の情報更新</h2>
  </button>
  <article v-show="isToggle">
    <div class="UP_elements" v-show="!elementsBool[0]">
      <h2>名前:{{ currentUser?.displayName }}</h2>
      <button v-on:click="pushUpdate(Mode.name, true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[0]">
      <input
        class="form-control"
        type="text"
        placeholder="名前"
        aria-label="default input example"
        v-model="upName"
      />
      <button v-on:click="pushUpdate(Mode.name, false)" class="btn btn-primary">更新する</button>
    </div>
    
    
    <div class="UP_elements" v-show="elementsBool[4]">
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          value="men"
          name="gender"
          v-model="upgender"
          id="genderMen"
        />
        <label class="form-check-label" for="genderMen"> 男 </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          name="gender"
          value="women"
          id="genderWomen"
          v-model="upgender"
        />
        <label class="form-check-label" for="genderWomen"> 女 </label>
      </div>
      <button v-on:click="pushUpdate(Mode.gender, false)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="!elementsBool[4]">
      <h2>性別:{{ myGender }}</h2>
      <button v-on:click="pushUpdate(Mode.gender, true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="!elementsBool[5]">
      <h2>電話番号:{{ myNumber }}</h2>
      <button v-on:click="pushUpdate(Mode.phone, true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[5]">
      <input
        class="form-control"
        type="text"
        placeholder="電話番号"
        aria-label="default input example"
        v-model="upPhone"
      />
      <button v-on:click="pushUpdate(Mode.phone, false)" class="btn btn-primary">更新する</button>
    </div>
    <h2>email:{{ currentUser?.email }}</h2>
    <div class="UP_elements" v-show="!elementsBool[2]">
      <h2>役職:{{ myRole }}</h2>
      <button
        v-on:click="pushUpdate(Mode.role, true)"
        class="btn btn-primary"
        v-if="myRole != '管理者'"
      >
        更新する
      </button>
    </div>
    <div class="UP_radio" v-show="elementsBool[2]">
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          value="農家"
          name="flexRadioDefault"
          v-model="upRole"
          id="flexRadioDefault1"
        />
        <label class="form-check-label" for="flexRadioDefault1"> 農家 </label>
      </div>
      <div class="form-check">
        <input
          class="form-check-input"
          type="radio"
          name="flexRadioDefault"
          value="飲食店"
          id="flexRadioDefault2"
          v-model="upRole"
        />
        <label class="form-check-label" for="flexRadioDefault2"> 飲食店 </label>
      </div>
      <button v-on:click="pushUpdate(Mode.role, false)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="!elementsBool[3]">
      <h2>住所:{{ myPlace }}</h2>
      <button v-on:click="pushUpdate(Mode.place, true)" class="btn btn-primary">更新する</button>
    </div>
    <div class="UP_elements" v-show="elementsBool[3]">
      <input
        class="form-control"
        type="text"
        placeholder="住所"
        aria-label="default input example"
        v-model="upPlace"
      />
      <button v-on:click="pushUpdate(Mode.place, false)" class="btn btn-primary">更新する</button>
    </div>
  </article>
</template>
<style>
.toggle-button {
  border: none;
  background-color: white;
  display: flex;
  align-items: center;
}
.UP_elements {
  display: flex;
  width: 30%;
  height: 50px;
}
</style>
