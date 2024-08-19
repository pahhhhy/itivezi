<script setup lang="ts">
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { ref,  onMounted } from 'vue'
import { getDatabase, ref as fireRef,  onValue } from 'firebase/database'

const currentUser = ref<User | null>(null)
const myRole = ref<string>('')

onMounted(async () => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    if (user != null && user.emailVerified) {
      currentUser.value = user
      try {
        const userData = await readUserData(currentUser.value!.uid)
        myRole.value = userData.role
        
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    } else {
      currentUser.value = null
    }
  })
})

async function readUserData(element: string): Promise<any> {
  const countRef = fireRef(getDatabase(), 'testUser/' + element)
  return new Promise((resolve, reject) => {
    onValue(
      countRef,
      (snapshot) => {
        resolve(snapshot.val())
      },
      (error) => {
        reject(error)
      }
    )
  })
}
</script>

<template>
  <h1>管理者画面</h1>
  <!-- 全員の注文履歴をみる
  現在の注文可能なリストをみる
  出品者のリストをみる
  購入者のリストをみる
  各データをみる（総利用者、注文数、生産者数、掲示板利用数、総購入金額、購入者数） -->
  <section v-if="myRole == '管理者'"></section>
  <section v-if="myRole != '管理者'">
    あなたを不正アクセス禁止法違反と器物損壊罪で訴えます！理由はもちろんお分かりですね？
    あなたがディレクトリトラバーサルを利用して、サーバー内の機密ファイルに不正アクセスしたからです！覚悟の準備をしておいてください。
    近いうちに訴えます。裁判も起こします。裁判所にも問答無用できてもらいます。
    慰謝料の準備もしておいてください！貴方は犯罪者です！
    刑務所にぶち込まれる楽しみにしておいてください！いいですね！
  </section>
</template>

<style></style>
