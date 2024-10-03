<script setup lang="ts">
import {onMounted, ref,watch} from 'vue'
import {getDatabase, onValue, ref as fireRef, set, update} from 'firebase/database'
import {useRoadStationStore} from "../../../stores/roadStation"
import draggable from 'vuedraggable'
import {getAuth, onAuthStateChanged, type User} from 'firebase/auth'
import { useVegeStore } from '@/stores/vege'
enum State{
  Discontinued="Discontinued",
  Available="Available"
}
interface Vegetables{
    [key:string]:{
        [key:string]:{
            en:number;
            farmer:string
            roadStation:string
            state:State
            uid:string
            unit:string
            photo:string
        }
    }
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    Murone="室根",
    Kawasaki="川崎",
    None=""
  }
const vegeStore=useVegeStore()
const vegeAllData = ref<Vegetables>(vegeStore.VegeAllData)
watch(() => vegeStore.VegeAllData, (newUser) => {
  vegeAllData.value = newUser;
});
const roadStationUnitTempList = ref<string[]>(useRoadStationStore().roadStationTemp)
const isActive = ref<boolean>(false)
const vegeKeys = ref<string[]>([])
const selectedRoadStation = ref<string>(roadStationUnitTempList.value[0])
const excludedVegeList = ref<any>([])
const farmerVegeList = ref<any>([])
const uniqueVegeList = ref<any>([])
const deleteVegeName = ref<string>("")
const isPopup = ref<boolean>(false)
const CSVfile = ref<any>("")
const currentTime = ref<string>('')

function pushActive() {
  if (isActive.value) {
    //更新するを押したら並び順リストを更新する
    writeVegeKeys(vegeKeys.value, selectedRoadStation.value)
  }
  isActive.value = !isActive.value

}

const currentUser = ref<User | null>(null)
onMounted(() => {
  const auth = getAuth()
  // ログインしているユーザーを取得する
  onAuthStateChanged(auth, (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user

    } else {
      currentUser.value = null
    }
  })
})
// stateが"Discontinued"のアイテムを排除する関数
// 全部、型をanyでやってるの悪そうな感じがする
const filterDiscontinuedItems = (data: any) => {
  const filteredData: any = {};
  const excludedItems: any = {};  // 排除されたアイテムを保存するオブジェクト
  const allDiscontinuedCategories: string[] = [];  // すべてが "Discontinued" のカテゴリ名を保存する配列

  for (const [category, items] of Object.entries(data) as [string, any]) {
    const filteredItems: any = {};
    const excludedCategoryItems: any = {};  // このカテゴリーで排除されたアイテム
    let allDiscontinued = true;  // すべてが "Discontinued" かどうかをチェックするフラグ

    for (const [id, item] of Object.entries(items as any) as [string, any]) {
      if (item.state !== "Discontinued") {
        filteredItems[id] = item;
        allDiscontinued = false;  // "Discontinued" でないアイテムがあればフラグをfalseに
      } else {
        excludedCategoryItems[id] = item;  // 排除されたアイテムを保存
      }
    }

    if (Object.keys(filteredItems).length > 0) {
      filteredData[category] = filteredItems;
    }
    if (Object.keys(excludedCategoryItems).length > 0) {
      excludedItems[category] = excludedCategoryItems;
    }

    if (allDiscontinued) {
      allDiscontinuedCategories.push(category);  // すべてが "Discontinued" ならカテゴリ名を保存
    }
  }

  excludedVegeList.value = allDiscontinuedCategories;
  return filteredData;
};

function writeVegeKeys(
    vegeKeys: string[],
    roadStation: string
) {
  const db = getDatabase()
  set(fireRef(db, 'testVegeKeys/' + roadStation + "/"), vegeKeys)
      .then(() => {
      })
      .catch((error) => {
        console.error("Error saving list: ", error);
      })
}

function readvegeAllData(roadStation: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const countRef = fireRef(getDatabase(), 'testVege/' + roadStation + "/")
    onValue(countRef, (snapshot) => {
      resolve(snapshot.val())
    }, (error) => {
      reject(error)
    });
  });
}

function extractVegetableInfo(data: any): { [key: string]: string[] } {
  const result: { [key: string]: string[] } = {};
  const uidResult: { [key: string]: string[] } = {};

  for (const vegetable in data) {
    const farmers = Object.entries(data[vegetable]);

    // 複数の農家がある場合
    if (farmers.length > 1) {
      const uniqueFarmers = new Set<string>();
      const uniqueUIDs = new Set<string>();

      for (const [uid, farmerInfo] of farmers) {
        uniqueFarmers.add((farmerInfo as any).farmer);
        uniqueUIDs.add(uid);
      }

      result[vegetable] = Array.from(uniqueFarmers); // キーが野菜、値が生産者名のリスト
      uidResult[vegetable] = Array.from(uniqueUIDs); // キーが野菜、値がUIDのリスト
    } else {
      // 単一の農家がある場合
      const [uid, farmerInfo] = farmers[0];
      result[vegetable] = [(farmerInfo as any).farmer]; // キーが野菜、値が生産者名のリスト
      uidResult[vegetable] = [uid]; // キーが野菜、値がUIDのリスト
    }
  }

  uniqueVegeList.value = uidResult;
  return result;
}

async function initData() {
  vegeAllData.value = await readvegeAllData(selectedRoadStation.value)
  vegeAllData.value = filterDiscontinuedItems(vegeAllData.value)
  vegeKeys.value = Object.keys(vegeAllData.value)
  farmerVegeList.value = extractVegetableInfo(vegeAllData.value)
}

