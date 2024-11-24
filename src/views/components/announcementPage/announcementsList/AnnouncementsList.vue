<script setup lang="ts">
import {ref} from 'vue'
import {child, get, getDatabase, limitToLast, onValue, orderByChild, query, ref as fireRef} from 'firebase/database'
import AnnouncementsListElement
  from '@/views/components/announcementPage/announcementsList/AnnouncementsListElement.vue'
import type {CategorizedAnnouncements, Category} from '@/types/announcement/categories'
import {categorizeAnnouncements} from '@/utils/announcement/announcementCategories'
import type {Announcement} from '@/types/announcement/announcement'
import {useUserDataStore} from "@/stores/userPublicData";
import type {UserPublicData} from "@/types/common/userPublicData";

interface CategoryProp {
  announces: {
    [key: string]: number // 投稿のid: timestamp
  }

  [key: string]: any
}

interface Props {
  categories: Category
}

const {categories} = defineProps<Props>()

const db = getDatabase()
// 投稿のリファレンス
const announcementRootRef = fireRef(db, 'testAnnouncements')
const announcementsRef = child(announcementRootRef, 'announcements')
// 取得した投稿一覧
const announcements = ref()
const nestedAnnouncements = ref<CategorizedAnnouncements>({})

// すべての最近の投稿として取得する投稿の数を指定する定数 (なるべくget数を減らすため最初に一定数取得しておく)
const recentAnnounceCount = 20
// 各カテゴリごとに取得する投稿の数を指定する定数
const categoryAnnounceCount = 5

// piniaのuseUserStoreから登場ユーザーをすべて取得
const {getUserPublicData} = useUserDataStore();
const usersPublicData = ref<Record<string, UserPublicData> | undefined>(undefined); // ChatDetailPageに似た実装
// データを取得するたびに実行され、userPublicDataに含まれていないユーザーがある場合はgetUserPublicDataに通してuserPublicDataにデータを格納する関数
const fetchUsersPublicData = async (userId: string) => {
  if (!usersPublicData.value) {
    usersPublicData.value = {}
  }

  if (!usersPublicData.value[userId]) { // まだ取得したことのないユーザーだったなら追加しておく
    const userData = await getUserPublicData(userId)
    if (userData) {
      usersPublicData.value[userId] = userData
    }
  }
}


// 投稿の最新一件は監視をしておき、それ以外については最初に1度だけrecentAnnounceCount件取得しておく。加えて、categoriesの中身をカテゴリごとにcategoryAnnounceCount件ずつ、timestampの降順で取得する。
const q1 = query(announcementsRef, orderByChild('createdAt'), limitToLast(1))
onValue(q1, (snapshot) => {
  if (!snapshot.exists()) {
    return
  }

  // 既存の内容が更新されたら更新, 新規の内容だったら追加
  const newAnnouncements = Object.values(snapshot.val())

  if (announcements.value) {
    newAnnouncements.forEach((newAnnounce) => {
      const typedAnnounce = newAnnounce as Announcement;
      const index = announcements.value.findIndex((announce: Announcement) => announce.announceId === typedAnnounce.announceId);
      if (index !== -1) {
        announcements.value[index] = typedAnnounce;
      } else {
        announcements.value.push(typedAnnounce);
      }

      // 更新段階でも投稿者のユーザーデータを取得しておく
      fetchUsersPublicData(typedAnnounce.userId)

    });
    nestedAnnouncements.value = categorizeAnnouncements(Object.values(categories), announcements.value)

  }

})

