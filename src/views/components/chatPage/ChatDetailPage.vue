<script lang="ts" setup>
import {onMounted, provide, ref} from 'vue'
import {useChatMessageHook} from '@/utils/chat/useChatMessageHook'
import type {User} from 'firebase/auth'
import {useUserDataStore} from '@/stores/userPublicData'
import {RouterLink} from 'vue-router'
import {useChatRoomStore} from '@/stores/chatRoom'
import ChatInputArea from '@/views/components/chatPage/ChatInputArea.vue'
import {collectRoomName} from '@/utils/chat/chat'
import SlideMenu from '@/views/components/common/SlideMenu.vue'
import UserSearcher from "@/views/components/chatPage/UserSearcher.vue";
import Settings from "@/views/components/chatPage/ChatRoomSettings.vue";
import ChatViewPort from "@/views/components/chatPage/ChatViewPort.vue";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import {storeToRefs} from "pinia";

const {user} = defineProps<{
  user: User
}>()
const userid = ref<string>(user.uid)
// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData} = useUserDataStore()
const chatRoomStore = useChatRoomStore()
const {updateChatRoomData} = chatRoomStore;
const {currentRoom} = storeToRefs(chatRoomStore);
const roomId = currentRoom.value!.roomId || ''
const {getJoinedRooms, addUserToChatRoom} = useChatRoomHook(user);
provide('user', user)
provide('roomId', roomId)
provide('roomName', currentRoom.value?.roomName || '')

const chatMessageHook = useChatMessageHook(
    roomId,
    user,
    (data) => {
      // onMessageUpdatedのコールバック
      // dataは{messageId: ChatMessage}の形式

      const allMessageSenders = Object.values(data).map((message) => message.senderUid)
      const uniqueMessageSenders = Array.from(new Set(allMessageSenders))
      uniqueMessageSenders.forEach((uid: string) => {
        getUserPublicData(uid)
      })

      checkUpdateLastReadAt() // ChatDetailPageからのみ呼び出すことで表示されていることが保証される
    }
)
const {checkUpdateLastReadAt} = chatMessageHook;
const roomName = ref<string>("");
const isThereUnReadMessage = ref(false) // スクロール中に新しいメッセージが追加されてかつまだ表示されていないかどうかを格納するref
const isVisibleMenu = ref(false);
const isVisibleAddUserMenu = ref(false);
const addUserSlideMenu = ref<null | InstanceType<typeof SlideMenu>>(null);
const menuSlideMenu = ref<null | InstanceType<typeof SlideMenu>>(null);
const chatRoomViewport = ref<null | InstanceType<typeof ChatViewPort>>(null);
const setIsThereUnReadMessage = (value: boolean) => {
  isThereUnReadMessage.value = value
}

onMounted(() => {
  if (currentRoom) {
    collectRoomName(currentRoom.value!, userid.value).then((name) => {
      roomName.value = name;
    });
  }

  // ルーム名の変更を監視
  getJoinedRooms(async (rooms) => {
    const updatedRoom = rooms.find(room => room.roomId === roomId)
    if (updatedRoom) {
      updateChatRoomData(updatedRoom)
      roomName.value = await collectRoomName(updatedRoom, userid.value)
    }
  })
})


</script>

<template>
  <div v-if="currentRoom" class="chatroom-wrapper">
    <!--    ユーザー追加のサイドメニュー-->
    <SlideMenu v-if="isVisibleAddUserMenu" ref="addUserSlideMenu" title="ユーザー追加"
               @close="() => isVisibleAddUserMenu = false">
      <UserSearcher @close="addUserSlideMenu?.close()"
                    @selectUser="async userId => await addUserToChatRoom(roomId, userId)"/>
    </SlideMenu>
    <SlideMenu v-if="isVisibleMenu" ref="menuSlideMenu" title="設定" @close="() => isVisibleMenu = false">
      <Settings :room="currentRoom" :roomName="roomName" :user="user"/>
    </SlideMenu>


    <!--    ヘッダー-->
    <div class="room-header">
      <!--      戻るボタン-->
      <p>
        <router-link to="/chat">
          <IconLeftArrow color="black"/>
        </router-link>
        {{ roomName }}
      </p>
      <!--      右のボタン2つ-->
      <div>
        <!--        ユーザー追加ボタン-->
        <button @click="isVisibleAddUserMenu = true">
          <IconAddUser/>
        </button>
        <!--        三点リーダー-->
        <button @click="isVisibleMenu = true">
          <IconEllipse/>
        </button>
      </div>
    </div>

    <ChatViewPort
        ref="chatRoomViewport"
        :chatMessageHook="chatMessageHook"
        :setIsThereUnReadMessage="setIsThereUnReadMessage"
        :userid="userid"
        @reachedBottom="setIsThereUnReadMessage(false)"
    />


    <p v-if="isThereUnReadMessage" class="unReadNotice" @click="chatRoomViewport?.scrollToBottom">
      新着メッセージがあります
    </p>
    <ChatInputArea
        :afterSendMessage="() => {
          chatRoomViewport?.scrollToBottom();
          setIsThereUnReadMessage(false);
        }"
        :beforeSendMessage="chatRoomViewport?.scrollToBottom"
        :roomId="roomId"
        :user="user"
        class="input-area"
    />
  </div>
</template>

<style scoped>
p {
  margin: 0;
}

.chatroom-wrapper {
  height: calc(100dvh - 80px); /* ヘッダーの高さ*/
  width: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;

  justify-content: space-between;
}

.room-header {
  font-size: 1.8em;
  font-weight: bold;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: gray 1px solid;

  button {
    border: none;
    background: none;
  }
}


.input-area {
  height: fit-content;
  max-height: 50%;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  border-top: gray 1px solid;
}

.unReadNotice {
  padding: 5px;
  cursor: pointer;
  text-align: right;
  color: gray;
  background: var(--background-color);
}
</style>
