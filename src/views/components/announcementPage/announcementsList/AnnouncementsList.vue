<script setup lang="ts">
import {ref} from 'vue'
import {
  child,
  equalTo,
  get,
  getDatabase,
  limitToLast,
  onValue,
  orderByChild,
  query,
  ref as fireRef
} from 'firebase/database'
import AnnouncementsListElement
  from '@/views/components/announcementPage/announcementsList/AnnouncementsListElement.vue'
import type {CategorizedAnnouncements, Category} from '@/types/announcement/categories'
import {categorizeAnnouncements} from '@/utils/announcement/announcementCategories'

interface CategoryProp {
  announces: {
    [key: string]: any;
  };

  [key: string]: any;
}

interface Props {
  categories: CategoryProp
}

const {categories} = defineProps<Props>()

const db = getDatabase()
// お知らせのリファレンス
const announcementRootRef = fireRef(db, 'testAnnouncements')
const announcementsRef = child(announcementRootRef, 'announcements')
// 取得したお知らせ一覧
const announcements = ref()
const nestedAnnouncements = ref<CategorizedAnnouncements>({})


// お知らせの最新一件は監視をしておき、それ以外については最初に1度だけ40件取得しておく。加えて、categoriesの中身をカテゴリごとに5件ずつ、timestampの降順で取得する。
const q1 = query(announcementsRef, orderByChild('createdAt'), limitToLast(1))
onValue(q1, (snapshot) => {
  if (!snapshot.exists()) {
    return
  }

  announcements.value = Object.values(snapshot.val())

  nestedAnnouncements.value = categorizeAnnouncements(
      Object.values(categories),
      Object.values(snapshot.val())
  )
})

const q2 = query(announcementsRef, orderByChild('createdAt'), limitToLast(40))
get(q2).then((snapshot) => {
  if (!snapshot.exists()) {
    return
  }

  announcements.value = Object.values(snapshot.val())
}).then(() => { // 各categoriesのannouncements上位5件に含まれるidを持つお知らせで、上の処理で取ってこれなかったものを別途取得する
  const categoryAnnouncements = Object.values(categories).map((category) => {
    // categoryのannounceをtimestampで並び替えた後, 上位5件のidを取得(ローカル)
    // cannot convert undefined or null to object
    // 修正: category.announcesがundefinedの場合は空の配列を返すように修正
    return Object.values(category.announces ?? {}).sort((a: any, b: any) => b.createdAt - a.createdAt).slice(0, 5).map((announce: any) => announce.announceId)
  })

  // 不足しているお知らせ
  const missingAnnouncements = Object.values(categoryAnnouncements).flat().filter((announceId) => !Object.keys(nestedAnnouncements.value).includes(announceId))
  if (missingAnnouncements.length !== 0) {

    // あるなら取得して追加
    missingAnnouncements.forEach((announceId) => {
      const q = query(announcementsRef, orderByChild('announceId'), equalTo(announceId))
      onValue(q, (snapshot) => {
        if (!snapshot.exists()) {
          return
        }

        const announce = snapshot.val()
        const categoryName = Object.keys(categories).find((categoryName) =>
            Object.keys((categories as { [key: string]: CategoryProp })[categoryName].announces).includes(announceId)) ?? ''
        nestedAnnouncements.value[categoryName] = {
          ...nestedAnnouncements.value[categoryName],
          [announceId]: announce
        }
      }, {onlyOnce: true})

    })

  }
})

</script>
<template>
  <div v-if="announcements" class="categories-wrapper">
    <!--      属している記事が一つもないカテゴリは表示しない-->
    <!--    最近の記事-->
    <!--    TODO: DBでカテゴリごとに記事を格納する、addCategoryで更新処理を行い, 取得できるようにする-->
    <h6>最近のお知らせ</h6>

<!--    カテゴリの機能が正しく動作しているかを示すテスト-->
<!--    categoriesをjsonのように見やすく出力-->
    <pre>{{ JSON.stringify(categories, null, 2) }}</pre>


    <AnnouncementsListElement
        v-for="announce in announcements"
        :key="announce.announceId"
        :announce="announce"
        :category-name="
        Object.keys(nestedAnnouncements).find((categoryName) =>
          Object.keys(nestedAnnouncements[categoryName]).includes(announce.announceId)
        ) ?? ''
      "
    />
    <div
        v-for="categoryNames in Object.keys(nestedAnnouncements).filter(
        (categoryName) => Object.keys(nestedAnnouncements[categoryName]).length > 0
      )"
        :key="categoryNames"
    >
      <p>{{ categories }}</p>
      <h6>{{ categoryNames }}</h6>
      <AnnouncementsListElement
          v-for="announce in nestedAnnouncements[categoryNames]"
          :key="announce.announceId"
          :announce="announce"
          :category-name="categoryNames"
      />
    </div>
  </div>
  <p v-else>お知らせがありません。</p>
</template>

<style scoped>
.categories-wrapper {
  margin: 30px;
}

h6 {
  margin: 10px 0 4px;
  padding: 5px 48px 5px 10px;
  color: #434343;
  border-bottom: 1px solid currentColor;
  width: calc(100% - 12px);
  position: relative;
  word-break: break-all;
}

h6::after {
  content: '>';
  position: absolute;
  height: 24px;
  right: 12px;
  top: 50%;
  font-size: 24px;
  line-height: 0;
}
</style>