const q2 = query(announcementsRef, orderByChild('createdAt'), limitToLast(recentAnnounceCount))
get(q2)
    .then((snapshot) => { // 最初にrecentAnnounceCount件取得しておく処理
      if (!snapshot.exists()) {
        return
      }
      // ここでのsnapshotは[id: string]: Announcementの形
      announcements.value = Object.values(snapshot.val()) as unknown as Announcement // 投稿の一覧を取得
      // この段階でnestedAnnouncementsにも入れておく
      nestedAnnouncements.value = categorizeAnnouncements(Object.values(categories), announcements.value)
    })
    .then(() => { // ここからは各categoriesのannouncements上位categoryAnnounceCount件に含まれるidを持つ投稿で、上の処理で取ってこれなかったものを別途取得する処理
      // まずはカテゴリごとに上位categoryAnnounceCount件の投稿を取得、一つの配列にまとめる
      const topAnnouncementsForEachCategory = Object.values(categories).map((category): string[] => {
        const announcesEachCategory: { [id: string]: number } = category.announces // 投稿のid: timestampの形
        // timestampの降順でソートし、上位categoryAnnounceCount件のidを配列で返す
        if (!announcesEachCategory) {
          return []
        }
        return Object.keys(announcesEachCategory)
            .sort((a, b) => announcesEachCategory[b] - announcesEachCategory[a])
            .slice(0, categoryAnnounceCount) // 配列の先頭からcategoryAnnounceCount件取得
      }).flat()

      // このcategoryAnnouncementsとnestedAnnouncementsの中身を比較して、先ほど取得したannouncementsに含まれていない投稿を調べる
      const missingAnnouncements = topAnnouncementsForEachCategory.filter((announceId) => {
        return !announcements.value.some((announce: Announcement) => announce.announceId === announceId) // 投稿のidが一致するものがannouncementsに一つもないならfilterで残す
      })

      if (missingAnnouncements.length !== 0) { // そしてあるならば
        missingAnnouncements.forEach((announceId) => { // それぞれの投稿を取得してnestedAnnouncementsに追加
          get(child(announcementsRef, announceId)).then((snapshot) => { // 非同期で取得をかけておく
                if (!snapshot.exists()) {
                  return
                }


                const newAnnounce = snapshot.val() as Announcement
                announcements.value.push(newAnnounce)
                nestedAnnouncements.value = categorizeAnnouncements(
                    Object.values(categories),
                    announcements.value
                )


              }
          )

        })
      }
    })
    .then(() => { // 最後にこれまで取得した投稿に含まれるすべての投稿者のユーザーデータを取得しておく処理
      if (announcements.value) {
        announcements.value.forEach((announce: Announcement) => {
          if (!announce.userId || usersPublicData.value?.[announce.userId]) { // すでに取得済みのユーザーだったらスキップ
            return
          }
          fetchUsersPublicData(announce.userId)
        })
      }
    })


</script>
<template>
  <div v-if="announcements && usersPublicData" class="announcements-list-wrapper">
    <!--    TODO: DBでカテゴリごとに投稿を格納する、addCategoryで更新処理を行い, 取得できるようにする-->
    <div class="category-wrapper">
      <h6>最近の投稿</h6>
      <AnnouncementsListElement
          v-for="announce in announcements"
          :key="announce.announceId"
          :announce="announce"
          :category-name="
        Object.keys(nestedAnnouncements).find((categoryName) =>
          Object.keys(nestedAnnouncements[categoryName]).includes(announce.announceId)
        ) ?? ''
      "
          :author-display-name="usersPublicData[announce.userId]?.userName ?? '不明なユーザー'"
      />
    </div>

    <!--      属している投稿が一つもないカテゴリは表示しない-->
    <!--    カテゴリごと-->
    <div
        v-for="categoryNames in Object.keys(nestedAnnouncements).filter(
        (categoryName) => Object.keys(nestedAnnouncements[categoryName]).length > 0
      )"
        :key="categoryNames"
        class="category-wrapper"
    >
      <h6>{{ categoryNames == "" ? "新しいカテゴリー" : categoryNames }}</h6>
      <AnnouncementsListElement
          v-for="announce in nestedAnnouncements[categoryNames]"
          :key="announce.announceId"
          :announce="announce"
          :category-name="categoryNames"
          :author-display-name="usersPublicData[announce.userId]?.userName ?? '不明なユーザー'"
      />
    </div>
  </div>
  <p v-else>投稿がありません。</p>
</template>

<style scoped>
.announcements-list-wrapper {
  margin: 30px;
}

h6 {
  padding: 5px 48px 10px 5px;
  color: #434343;
  border-bottom: 1px solid currentColor;
  width: calc(100% - 12px);
  position: relative;
  word-break: break-all;
  font-size: 1.3em;

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

.category-wrapper {
  margin: 50px 0;
}


</style>
