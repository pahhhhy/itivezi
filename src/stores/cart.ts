import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,push ,set} from 'firebase/database'
interface CartTables{
    [uid:string]:{
         [uniqueKey: string]:CartElementTables;
        
    }
}
interface CartElementTables{
    en:number;
    farmer:string
    roadStation:string
    unit:string
    photo:string
    unique:string
    vegeName:string
    amount:number
}
export const useCartStore = defineStore({
    id:"cartData",
    state:(): { cartData: CartTables} =>{
        return{
            cartData:{}
        }
    },
    actions:{
        async roadData() {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), 'orderCart/')
              onValue(countRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                  this.cartData = data; 
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },
          async updateCartData(data: CartElementTables, uid: string): Promise<boolean> {
            const db = getDatabase();
            try {
              await push(fireRef(db, 'orderCart/' + uid), data);
              return true; // 成功したら true を返す
            } catch (error) {
              console.error('Error updating data:', error);
              return false; // エラーが発生したら false を返す
            }
          },
          getCountCart(uid:string){
            if(this.cartData[uid]!=undefined){
              return Object.keys(this.cartData[uid]).length
            }else{
              return 0
            }
            
          },
          async resetCartData(uid: string){
            const db = getDatabase();
            try {
              await set(fireRef(db, 'orderCart/' + uid), {});
              return true; // 成功したら true を返す
            } catch (error) {
              console.error('Error updating data:', error);
              return false; // エラーが発生したら false を返す
            }
          },
          async deleteCartData(uid: string,uniqueKey:string){
            const db = getDatabase();
            try {
              await set(fireRef(db, `orderCart/${uid}/${uniqueKey}`), {});
              return true; // 成功したら true を返す
            } catch (error) {
              console.error('Error updating data:', error);
              return false; // エラーが発生したら false を返す
            }
          }
    }

})
