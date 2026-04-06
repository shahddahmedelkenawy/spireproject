<template>
  <q-page class="msg-list-page">
    <div class="msg-list-inner">
      <header class="msg-list-header">
        <div class="msg-list-title-row">
          <h1 class="msg-list-title">{{ listTitle }}</h1>
          <q-btn
            flat
            round
            dense
            icon="arrow_drop_down"
            class="msg-list-title-action"
            aria-label="Filter"
          >
            <q-menu anchor="bottom left" self="top left">
              <q-list dense style="min-width: 160px">
                <q-item
                  v-for="opt in filterOptions"
                  :key="opt.value"
                  v-close-popup
                  clickable
                  :active="listFilter === opt.value"
                  @click="listFilter = opt.value"
                >
                  <q-item-section>{{ opt.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-space />
          <q-btn flat round dense icon="more_vert" class="msg-list-title-action" aria-label="Menu">
            <q-menu anchor="bottom right" self="top right">
              <q-list dense style="min-width: 180px">
                <q-item v-close-popup clickable @click="refreshList">
                  <q-item-section>Refresh</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <q-input
          v-model="searchQuery"
          dense
          outlined
          class="msg-search"
          :placeholder="searchPlaceholder"
        >
          <template #prepend>
            <q-icon name="search" class="msg-search-icon" />
          </template>
          <template v-if="searchQuery" #append>
            <q-btn
              round
              dense
              flat
              icon="close"
              class="msg-search-clear-btn"
              tabindex="-1"
              @click.stop="searchQuery = ''"
            />
          </template>
        </q-input>
      </header>

      <!-- Spira stays fixed below search; only the thread list scrolls -->
      <div class="msg-pinned">
        <button
          type="button"
          class="msg-row"
          @click="openChat(assistant.peerId)"
        >
          <q-avatar size="48px" class="msg-avatar msg-avatar--bot">
            <q-icon name="smart_toy" size="26px" />
          </q-avatar>
          <div class="msg-row-body">
            <div class="msg-name-row">
              <span class="msg-name">{{ assistant.name }}</span>
            </div>
            <div class="msg-preview">{{ assistant.preview }}</div>
            <div class="msg-time">{{ assistantTimeLabel }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            :icon="isStarred(assistant.peerId) ? 'star' : 'star_border'"
            class="msg-star"
            aria-label="Star"
            @click.stop="toggleStar(assistant.peerId)"
          />
        </button>
        <div class="msg-divider" />
      </div>

      <q-scroll-area class="msg-scroll">
        <div class="msg-list-padding">
          <template v-for="(chat, index) in filteredChats" :key="chat.peerId">
            <button type="button" class="msg-row" @click="openChat(chat.peerId)">
              <q-avatar size="48px" class="msg-avatar">
                <img
                  v-if="chat.profilePhotoUrl"
                  :src="chat.profilePhotoUrl"
                  alt=""
                  class="msg-avatar-img"
                >
                <span v-else>{{ chat.initials }}</span>
              </q-avatar>
              <div class="msg-row-body">
                <div class="msg-name-row">
                  <span class="msg-name">{{ chat.name }}</span>
                  <q-badge v-if="chat.unreadCount" color="white" text-color="#4B1D4F" class="msg-unread">
                    {{ chat.unreadCount }}
                  </q-badge>
                </div>
                <div class="msg-preview">{{ chat.lastMessage }}</div>
                <div class="msg-time">{{ formatListTime(chat.time) }}</div>
              </div>
              <q-btn
                flat
                round
                dense
                :icon="isStarred(chat.peerId) ? 'star' : 'star_border'"
                class="msg-star"
                aria-label="Star"
                @click.stop="toggleStar(chat.peerId)"
              />
            </button>
            <div v-if="index < filteredChats.length - 1" class="msg-divider" />
          </template>

          <div v-if="!loading && !filteredChats.length && !searchQuery.trim()" class="msg-empty">
            {{ emptyHint }}
          </div>
          <div v-else-if="!loading && !filteredChats.length && searchQuery.trim()" class="msg-empty">
            No chats match your search.
          </div>
          <div v-if="loading" class="msg-loading">
            <q-spinner color="white" size="32px" />
          </div>
        </div>
      </q-scroll-area>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { listUserConversations } from 'src/services/messageService'
import { ASSISTANT_PEER_ID, assistantConversationDefaults } from 'src/constants/messaging'

const props = defineProps({
  variant: {
    type: String,
    default: 'jobseeker',
    validator: (v) => ['jobseeker', 'employer'].includes(v),
  },
})

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const listTitle = 'All Messages'
const searchPlaceholder = 'Search or start a new chat'

const emptyHint = computed(() =>
  props.variant === 'employer'
    ? 'No conversations yet. Start from applicants or your circle.'
    : 'No conversations yet. Start from your circle or applications.'
)

const assistant = computed(() => ({
  ...assistantConversationDefaults,
  peerId: ASSISTANT_PEER_ID,
}))

const assistantTimeLabel = computed(() => {
  const t = new Date()
  return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const basePath = computed(() =>
  props.variant === 'employer' ? '/employer/messages' : '/messages'
)

const chats = ref([])
const loading = ref(true)
const searchQuery = ref('')
const listFilter = ref('all')

const filterOptions = [
  { label: 'All messages', value: 'all' },
  { label: 'Unread only', value: 'unread' },
]

const starredKey = computed(() =>
  authStore.user?.uid ? `msgStarred:${authStore.user.uid}` : ''
)

function loadStarred() {
  try {
    const raw = localStorage.getItem(starredKey.value)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

const starredPeers = ref(new Set())

function persistStarred() {
  if (!starredKey.value) return
  localStorage.setItem(starredKey.value, JSON.stringify([...starredPeers.value]))
}

function isStarred(peerId) {
  return starredPeers.value.has(peerId)
}

function toggleStar(peerId) {
  if (starredPeers.value.has(peerId)) starredPeers.value.delete(peerId)
  else starredPeers.value.add(peerId)
  starredPeers.value = new Set(starredPeers.value)
  persistStarred()
}

function formatListTime(timestamp) {
  if (!timestamp?.toDate) return ''
  const date = timestamp.toDate()
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const filteredChats = computed(() => {
  let list = chats.value.filter((c) => c.peerId !== ASSISTANT_PEER_ID)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    )
  }
  if (listFilter.value === 'unread') {
    list = list.filter((c) => (c.unreadCount || 0) > 0)
  }
  return list
})

function openChat(peerId) {
  router.push({
    path: `${basePath.value}/chat/${encodeURIComponent(peerId)}`,
  })
}

async function loadConversations() {
  if (!authStore.user?.uid) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    chats.value = await listUserConversations(authStore.user.uid)
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Could not load messages' })
  } finally {
    loading.value = false
  }
}

function refreshList() {
  loadConversations()
}

onMounted(() => {
  if (starredKey.value) starredPeers.value = loadStarred()
  loadConversations()
  if (route.query.peer) {
    const p = String(route.query.peer)
    router.replace({ path: `${basePath.value}/chat/${encodeURIComponent(p)}` })
  }
})

watch(
  () => authStore.user?.uid,
  (uid) => {
    if (uid && starredKey.value) starredPeers.value = loadStarred()
  }
)
</script>

<style scoped>
.msg-list-page {
  min-height: 100%;
  background: #4b1d4f;
  color: #fff;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.msg-list-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: calc(100vh - 56px - env(safe-area-inset-bottom));
  min-height: calc(100dvh - 56px - env(safe-area-inset-bottom));
}

.msg-list-header {
  padding: 12px 16px 8px;
  flex-shrink: 0;
}

.msg-list-title-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.msg-list-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}

.msg-list-title-action {
  color: rgba(255, 255, 255, 0.85);
}

.msg-search {
  margin-bottom: 12px;
}

/* Match applicants page field size (dense + outlined pill) */
.msg-search :deep(.q-field__control) {
  border-radius: 999px;
  min-height: 40px;
  background-color: #ffffff !important;
  padding: 0 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.msg-search :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(0, 0, 0, 0.12);
}

.msg-search :deep(.q-field__marginal) {
  height: 40px;
}

.msg-search :deep(.q-field__native) {
  color: #1e1e1e !important;
  caret-color: #1e1e1e;
}

.msg-search :deep(.q-field__native::placeholder) {
  color: #6b6b6b;
  opacity: 1;
}

.msg-search-icon {
  color: #1e1e1e;
}

.msg-search-clear-btn {
  color: #1e1e1e !important;
}

.msg-search-clear-btn :deep(.q-icon) {
  color: #1e1e1e !important;
}

.msg-pinned {
  flex-shrink: 0;
  padding: 0 12px 4px;
}

.msg-scroll {
  flex: 1;
  min-height: 0;
}

.msg-list-padding {
  padding: 8px 12px 24px;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 4px;
  margin: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;
  border-radius: 16px;
}

.msg-row:active {
  background: rgba(255, 255, 255, 0.06);
}

.msg-avatar {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
}

.msg-avatar--bot {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.msg-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.msg-row-body {
  flex: 1;
  min-width: 0;
}

.msg-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.msg-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.msg-preview {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.msg-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
  margin-top: 6px;
}

.msg-star {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4px;
}

.msg-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 0 8px;
}

.msg-empty {
  text-align: center;
  padding: 32px 16px;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
}

.msg-loading {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.msg-unread {
  border-radius: 999px;
  font-size: 10px;
  padding: 2px 6px;
}
</style>
