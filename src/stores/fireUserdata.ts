import { defineStore } from 'pinia'
import { getDatabase, ref as fireRef,  onValue} from 'firebase/database'
interface Usertables{
    affiliation:String[]
    gender:string
    name:string
    phoneNumber:number
    place:string
    role:Role
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
                gender: "",       
                name: "",         
                phoneNumber: 0,   
                place: "",        
                role: Role.None }
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
          },
    }

})
