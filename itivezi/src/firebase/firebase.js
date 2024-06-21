import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyBBV7mFElRfVl1UH2-eTKf0_T4wQDG1aIY',
  authDomain: 'itivezi-test.firebaseapp.com',
  projectId: 'itivezi-test',
  storageBucket: 'itivezi-test.appspot.com',
  messagingSenderId: '493574009593',
  appId: '1:493574009593:web:161b460a1136ff9111a828',
  measurementId: 'G-F6Z603BQKD'
}
console.log(firebaseConfig)
// firebaseConfigの値を元にfirebaseの初期化
const app = initializeApp(firebaseConfig)
// アナリティクスの初期化
getAnalytics(app)
