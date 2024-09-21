import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,push ,set} from 'firebase/database'
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
          },
          getUniqueKey(){
            const db = getDatabase();
            const newRef = fireRef(db, 'testVege2/');
            const uniqueKey = push(newRef).key;
            return uniqueKey
          },
          updateVegeData(data: Vegetables): Promise<boolean> {
            const db = getDatabase();
            const vegeKeys = Object.keys(data);
          
            // 全ての更新処理をPromiseの配列で管理
            const updatePromises: Promise<void>[] = [];
          
            vegeKeys.forEach((vegeKey) => {
              const uniqueKeys = Object.keys(data[vegeKey]);
          
              uniqueKeys.forEach((uniqueKey) => {
                const updatePromise = set(
                  fireRef(db, `testVege2/${vegeKey}/${uniqueKey}`), 
                  data[vegeKey][uniqueKey]
                );
                updatePromises.push(updatePromise);
              });
            });
          
            // 全てのPromiseが完了するのを待つ
            return Promise.all(updatePromises)
              .then(() => true) // 全て成功
              .catch(() => false); // どこかで失敗
          }
    }

})
