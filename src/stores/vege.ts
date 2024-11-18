import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,push ,set,update,get} from 'firebase/database'
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
          },
          async deleteVegeData(vegeName:string,unique:string|number){
            const db = getDatabase();
            const path = `testVege2/${vegeName}/${unique}`
            // 更新するデータを指定
            const updates = {
              state: "Discontinued"
            };
            try {
              await update(fireRef(db, path), updates).then(() => {
              })
              
            } catch (error) {
              console.error("Error removing data:", error);
            }
          },
          async deleteAllVegeData(vegeName: string) {
            const db = getDatabase();
            const path = `testVege2/${vegeName}`;
            
            try {
              // まず、指定された vegeName に対応するすべての uniqueKey を取得する
              const vegeSnapshot = await get(fireRef(db, path));
              if (!vegeSnapshot.exists()) {
                console.error("No data found for the specified vegeName.");
                return;
              }
          
              // 取得したデータの中から uniqueKey をリストアップして state を "Discontinued" にする
              const updates: any = {};
              vegeSnapshot.forEach((childSnapshot) => {
                const uniqueKey = childSnapshot.key;
                if (uniqueKey) {
                  updates[`${path}/${uniqueKey}/state`] = "Discontinued";
                }
              });
          
              // 更新処理
              await update(fireRef(db), updates);
              console.log("All state values set to Discontinued.");
              
            } catch (error) {
              console.error("Error updating data:", error);
            }
          }
    }

})
