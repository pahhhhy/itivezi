<script setup lang="ts">


import {computed, onMounted, ref} from "vue";
import {getAdminUid} from "@/utils/database";
import router from "@/router";
import {useChatRoomStore} from "@/stores/chatRoom";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import type {User} from "firebase/auth";


interface Props {
  user: User
}

const {user} = defineProps<Props>()

const chatRoomStore = useChatRoomStore()
const adminUid = ref<string | null>(null)
const chatRoomHook = useChatRoomHook(user)

onMounted(async () => {
  adminUid.value = await getAdminUid()
})

const openDMWithAdmin = computed(() => {
  return async () => {
    if (chatRoomHook && adminUid.value) {
      const chatRoomIdWithAdmin = await chatRoomHook.checkDMRoomExists(adminUid.value)
      if (chatRoomIdWithAdmin) {
        chatRoomStore.setCurrentRoom(chatRoomIdWithAdmin)
        await router.push('/chat/' + chatRoomIdWithAdmin)
      } else {
        const createdChatRoomIdWithAdmin = await chatRoomHook.createDMRoom(adminUid.value)
        chatRoomStore.setCurrentRoom(createdChatRoomIdWithAdmin)
        await router.push('/chat/' + createdChatRoomIdWithAdmin)
      }
    }
  }
})
</script>
<template>
  <div v-if="chatRoomHook && adminUid && user.uid !== adminUid" class="open_dm_with_admin">
    <p>登録したい野菜が一覧に無い場合は管理者までご連絡ください。</p>
    <button @click="openDMWithAdmin">管理者とのチャット画面を開く</button>
  </div>
</template>
<style scoped>
.open_dm_with_admin {
  & > p {
    margin: 0;
  }

  & > button {
    margin: 0;
    padding: 0;
    color: #0056b3;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    text-decoration: underline;

    &:hover {
      color: #003366;
    }
  }
}
</style>