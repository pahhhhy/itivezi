import { defineStore } from 'pinia'
import {
    getAuth,
    onAuthStateChanged,
    type User
  } from 'firebase/auth'
export const useUserStore = defineStore({
    id:"currentUser",
    state:(): { currentUser: User|null } =>{
        return{
            currentUser:null
        }
    },
    actions:{
        async roadUserData() {
            return new Promise((resolve, reject) => {
              const auth = getAuth();
              onAuthStateChanged(auth, (user) => {
                if (user != null && user.emailVerified) {
                  this.currentUser = user;
                  resolve(user);  // ユーザー情報が取得できたらPromiseを解決
                } else {
                  this.currentUser = null;
                  reject(new Error("ユーザーデータがない"));  // エラー時にPromiseを拒否
                }
              });
            });
          }
    }

})