initData()

function pushDeleteIcon(vegeName: string) {
  deleteVegeName.value = vegeName
  isPopup.value = true
}

function pushDelete() {
  isPopup.value = false
  for (let i: number = 0; i < farmerVegeList.value[deleteVegeName.value].length; i++) {
    deleteVegeData(deleteVegeName.value, uniqueVegeList.value[deleteVegeName.value][i], selectedRoadStation.value)
  }

}

async function deleteVegeData(vege: string, uid: string, roadStation: string): Promise<void> {
  const db = getDatabase();
  const path = 'testVege/' + roadStation + "/" + vege + '/' + uid;
  // 更新するデータを指定
  const updates = {
    state: "Discontinued"
  };
  try {
    await update(fireRef(db, path), updates).then(() => {
      initData()
    })

  } catch (error) {
    console.error("Error removing data:", error);
  }
}

function pushBack() {
  isPopup.value = false
}

function pushExport() {
  const now = new Date()
  currentTime.value = now.toLocaleString()
  CSVfile.value = makeCsvData();
  exportToCSV(CSVfile.value, "vegeList_" + currentTime.value)
}

function makeCsvData() {
  // 結果を格納する配列
  const result: [string, string, number][] = [];

// データをループして抽出
  for (const vegetable in vegeAllData.value) {
    const entries = vegeAllData.value[vegetable];
    for (const key in entries) {
      const entry = entries[key];
      if (entry.farmer === currentUser.value?.displayName) {
        result.push([vegetable, entry.unit, entry.en]);
      }
    }
  }
  return result
}

function exportToCSV(data: any[], fileName: string) {
  const csvRows: string[] = [];

  // ヘッダーを追加
  const headers = ["野菜の名前", "unit", "money"];
  csvRows.push(headers.join(','));

  // データ行を追加
  for (const row of data) {
    const values = row.map((value: any) => {
      const escapeValue = String(value).replace(/"/g, '""');
      return `"${escapeValue}"`;
    });
    csvRows.push(values.join(','));
  }

  // CSV文字列を作成
  const csvString = csvRows.join('\n');

  // BOMを追加してCSVファイルを生成
  const bom = '\uFEFF'; // BOMを追加
  const blob = new Blob([bom + csvString], {type: 'text/csv;charset=utf-8;'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

</script>
<template>
  <!-- {{ vegeAllData }} -->
  <!-- {{ farmerVegeList }}
  {{uniqueVegeList}} -->
  <!-- {{ CSVfile }} -->
  <select class="form-select" aria-label="roadsideStationSelect" v-model="selectedRoadStation" @change="initData">
    <option selected v-bind:value="roadStation" v-for="roadStation in roadStationUnitTempList" :key=roadStation>
      {{ roadStation }}
    </option>
  </select>
  <h1 class="vege-title">現在注文可能な野菜のリスト</h1>
  <article v-if="!isActive">
    <div class="vegeList-group">
      <div v-for="element in vegeKeys" :key="element">
        {{ element }}
      </div>
    </div>
    <button v-on:click="pushActive" class="vegeList-button">編集する</button>
  </article>
  <article v-if="isActive">
    <p>ドラック＆ドロップで並べ替えができます</p>
    <div class="vegeList-group-active">
      <draggable v-model="vegeKeys" draggable=".vegeList-unit-active" item-key="id">
        <template #item="{ element }">
          <div class="vegeList-unit-active">
            <p>・{{ element }}</p>
            <div class="vegeList-unit-icon-active">
              <button v-on:click="pushDeleteIcon(element)"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
        </template>
      </draggable>

    </div>
    <button v-on:click="pushActive" class="vegeList-button">更新する</button>
    <button v-on:click="pushExport" class="vegeList-button">出力する</button>
  </article>
  <div v-if="excludedVegeList.length!=0">
    <h1>現在、在庫切れの野菜</h1>
    <div v-for="vegeName in excludedVegeList" :key="vegeName">
      {{ vegeName }}
    </div>
  </div>
  <div class="owner-popup" v-if="isPopup">
    <h3>{{ deleteVegeName }}は以下の{{
        farmerVegeList[deleteVegeName].length
      }}人が出品しています。本当に削除しますか？</h3>
    <div v-for="farmerName in farmerVegeList[deleteVegeName]" :key="farmerName">
      {{ farmerName }}
    </div>
    <button v-on:click="pushDelete()">削除する</button>
    <button v-on:click="pushBack()">戻る</button>
  </div>
</template>
<style>
.owner-popup {
  border-radius: 20px;
  border: 1px gray solid;
  z-index: 1;
  background-color: white;
  position: absolute;
  top: 30%;
  left: 30%;
  padding: 3%;
}

.owner-popup button {
  background-color: white;
  padding: 1%;
  margin: 1%;
}

.vege-title {
  margin-top: 20px;
}

.vegeList-group {
  margin: 10px;
  font-size: large
}

.vegeList-group-active {
  margin: 10px;
  font-size: large;
  width: 400px;
}

.vegeList-button {
  background-color: white;
  font-size: 1.2rem;
  padding: 5px;
  margin: 5px;
  border-radius: 10px;
}

.vegeList-unit-icon-active {
  display: flex;
  align-items: center;

}

.vegeList-unit-icon-active button {
  padding: 0;
  height: 100%;
  border: none;
  display: flex;
  background-color: white;
}

.vegeList-unit-active {
  display: flex;
  justify-content: space-between;
}
</style>