import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue } from 'firebase/database'
interface Vegetables{
    [key:string]:{
        [key:string]:{
            en:string;
            farmer:string
            roadStation:string
            state:string
            uid:string
            unit:string
        }
    }
}
export const useVegeStore = defineStore({
    id:"VegeAllData",
    state:(): { VegeAllData: Vegetables } =>{
        return{
            VegeAllData:{}
        }
    },
    actions:{
        async roadData() {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), 'testVege2/')
              onValue(countRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                  this.VegeAllData = data; // 取得したデータをVegeAllDataにセット
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },
          getKeys(){
            return Object.keys(this.VegeAllData)
          }
    }

})
