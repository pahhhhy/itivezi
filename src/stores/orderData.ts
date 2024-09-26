import { defineStore } from 'pinia'
interface Vegetables{
    [vegeName:string]:{
        [uniqueKey:string]:{
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
export const useOrderDataStore = defineStore({
    id:"orderData",
    state:(): { orderData: Vegetables } =>{
        return{
            orderData:{}
        }
    },
    actions:{
        roadData(data:Vegetables) {
            this.orderData=data
        },
        resetData(){
            this.orderData={}
        },

    }

})
