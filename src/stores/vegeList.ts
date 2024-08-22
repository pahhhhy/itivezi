import { defineStore } from 'pinia'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { ref , computed, onMounted } from 'vue'
import { getDatabase, ref as fireRef, child, get, onValue, set, remove } from 'firebase/database'
//読みこむデータの指定
function readVegeKeysData(element: string) {
  const CountRef = fireRef(getDatabase(), 'testVege/' + element)
  const Data = ref<any>(null)
  onValue(CountRef, (snapshot) => {
    Data.value = snapshot.val()
  })
  return Object.keys(Data)
}
interface  State{
    vegeList:string[]
}
export const useVegeListStore = defineStore({
    id:"vegeList",
    state:(): State =>{
        return{
            vegeList:[]
        }
},
actions:{
    init():void{
        this.vegeList= readVegeKeysData("")
    },
    updateVegeList(element:string[]):void{
        this.vegeList=element
    }
}
})
