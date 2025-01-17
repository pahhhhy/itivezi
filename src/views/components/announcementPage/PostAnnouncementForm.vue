<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {getDatabase, ref as fireRef, serverTimestamp} from "firebase/database";
import {useAuthData} from "@/utils/auth";
import {postAnnouncement} from "@/utils/announcement/announcements";
import {useAnnouncementFiles} from "@/utils/announcement/useAnnouncementFilesHook";
import CategorySelector from "@/views/components/announcementPage/CategorySelector.vue";
import {useAnnouncementsStore} from "@/stores/announcements";


const announcementFilesHook = useAnnouncementFiles()

// editModeがtrueのときはtitleとcontentも要求する
interface PropsWithEditMode {
  editMode: true;
  modelValueTitle: string;
  modelValueContent: string;
  modelValueCategoryId: string;
}

interface PropsWithoutEditMode {
  editMode: false | undefined;
  modelValueTitle?: undefined;
  modelValueContent?: undefined;
  modelValueCategoryId?: undefined;
}

type Props = PropsWithEditMode | PropsWithoutEditMode;
const props = defineProps<Props>();

interface Emits {
  (event: "update:modelValueTitle", value: string): void;

  (event: "update:modelValueContent", value: string): void;

  (event: "update:modelValueCategoryId", value: string): void;
}

const emit = defineEmits<Emits>();

const title = ref(props.editMode ? props.modelValueTitle : "");
const content = ref(props.editMode ? props.modelValueContent : "");
const categoryId = ref(props.editMode ? props.modelValueCategoryId : "");


onMounted(() => {
  if (props.editMode) {
    watch(() => [props.modelValueTitle, props.modelValueContent, props.modelValueCategoryId], () => {
      title.value = props.modelValueTitle!;
      content.value = props.modelValueContent!;
      categoryId.value = props.modelValueCategoryId!;
    })
    watch([title, content, categoryId], () => {
      emit("update:modelValueTitle", title.value);
      emit("update:modelValueContent", content.value);
      emit("update:modelValueCategoryId", categoryId.value);

    });
    validate()
  }
})
// 投稿者uid添付や投稿権限確認に使う変数
const {user, role} = useAuthData();

// categorySelectorを開いているか
const isOpenCategorySelector = ref<boolean>(false)

const announcementsStore = useAnnouncementsStore()
const isValid = ref<boolean>(false);
const announcementRootRef = fireRef(getDatabase(), 'Announcements') // 投稿のリファレンス

// 投稿を投稿する処理
async function post() {
  const pushData = {
    title: title.value,
    content: content.value,
    createdAt: serverTimestamp(),
    userId: user.value?.uid ?? '',
    categoryId: categoryId.value,
    comments: [],
  }

  const {deleteFiles} = announcementFilesHook.splitFiles(announcementFilesHook.files.value, content.value)
  announcementFilesHook.deleteImgFromStorage(deleteFiles)

  await postAnnouncement(announcementRootRef, pushData)
  content.value = ''
}

const validate = () => {
  isValid.value = !!title.value && !!content.value && !!categoryId.value;
}

watch([title, content, categoryId], validate);

defineExpose({ // 外部から参照できるようにする
  post,
  isValid,
})


</script>
<template>
  <div class="post-announcement-form">
    <div class="category">
      <p v-if="categoryId" class="label">カテゴリー</p>
      <button @click="isOpenCategorySelector = true">
        <span v-if="categoryId">{{
            announcementsStore.categories.find(category => category.categoryId === categoryId)?.categoryName
          }}</span>
        <span v-else style="color: gray;">カテゴリーを選択</span>

        <IconRightArrow/>
      </button>
      <CategorySelector v-if="isOpenCategorySelector" :role="role!"
                        @select="categoryId = $event.categoryId" @close="isOpenCategorySelector = false"/>
    </div>
    <div class="announce-editor">
      <div class="title">

        <p v-if="title" class="label">件名</p>
        <input id="title" type="text" required v-model="title" placeholder="件名"/>
      </div>
      <mavon-editor
          ref="mavonEditorRef"
          language="ja" placeholder="ここにテキストを入力..." v-model="content"
          @imgAdd="announcementFilesHook.imgAdd"
          :box-shadow="false"
      />

    </div>
  </div>
</template>
<!--suppress CssUnusedSymbol markdown-bodyに反応するため無効化 -->
<style scoped>
.post-announcement-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: min(var(--breakpoint), 100vw);
  margin: 0 auto;
  max-height: calc(100% + 80px); /* スクロールしてエディターが全体になる高さ */
  .label {
    font-size: .75em;
    margin: 0 0 -0.75em 1.5em;
    color: gray;
  }


  .category {
    width: 100%;
    margin: 1rem 0;

    button {
      width: 100%;
      padding: 0.5em;
      margin: 0 0.5em;
      font-size: 1.25em;
      background: none;
      border: none;
      border-bottom: 1px solid var(--text-color);
      display: flex;
      justify-content: space-between;
    }

    /* inputもbuttonと同様のスタイル */
  }

  input {
    width: 100%;
    padding: 0.5em;
    margin: 0 0.5rem 2rem;
    font-size: 1.25em;
    height: 48px;
    background: none;
    border: none;
    border-bottom: 1px solid gray;
    transition: font-size 0.2s;

    &:focus {
      font-size: 1.3em;
      outline: none;
      border-bottom: 1px solid var(--text-color);
    }

  }

  .announce-editor {
    max-height: 100%;
    display: flex;
    flex-direction: column;

    .title {
      p {
        text-align: left;
      }
      height: fit-content;
      flex-grow: 0;
    }

    .mavon-editor {
      flex-grow: 1;
    }
  }

}


.markdown-body { /* mavon-editor内のクラス */
  z-index: 0 !important;
  border: 1px solid var(--text-color);
}
</style>
