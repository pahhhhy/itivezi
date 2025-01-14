import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue,set,remove} from 'firebase/database'
interface AllUserTables{
  [uid:string]:Usertables
}
interface Usertables{
    affiliation:String[]
   
    name:string
    phoneNumber:number
    place:string
    role:Role
    email:string
}
enum Role{
    Onwer="管理者",
    Buyer="飲食店",
    Farmer="農家",
    None=""
  }
export const usefireUserStore = defineStore({
    id:"myUserData",
    state:(): { myUserData: Usertables } =>{
        return{
            myUserData:{affiliation: [],    
                name: "",         
                phoneNumber: 0,   
                place: "",        
                role: Role.None,
                email:"" }
        }
    },
    actions:{
        async roadFireUseData(uid:string) {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), 'testUser/'+uid)
              onValue(countRef, (snapshot) => {
                const data = snapshot.val()
                if (data) {
                  this.myUserData= data; 
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },async AllroadFireUseData():Promise<AllUserTables> {
            return new Promise((resolve, reject) => {
              const countRef = fireRef(getDatabase(), 'testUser/')
              onValue(countRef, (snapshot) => {
                const data:AllUserTables = snapshot.val()
                if (data) {
                  resolve(data)
                } else {
                  reject(new Error("データがありません"))
                }
              }, (error) => {
                reject(error)
              });
            });
          },async update(data: Usertables,uid:string): Promise<void> {
            const db = getDatabase();
            return new Promise((resolve, reject) => {
              set(fireRef(db, `testUser/${uid}`), data)
                .then(() => {
                  resolve(); // 成功した場合に resolve を呼び出す
                })
                .catch((error) => {
                  console.error("Error updating data:", error);
                  reject(error); // エラーが発生した場合は reject を呼び出す
                });
            });
          },async delete(uid:string|number): Promise<void> {
            const db = getDatabase();
            return new Promise((resolve, reject) => {
              remove(fireRef(db, `testUser/${uid}`))
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
