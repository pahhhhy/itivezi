<script setup lang="ts">

import {inject, ref} from "vue";
import type {ChatRoom} from "@/types/chat/chat";
import {useChatRoomHook} from "@/utils/chat/useChatRoomHook";
import type {User} from "firebase/auth";


interface Props {
  room: ChatRoom
  roomName: string
}

const {room, roomName} = defineProps<Props>();
const user = inject<User>('user')!;
;

const {updateRoomName} = useChatRoomHook(user);


const isEditMode = ref<boolean>(false);
const newRoomName = ref<string>('');

const editRoomName = async () => {
  let newRoomNameValue: string | null = newRoomName.value.trim();
  if (!newRoomNameValue) newRoomNameValue = null;
  await updateRoomName(room.roomId, newRoomNameValue);
  isEditMode.value = false;

}

</script>

<template>
  <div class="room-name">
    <div v-if="!isEditMode" class="room-name-display">
      <h1>{{ roomName }}</h1>
      <button class="edit-room-name-button" @click="isEditMode = true">
        <IconEdit/>
      </button>
    </div>
    <div v-else class="room-name-edit">
      <button @click="isEditMode = false;newRoomName = '';">
        <IconCancel/>
      </button>
      <input type="text" v-model="newRoomName" :placeholder="roomName"/>
      <button @click="editRoomName">
        <IconSave/>
      </button>
    </div>

  </div>
</template>

<style scoped>

.room-name {
  position: relative;
  width: fit-content;
  margin: 0 auto;
  overflow: visible;


  .room-name-display, .room-name-edit {
    display: flex;
    align-items: center;

  }

  .room-name-display {

    h1 {
      height: 100%;
      margin: 1rem 0;
      padding: 0;
      font-size: 1.25em;
      font-weight: normal;

    }

    /* roomNameの右に表示*/

    .edit-room-name-button {
      position: absolute;
      right: -12px;
      bottom: 0;
      transform: translateX(100%) translateY(-50%);
      border: none;
      background: none;
      cursor: pointer;
    }
  }

  .room-name-edit {
    input {
      height: 100%;
      margin: 1rem 0;
      font-size: 1.25em;
      width: 100%;
      padding: 0 0.5rem;
      border: none;
      border-bottom: 1px solid var(--text-color);

    }

    button {
      height: 100%;
      background-color: var(--background-color);
      border: none;
      cursor: pointer;

      & [disabled] {
        cursor: not-allowed;
      }
    }

  }

}


</style>