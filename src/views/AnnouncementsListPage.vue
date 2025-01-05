<script setup lang="ts">
import AnnouncementsList from '@/views/components/announcementPage/announcementsList/AnnouncementsList.vue'
import PostAnnouncementForm from '@/views/components/announcementPage/PostAnnouncementForm.vue'
import {ref} from 'vue'
import LoadingSpinner from "@/views/components/common/LoadingSpinner.vue";
import FloatingButton from "@/views/components/common/FloatingButton.vue";
import FloatingButtonWrapper from "@/views/components/common/FloatingButtonWrapper.vue";
import {useRouter} from "vue-router";
import SlideMenu from "@/views/components/common/SlideMenu.vue";
import SimpleTextButton from "@/views/components/common/SimpleTextButton.vue";
import {useAnnouncementsStore} from "@/stores/announcements";


interface Props {
  role: string
}
const {role} = defineProps<Props>()

const router = useRouter();

const announcementsStore = useAnnouncementsStore()


const post = async () => {
  await postAnnouncementFormRef.value!.post();
  alert('投稿しました。');
  isVisiblePostAnnouncementForm.value = false
}

const isVisiblePostAnnouncementForm = ref<boolean>(false);
const postAnnouncementFormRef = ref<null | InstanceType<typeof PostAnnouncementForm>>(null);

</script>
<template>
  <div class="announcements" v-if="announcementsStore.categories !== undefined">
    <SlideMenu title="投稿の作成" v-if="isVisiblePostAnnouncementForm" @close="isVisiblePostAnnouncementForm = false">
      <template #header-button>
        <SimpleTextButton
            bold fontSize="1.25em"
            :disabled="!postAnnouncementFormRef?.isValid"
            @click="post"
        >
          投稿
        </SimpleTextButton>
      </template>
      <template #default>
        <PostAnnouncementForm :editMode="false" ref="postAnnouncementFormRef"/>
      </template>
    </SlideMenu>

    <AnnouncementsList />

    <FloatingButtonWrapper>
      <FloatingButton @click="isVisiblePostAnnouncementForm = true" v-if="role === '管理者'">
        <IconBrush/>
      </FloatingButton>
      <FloatingButton @click="router.push('/chat')">
        <IconChat/>
      </FloatingButton>
    </FloatingButtonWrapper>
  </div>

  <LoadingSpinner v-else/>
</template>

<style scoped>
.announcements {
  display: flex;
  flex-direction: column;
  gap: 1em;
  background: var(--background-color);
  min-height: calc(100dvh - 80px);
}

</style>