<script lang="ts" setup>

import type { ChatMessage } from '@/types/chat/chat'

const {message} = defineProps<{
  message: ChatMessage,
}>()

</script>
<template>
  <div class="message-attached" v-if="message.attachedFiles">
    <div v-for="file in message.attachedFiles" :key="file.fileId">
      <div class="message-attached-image" v-if="file.fileType === 'image'">
        <img :src="file.fileUrl" alt="attached file" />
        <a :href="file.fileUrl" target="_blank"></a>
      </div>
      <div v-else-if="file.fileType === 'video'" class="message-attached-video">
        <video :src="file.fileUrl" controls></video>
        <p>{{ file.fileName }}</p>
      </div>
      <div v-else-if="file.fileType === 'audio'" class="message-attached-audio">
        <audio :src="file.fileUrl" controls></audio>
        <p>{{ file.fileName }}</p>
      </div>
      <div v-else class="message-attached-file">
        <IconFile />
        <a :href="file.fileUrl" target="_blank">{{ file.fileName }}</a>
      </div>
    </div>
  </div>
</template>
<style scoped>
p {
  margin: 0;
}

.message-icon img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.message-header div {
  margin-left: 10px;
}

.message-attached {
  img {
    max-width: 256px;
  }

  &:has(.message-attached-audio), &:has(.message-attached-video) {
    padding: 10px;
  }

  .message-attached-image {
    position: relative;
    width: min-content;
    height: fit-content;

    a {
      position: absolute;
      display: block;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;

    }
  }
  .message-attached-video {
    video {
      max-width: 256px;
    }
  }
  .message-attached-file {
    position: relative;
    height: 64px;
    width: fit-content;

    svg {
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%);
    }

    a {
      position: relative;
      z-index: 1;
      display: grid;
      place-content: center;
      padding: 0 20px 0 48px;
      height: 100%;
      width: fit-content;
      text-decoration: none;
      text-align: center;
      color: var(--text-color);
    }

  }
}

</style>