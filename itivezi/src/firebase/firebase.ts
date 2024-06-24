import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
const firebaseConfig = {
  apiKey: 'AIzaSyARYmwkEzz0WY6LCzToU0t9Kb2uXirbfVI',
  authDomain: 'blaze-lab-75c62.firebaseapp.com',
  databaseURL: 'https://blaze-lab-75c62-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'blaze-lab-75c62',
  storageBucket: 'blaze-lab-75c62.appspot.com',
  messagingSenderId: '13282407977',
  appId: '1:13282407977:web:1eafa1878605cebbab8e38',
  measurementId: 'G-YF1LT22NK7'
}
console.log(firebaseConfig)
// firebaseConfigの値を元にfirebaseの初期化
const app = initializeApp(firebaseConfig)
// アナリティクスの初期化
getAnalytics(app)
// Realtime Database の参照を取得
const database = getDatabase(app)

export { database }
