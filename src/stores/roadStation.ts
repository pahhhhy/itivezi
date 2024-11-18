import { defineStore } from 'pinia'
enum roadStationUnitTemp{
    Murone="室根",
    Kawasaki="川崎",
    other="その他"
  }
interface  State{
    roadStationTemp:string[]
}
export const useRoadStationStore = defineStore({
    id:"roadStation",
    state:(): State =>{
        return{
            roadStationTemp:Object.values(roadStationUnitTemp)
        }
},

})