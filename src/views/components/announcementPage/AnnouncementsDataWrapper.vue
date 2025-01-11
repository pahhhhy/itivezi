<script setup lang="ts">
import {child, endBefore, get, getDatabase, limitToLast, onValue, orderByChild, query} from "firebase/database";
import type {Announcement} from "@/types/announcement/announcement";
import {categorizeAnnouncements} from "@/utils/announcement/announcementCategories";
import {useUserDataStore} from "@/stores/userPublicData";
import {provide, ref} from 'vue'
import {useAnnouncementsStore} from "@/stores/announcements";
import {ref as fireRef} from "@firebase/database";
import type {UserPublicData} from "@/types/common/userPublicData";
import type {Category} from "@/types/announcement/categories";


const announcementsStore = useAnnouncementsStore();

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

// すべての最近の投稿として取得する投稿の数を指定する定数 (なるべくget数を減らすため最初に一定数取得しておく)
const recentAnnounceCount = 2
// 各カテゴリごとに最低限取得する投稿の数を指定する定数
const categoryAnnounceCount = 5

const db = getDatabase()
const announcementRootRef = fireRef(db, 'testAnnouncements')
const announcementsRef = child(announcementRootRef, 'announcements')

// 投稿の最新一件(q1)は監視をしておき、それ以外(q2)については最初に1度だけrecentAnnounceCount件取得しておく。加えて、categoriesの中身をカテゴリごとにcategoryAnnounceCount件ずつ、timestampの降順で取得する。
const q1 = query(announcementsRef, orderByChild('createdAt'), limitToLast(1))
onValue(q1, (snapshot) => {
  if (!snapshot.exists()) {
    return
  }

  // 既存の内容が更新されたら更新, 新規の内容だったら追加
  const newAnnouncements = Object.values(snapshot.val())

  if (announcementsStore.announcements) {
    newAnnouncements.forEach((newAnnounce) => {
      const typedAnnounce = newAnnounce as Announcement;
      const index = announcementsStore.announcements.findIndex((announce: Announcement) => announce.announceId === typedAnnounce.announceId);
      if (index !== -1) {
        announcementsStore.announcements[index] = typedAnnounce;
      } else {
        announcementsStore.announcements.push(typedAnnounce);
      }

      // 更新段階でも投稿者のユーザーデータを取得しておく
      fetchUsersPublicData(typedAnnounce.userId)

    });
    announcementsStore.categorize();

  }

})

const q2 = query(announcementsRef, orderByChild('createdAt'), limitToLast(recentAnnounceCount))
get(q2)
    .then((snapshot) => { // 最初にrecentAnnounceCount件取得しておく処理
      if (!snapshot.exists()) {
        return
      }
      // ここでのsnapshotは[id: string]: Announcementの形
      announcementsStore.announcements = Object.values(snapshot.val()) as unknown as Announcement[] // 投稿の一覧を取得
      // この段階でcategorizedAnnouncementsにも入れておく
      announcementsStore.categorize();
    })
    .then(() => { // 追加で各カテゴリごとに最低categoryAnnounceCount件になるように取得する
      // 各categoriesのannouncements上位categoryAnnounceCount件に含まれるidを持つ投稿で、上の処理で取ってこれなかったものを別途取得する
      // まずはカテゴリごとに上位categoryAnnounceCount件の投稿を取得、一つの配列にまとめる
      const topAnnouncementsForEachCategory = announcementsStore.categories.map((category): string[] => {
        const announcesEachCategory: { [id: string]: number } = category.announces as { [id: string]: number } // 投稿のid: timestampの形 timestampはnumber
        // timestampの降順でソートし、上位categoryAnnounceCount件のidを配列で返す
        if (!announcesEachCategory) {
          return []
        }
        return Object.keys(announcesEachCategory)
            .sort((a, b) => announcesEachCategory[b] - announcesEachCategory[a])
            .slice(0, categoryAnnounceCount) // 配列の先頭からcategoryAnnounceCount件取得
      }).flat()

      // このcategoryAnnouncementsとcategorizedAnnouncementsの中身を比較して、先ほど取得したannouncementsに含まれていない投稿を調べる
      const missingAnnouncements = topAnnouncementsForEachCategory.filter((announceId) => {
        return !announcementsStore.announcements.some((announce: Announcement) => announce.announceId === announceId) // 投稿のidが一致するものがannouncementsに一つもないならfilterで残す
      })

      if (missingAnnouncements.length !== 0) { // そしてあるならば
        missingAnnouncements.forEach((announceId) => { // それぞれの投稿を取得してcategorizedAnnouncementsに追加
          get(child(announcementsRef, announceId)).then((snapshot) => { // 非同期で取得をかけておく
                if (!snapshot.exists()) {
                  return
                }
                const newAnnounce = snapshot.val() as Announcement
                announcementsStore.announcements.push(newAnnounce)
                announcementsStore.categorizedAnnouncements = categorizeAnnouncements(
                    Object.values(announcementsStore.categories),
                    announcementsStore.announcements
                )
              }
          )

        })
      }
    })
    .then(() => { // 最後にこれまで取得した投稿に含まれるすべての投稿者のユーザーデータを取得しておく処理
      if (announcementsStore.announcements) {
        announcementsStore.announcements.forEach((announce: Announcement) => {
          if (!announce.userId || usersPublicData.value?.[announce.userId]) { // すでに取得済みのユーザーだったらスキップ
            return
          }
          fetchUsersPublicData(announce.userId)
        })
      }
    })

const checkExistsMoreAnnounceByCat = (categoryId: string): boolean => {
  const category: Category | undefined = announcementsStore.categories.find((category) => category.categoryId === categoryId)
  if (category) {
    return Object.keys(announcementsStore.categorizedAnnouncements[category.categoryName]).length < category.announcementCount
  }
  return false
}

const getMoreAnnounceByCat = async (categoryId: string): Promise<boolean|null> => {
  const category: Category | undefined = announcementsStore.categories.find((category) => category.categoryId === categoryId)
  if (category) { // 現在保持している投稿の一番古いもの より古い投稿をcategoryAnnounceCount件追加取得
    const oldestAnnounce = Object.values(announcementsStore.categorizedAnnouncements[category.categoryName]
    ).sort((a, b) => (a.createdAt as number) - (b.createdAt as number))[0]
    if (oldestAnnounce) {
      const q = query(announcementsRef, orderByChild('createdAt'), endBefore((oldestAnnounce.createdAt as number)), limitToLast(categoryAnnounceCount))
      const snapshot = await get(q)
      if (!snapshot.exists()) return false;
      const newAnnounces = Object.values(snapshot.val()) as Announcement[]
      newAnnounces.forEach((newAnnounce) => {
        announcementsStore.announcements.push(newAnnounce)
      })
      announcementsStore.categorize()
    }
    return true
  }
  return null
}

provide('checkExistsMoreAnnounceByCat', checkExistsMoreAnnounceByCat);
provide('getMoreAnnounceByCat', getMoreAnnounceByCat);
</script>

<template>
  <slot></slot>
</template>