import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,push ,update,set} from 'firebase/database'
interface deletedata{
    uid:string|number,
    email:string
}
export const useDeleteUidStore = defineStore({
    id:"DeleteUid",
    state:(): { DeleteUid: string } =>{
        return{
            DeleteUid:""
        }
    },
    actions:{
        async roadData() {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), `deleteUidList/`)
              onValue(countRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                  this.DeleteUid = data; // 取得したデータをVegeAllDataにセット
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },
          async update(deletedata:deletedata): Promise<void> {
            const db = getDatabase();
            return new Promise((resolve, reject) => {
              push(fireRef(db, `deleteUidList/`), deletedata)
                .then(() => {
                  resolve(); // 成功した場合に resolve を呼び出す
                })
                .catch((error) => {
                  console.error("Error updating data:", error);
                  reject(error); // エラーが発生した場合は reject を呼び出す
                });
            });
          },
    }

})
