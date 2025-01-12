<script setup lang="ts">

import {ref} from "vue";
import {endAt, get, getDatabase, orderByChild, query, ref as fireRef, startAt} from 'firebase/database'
import {useUserDataStore} from "@/stores/userPublicData";

interface searchResultUsers {
  name: string
  id: string
  iconURL?: string
}

interface Emits {
  (event: 'close'): void

  (event: 'selectUser', userId: string): void
}

const emit = defineEmits<Emits>();


const input = ref<HTMLInputElement | null>(null);
const searchType = ref<"userName" | "userId">("userName");

const searchResult = ref<searchResultUsers[] | null>(null);
const {usersPublicData, getUserPublicData} = useUserDataStore()
const db = getDatabase()
const usersRef = fireRef(db, 'testUser/')


const searchUser = async () => {
  searchResult.value = null;
  if (!input.value) return;
  const searchWord = input.value.value;

  // firebaseのデータベースから検索
  // /testUser/<uid>/nameにユーザー名がある
  // /testUser/<uid>にユーザーidがある
  // 技術的に前方一致検索 uf8ffはUnicodeの最後の方の文字
  const q = query(usersRef, orderByChild('name'), startAt(searchWord), endAt(searchWord + '\uf8ff'));
  const snapshot = await get(q);

  if (snapshot.exists()) {
    const users = snapshot.val();
    searchResult.value = Object.keys(users).map((uid) => {
      getUserPublicData(uid);
      return {
        name: users[uid].name,
        id: uid,
        iconURL: users[uid].iconURL
      }
    });
  } else {
    searchResult.value = [];
  }
}

const selectUser = async (userId: string) => {
  emit('selectUser', userId);
  emit('close');
}

</script>

<template>
  <div class="input-field">
    <p><small>※大文字小文字を区別</small></p>
    <div>
      <label>ユーザー名</label>
    </div>
    <div>
      <input ref="input"/>
      <button @click="searchUser">検索</button>
    </div>
  </div>

  <p class="search-result">検索結果</p>
  <div class="search-result-wrapper">
    <p class="error-message" v-if="searchResult !== null && searchResult.length === 0">
      ユーザーが見つかりませんでした</p>
    <!--    -->
    <div class="search-result-card" v-for="user in searchResult" :key="user.id">
      <img v-if="usersPublicData[user.id]?.iconURL" :src="usersPublicData[user.id]?.iconURL" alt="No Image"/>
      <p>{{ user.name }}</p>
      <button @click="selectUser(user.id)">追加</button>
    </div>
  </div>


</template>

<style scoped>
.input-field {

  p {
    margin: 0;
  }

  input {
    margin: 0;
  }

  button {
    padding: 5px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;

    &:hover {
      background-color: #0056b3;
    }
  }
}


.search-result-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-result-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.search-result-card img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.search-result-card button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
}

.search-result-card button:hover {
  background-color: #0056b3;
}

.error-message {
  color: red;
}

.search-result {
  font-size: 1.5rem;
  margin-top: 20px;
}

input[type="radio"] {
  margin-right: 10px;
}

label {
  margin-right: 10px;
}

input {
  padding: 5px;
  margin-right: 10px;
}

</style>