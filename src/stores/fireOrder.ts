import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,push } from 'firebase/database'
enum VegeState{
  Discontinued="Discontinued",
  Available="Available"
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
    roadStation:string
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
}
export const useFireOrderStore = defineStore({
    id:"OrderAllData",
    state:(): { OrderAllData: Ordertables } =>{
        return{
            OrderAllData:{}
        }
    },
    actions:{
        async roadData() {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), `Orders/`)
              onValue(countRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                  this.OrderAllData = data; // 取得したデータをVegeAllDataにセット
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },
          async updateCartData(data: OrdertablesElement,uid:string ): Promise<boolean> {
            const db = getDatabase();
            try {
              await push(fireRef(db, `Orders/${uid}`), data);
              return true; // 成功したら true を返す
            } catch (error) {
              console.error('Error updating data:', error);
              return false; // エラーが発生したら false を返す
            }
          },
    }

})
