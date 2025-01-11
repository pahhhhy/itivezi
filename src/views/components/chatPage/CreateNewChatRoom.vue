<script setup lang="ts">
import UserSearcher from "@/views/components/chatPage/UserSearcher.vue";
import type {User} from "firebase/auth";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import {useRouter} from "vue-router";


interface Props {
  user: User
}
const {user} = defineProps<Props>();
interface Emits {
  (event: 'close'): void
}
const emit = defineEmits<Emits>();

const {createDMRoom} = useChatRoomHook(user);
const router = useRouter();

const create = async (userId: string) => {
  const createdRoomId = await createDMRoom(userId);
  if (createdRoomId) {
    emit('close');
    await router.push('/chat/'+createdRoomId); // 作成したチャットルームへ遷移
  }
}


</script>

<template>
  <div class="room-user">
    <p>最初にチャットする人を追加してください。<br>複数人でチャットする場合は、作成後にユーザーを追加してください。</p>

    <UserSearcher @selectUser="create"/>
  </div>
</template>

<style scoped>

.room-user {
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: min(var(--breakpoint), 100vw);
  height: fit-content;
  padding: 0 2rem;
}

</style>