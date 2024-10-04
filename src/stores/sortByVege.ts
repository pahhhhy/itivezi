import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,set} from 'firebase/database'
enum SortMode{
    All="all",
    Kawasaki="川崎",
    Murone="室根",
    Other="その他"
}
export const useSortVegeStore = defineStore({
    id:"sortbyVege",
    state:(): { sortbyVege: string[] } =>{
        return{
            sortbyVege:[]
        }
    },
    actions:{
        async roadData(mode:SortMode) {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), `/sortByVege/${mode}`)
              onValue(countRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                  this.sortbyVege = data; // 取得したデータをVegeAllDataにセット
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },
          async update(data: string[], mode: SortMode): Promise<void> {
            const db = getDatabase();
            return new Promise((resolve, reject) => {
              set(fireRef(db, `sortByVege/${mode}`), data)
                .then(() => {
                  resolve(); // 成功した場合に resolve を呼び出す
                })
                .catch((error) => {
                  console.error("Error updating data:", error);
                  reject(error); // エラーが発生した場合は reject を呼び出す
                });
            });
          }
    }

})
