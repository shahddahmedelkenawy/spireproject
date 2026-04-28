<template>
  <q-page class="chat-page column no-wrap">
    <header class="chat-top">
      <q-btn flat round dense icon="arrow_back" class="chat-top-icon" aria-label="Back" @click="goBack" />
      <button
        type="button"
        class="chat-top-peer"
        :disabled="assistantMode"
        aria-label="View profile"
        @click="goToPeerProfile"
      >
        <q-avatar size="40px" class="chat-top-avatar">
          <img v-if="headerPhoto" :src="headerPhoto" alt="">
          <span v-else>{{ headerInitials }}</span>
        </q-avatar>
        <div class="chat-top-name-block">
          <div class="chat-top-name">{{ headerName }}</div>
          <div v-if="headerSubtitle" class="chat-top-sub">{{ headerSubtitle }}</div>
        </div>
      </button>
      <q-space />
      <q-btn
        flat
        round
        dense
        :icon="threadStarred ? 'star' : 'star_border'"
        class="chat-top-icon"
        aria-label="Star"
        @click="toggleThreadStar"
      />
      <q-btn flat round dense icon="search" class="chat-top-icon" aria-label="Search" @click="showSearch = !showSearch" />
      <q-btn flat round dense icon="more_vert" class="chat-top-icon" aria-label="Menu">
        <q-menu anchor="bottom right" self="top right">
          <q-list dense style="min-width: 180px">
            <q-item clickable v-close-popup @click="clearLocalSearch">
              <q-item-section>Clear search</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              clickable
              v-close-popup
              :disable="clearingChat"
              @click="confirmClearChat"
            >
              <q-item-section class="text-negative">Clear chat</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </header>

    <q-slide-transition>
      <div v-show="showSearch" class="chat-search-bar">
        <q-input
          v-model="threadSearch"
          dense
          rounded
          standout
          placeholder="Search in conversation"
          class="chat-search-input"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
          <template v-if="threadSearch" #append>
            <q-btn
              round
              dense
              flat
              icon="close"
              class="chat-search-clear-btn"
              tabindex="-1"
              aria-label="Clear search"
              @click.stop="clearLocalSearchKeepBarOpen"
            />
          </template>
        </q-input>
      </div>
    </q-slide-transition>

    <div v-if="recentChats.length && !assistantMode" class="recent-chats">
      <div class="recent-chats-label">
        Recent chats
      </div>
      <div class="recent-chats-scroll">
        <button
          v-for="c in recentChats"
          :key="c.peerId"
          type="button"
          class="recent-chip"
          @click="openRecentChat(c.peerId)"
        >
          <q-avatar size="36px" class="recent-chip-avatar">
            <img v-if="c.profilePhotoUrl" :src="c.profilePhotoUrl" alt="">
            <span v-else>{{ c.initials }}</span>
          </q-avatar>
          <span class="recent-chip-name">{{ c.name }}</span>
        </button>
      </div>
    </div>

    <div ref="scrollAreaRef" class="chat-messages-wrap">
      <div class="chat-messages">
        <div
          v-for="m in visibleMessages"
          :key="m.id"
          class="chat-bubble-row"
          :class="m.senderId === currentUid ? 'chat-bubble-row--out' : 'chat-bubble-row--in'"
        >
          <div
            class="chat-bubble"
            :class="m.senderId === currentUid ? 'chat-bubble--out' : 'chat-bubble--in'"
          >
            {{ m.message }}
          </div>
          <div class="chat-bubble-time">{{ formatMsgTime(m.createdAt) }}</div>
        </div>
        <div
          v-if="isAssistantTyping"
          class="chat-bubble-row chat-bubble-row--in chat-bubble-row--typing"
          aria-hidden="true"
        >
          <div class="chat-bubble chat-bubble--in chat-bubble--typing">
            <span class="typing-dot" />
            <span class="typing-dot" />
            <span class="typing-dot" />
          </div>
        </div>
        <div v-if="!visibleMessages.length && !loading" class="chat-empty">
          {{ emptyLabel }}
        </div>
        <div
          v-if="loading && !(assistantMode && messages.length === 0)"
          class="chat-loading"
        >
          <q-spinner color="primary" size="28px" />
        </div>
      </div>
    </div>

    <div class="chat-input-dock">
      <q-btn
        v-if="!assistantMode"
        round
        flat
        icon="accessibility_new"
        class="chat-a11y-fab"
        aria-label="Accessibility"
        @click="onAccessibility"
      />

      <div class="chat-input-row">
        <q-btn flat round dense icon="emoji_emotions" class="chat-input-side" @click="onEmoji" />
        <q-input
          v-model="draft"
          class="chat-field"
          :class="{ 'chat-field--spire': assistantMode }"
          rounded
          standout
          dense
          :placeholder="inputPlaceholder"
          @keyup.enter="send"
        />
        <q-btn
          flat
          round
          dense
          icon="send"
          class="chat-input-side chat-input-send"
          :disable="!canSend"
          @click="send"
        />
        <q-btn flat round dense icon="mic" class="chat-input-side" @click="onMic" />
        <q-btn flat round dense icon="thumb_up_alt" class="chat-input-side" @click="onThumb" />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useAccessibilityStore } from 'src/stores/accessibilityStore'
import { getUserProfile } from 'src/services/userService'
import {
  listUserConversations,
  sendMessage,
  subscribeChatHistory,
  deleteAllMessagesInThread,
} from 'src/services/messageService'
import { getSpiraReply } from 'src/services/spiraReply'
import { HELP_ASSISTANT_WELCOME } from 'src/data/helpAssistantKnowledge'
import { ASSISTANT_PEER_ID, assistantConversationDefaults } from 'src/constants/messaging'

const ASSISTANT_WELCOME_ID = '__spire_welcome__'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const accessibilityStore = useAccessibilityStore()

const inputPlaceholder = 'Type your message here…'

const peerId = computed(() => {
  const raw = route.params.peerId
  return raw ? decodeURIComponent(String(raw)) : ''
})

const isEmployer = computed(() => route.path.startsWith('/employer'))
const listPath = computed(() => (isEmployer.value ? '/employer/messages' : '/messages'))

const assistantMode = computed(() => peerId.value === ASSISTANT_PEER_ID)

/** Role-aware knowledge base (prefer store; fall back to employer layout path). */
const userRole = computed(() => {
  if (authStore.userRole === 'employer' || isEmployer.value) return 'employer'
  return 'jobseeker'
})

const currentUid = computed(() => authStore.user?.uid || '')

const isAssistantTyping = ref(false)
const clearingChat = ref(false)

const messages = ref([])
const loading = ref(true)
const draft = ref('')
const sending = ref(false)
const showSearch = ref(false)
const threadSearch = ref('')
const scrollAreaRef = ref(null)
const recentChats = ref([])

const headerName = ref('User')
const headerSubtitle = ref('')
const headerPhoto = ref('')
const headerInitials = ref('US')

const threadStarred = ref(false)
const starredStorageKey = computed(() =>
  currentUid.value ? `msgStarred:${currentUid.value}` : ''
)

function loadThreadStar() {
  try {
    const raw = localStorage.getItem(starredStorageKey.value)
    if (!raw) return false
    const arr = JSON.parse(raw)
    return Array.isArray(arr) && arr.includes(peerId.value)
  } catch {
    return false
  }
}

function persistThreadStar(on) {
  if (!starredStorageKey.value) return
  let arr = []
  try {
    const raw = localStorage.getItem(starredStorageKey.value)
    if (raw) arr = JSON.parse(raw) || []
  } catch {
    arr = []
  }
  if (!Array.isArray(arr)) arr = []
  if (on && !arr.includes(peerId.value)) arr.push(peerId.value)
  if (!on) arr = arr.filter((id) => id !== peerId.value)
  localStorage.setItem(starredStorageKey.value, JSON.stringify(arr))
}

function toggleThreadStar() {
  threadStarred.value = !threadStarred.value
  persistThreadStar(threadStarred.value)
}

let unsub = null

async function loadPeerHeader() {
  if (assistantMode.value) {
    headerName.value = assistantConversationDefaults.name
    headerSubtitle.value = assistantConversationDefaults.badge
    headerPhoto.value = ''
    headerInitials.value = 'SP'
    return
  }
  try {
    const p = await getUserProfile(peerId.value)
    const name = p?.name || 'User'
    headerName.value = name
    headerSubtitle.value = ''
    headerPhoto.value = p?.profilePhotoUrl || ''
    const initials = name
      .split(' ')
      .map((x) => x[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    headerInitials.value = initials || 'US'
  } catch {
    headerName.value = 'User'
  }
}

function formatMsgTime(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** Virtual welcome bubble when there is no persisted welcome yet */
const chatMessagesForView = computed(() => {
  if (!assistantMode.value) return messages.value
  const raw = messages.value
  const first = raw[0]
  const alreadyWelcome =
    first?.message === HELP_ASSISTANT_WELCOME ||
    (first?.senderId === ASSISTANT_PEER_ID &&
      String(first?.message || '').startsWith('Hi there!'))
  if (alreadyWelcome) return raw
  return [
    {
      id: ASSISTANT_WELCOME_ID,
      senderId: ASSISTANT_PEER_ID,
      message: HELP_ASSISTANT_WELCOME,
      createdAt: null,
    },
    ...raw,
  ]
})

const visibleMessages = computed(() => {
  const base = chatMessagesForView.value
  const q = threadSearch.value.trim().toLowerCase()
  if (!q) return base
  return base.filter((m) => (m.message || '').toLowerCase().includes(q))
})

const emptyLabel = computed(() => {
  if (assistantMode.value) return 'Messages will appear here.'
  return 'No messages yet. Say hello!'
})

const canSend = computed(
  () => !!draft.value.trim() && !sending.value && !isAssistantTyping.value && !!currentUid.value
)

function goBack() {
  const from = route.query.from
  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    router.push(from)
    return
  }
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    return
  }
  router.push(listPath.value)
}

function chatPathFor(peer) {
  const base = isEmployer.value ? '/employer/messages/chat/' : '/messages/chat/'
  return `${base}${encodeURIComponent(peer)}`
}

async function loadRecentChats() {
  if (!currentUid.value) return
  try {
    const all = await listUserConversations(currentUid.value)
    recentChats.value = all
      .filter((c) => c.peerId && c.peerId !== peerId.value && c.peerId !== ASSISTANT_PEER_ID)
      .slice(0, 15)
  } catch (e) {
    console.warn(e)
    recentChats.value = []
  }
}

function openRecentChat(id) {
  if (!id || id === peerId.value) return
  router.push(chatPathFor(id))
}

function goToPeerProfile() {
  if (assistantMode.value) return
  const id = peerId.value
  if (!id) return
  if (isEmployer.value) {
    router.push(`/employer/user/${encodeURIComponent(id)}`)
  } else {
    router.push(`/peer/${encodeURIComponent(id)}`)
  }
}

function clearLocalSearch() {
  /* Defer so v-close-popup finishes closing the menu before we mutate (fixes missed updates in some Quasar builds). */
  window.setTimeout(() => {
    threadSearch.value = ''
    showSearch.value = false
  }, 0)
}

/** Clear query only; keep search bar open (toolbar “Clear search” closes the bar). */
function clearLocalSearchKeepBarOpen() {
  threadSearch.value = ''
}

function confirmClearChat() {
  window.setTimeout(() => {
    $q.dialog({
      title: 'Clear chat?',
      message:
        'All messages in this conversation will be permanently deleted for you and the other person.',
      cancel: true,
      persistent: true,
      ok: {
        label: 'Clear',
        color: 'negative',
        unelevated: true,
      },
    }).onOk(() => {
      void clearChatThread()
    })
  }, 0)
}

async function clearChatThread() {
  const uid = currentUid.value
  const other = peerId.value
  if (!uid || !other) return
  clearingChat.value = true
  try {
    await deleteAllMessagesInThread(uid, other)
    threadSearch.value = ''
    showSearch.value = false
    await loadRecentChats()
    $q.notify({ type: 'positive', message: 'Chat cleared', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: 'Could not clear chat. Check your connection and try again.',
      position: 'top',
    })
  } finally {
    clearingChat.value = false
  }
}

function onAccessibility() {
  accessibilityStore.openPanel()
}

function onEmoji() {
  const el = document.querySelector('.chat-field input')
  if (el) el.focus()
}

function onMic() {
  $q.notify({ message: 'Voice input is not available yet', position: 'bottom' })
}

function onThumb() {
  $q.notify({ message: 'Reactions coming soon', position: 'bottom' })
}

async function send() {
  if (!canSend.value) return
  const text = draft.value.trim()
  if (!currentUid.value || !peerId.value) return

  if (assistantMode.value) {
    sending.value = true
    draft.value = ''
    try {
      await sendMessage({
        senderId: currentUid.value,
        receiverId: ASSISTANT_PEER_ID,
        message: text,
      })
      isAssistantTyping.value = true
      scrollToBottom()
      const delayMs = 520 + Math.floor(Math.random() * 780)
      await new Promise((r) => setTimeout(r, delayMs))
      const reply = getSpiraReply(text, { role: userRole.value })
      isAssistantTyping.value = false
      await sendMessage({
        senderId: ASSISTANT_PEER_ID,
        receiverId: currentUid.value,
        message: reply,
      })
      loadRecentChats()
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Could not send message' })
    } finally {
      isAssistantTyping.value = false
      sending.value = false
    }
    return
  }

  sending.value = true
  try {
    await sendMessage({
      senderId: currentUid.value,
      receiverId: peerId.value,
      message: text,
    })
    draft.value = ''
    loadRecentChats()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Could not send message' })
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    const el = scrollAreaRef.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

function bindRealtime() {
  if (unsub) {
    unsub()
    unsub = null
  }
  messages.value = []
  if (!currentUid.value || !peerId.value) {
    loading.value = false
    return
  }
  loading.value = true
  unsub = subscribeChatHistory(
    currentUid.value,
    peerId.value,
    (list) => {
      messages.value = list
      loading.value = false
      scrollToBottom()
    },
    () => {
      loading.value = false
      $q.notify({ type: 'negative', message: 'Could not load messages. Check connection and Firestore rules.' })
    }
  )
}

watch(
  () => peerId.value,
  async () => {
    threadStarred.value = loadThreadStar()
    await loadPeerHeader()
    bindRealtime()
    loadRecentChats()
  }
)

onMounted(async () => {
  threadStarred.value = loadThreadStar()
  await loadPeerHeader()
  bindRealtime()
  loadRecentChats()
})

onBeforeUnmount(() => {
  if (unsub) unsub()
})

watch(
  () => messages.value.length,
  () => scrollToBottom()
)

watch(isAssistantTyping, (on) => {
  if (on) scrollToBottom()
})
</script>

<style scoped>
.chat-page {
  flex: 1 1 auto;
  min-height: 100%;
  background: #f5f5f5;
  padding-top: env(safe-area-inset-top);
}

.chat-page :deep(.q-page__container) {
  min-height: inherit;
  display: flex;
  flex-direction: column;
}

.chat-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 4px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.chat-top-peer {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
  border: none;
  background: transparent;
  padding: 4px 4px 4px 0;
  margin: 0;
  cursor: pointer;
  text-align: left;
  border-radius: 12px;
}

.chat-top-peer:disabled {
  cursor: default;
  opacity: 1;
}

.chat-top-peer:not(:disabled):active {
  background: rgba(75, 29, 79, 0.06);
}

.chat-top-icon {
  color: #4b1d4f;
}

.chat-top-avatar {
  background: #ede7f6;
  color: #4b1d4f;
  font-weight: 700;
}

.chat-top-name-block {
  min-width: 0;
  flex: 1;
}

.chat-top-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e1e1e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-top-sub {
  font-size: 12px;
  color: #888;
}

.chat-search-bar {
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.chat-search-input :deep(.q-field__control) {
  background: #f0f0f0 !important;
  border-radius: 14px !important;
}

.chat-search-clear-btn {
  color: #888;
}

.recent-chats {
  flex-shrink: 0;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 0 10px 12px;
}

.recent-chats-label {
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin-bottom: 8px;
  padding-right: 12px;
}

.recent-chats-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.recent-chats-scroll::-webkit-scrollbar {
  height: 4px;
}

.recent-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 64px;
  max-width: 80px;
  border: none;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 8px 6px;
  cursor: pointer;
  flex-shrink: 0;
}

.recent-chip:active {
  background: #ede7f6;
}

.recent-chip-avatar {
  background: #ede7f6;
  color: #4b1d4f;
  font-size: 12px;
  font-weight: 700;
}

.recent-chip-name {
  font-size: 10px;
  color: #444;
  text-align: center;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-messages-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 120px;
  -webkit-overflow-scrolling: touch;
}

.chat-messages {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-bubble-row {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  margin-bottom: 8px;
}

.chat-bubble-row--in {
  align-self: flex-start;
  align-items: flex-start;
}

.chat-bubble-row--out {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.4;
  word-break: break-word;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chat-bubble--in {
  background: #e6ddf0;
  color: #1e1e1e;
  border-bottom-left-radius: 6px;
}

.chat-bubble--out {
  background: #4b1d4f;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.chat-bubble-time {
  font-size: 11px;
  color: #9e9e9e;
  margin-top: 4px;
  padding: 0 4px;
}

.chat-empty {
  text-align: center;
  color: #9e9e9e;
  font-size: 14px;
  padding: 32px 16px;
}

.chat-loading {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.chat-input-dock {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background: linear-gradient(to top, #f5f5f5 80%, transparent);
  z-index: 10;
}

.chat-a11y-fab {
  position: absolute;
  left: 16px;
  bottom: calc(100% + 8px);
  background: #4b1d4f !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(75, 29, 79, 0.35);
}

.chat-input-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px 12px;
  background: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
}

.chat-field {
  flex: 1;
  min-width: 0;
}

.chat-field :deep(.q-field__control) {
  background: #f0f0f0 !important;
  border-radius: 20px !important;
  min-height: 44px;
}

.chat-input-side {
  color: #4b1d4f;
}

.chat-input-send:disabled {
  opacity: 0.4;
}

.chat-field--spire :deep(.q-field__native),
.chat-field--spire :deep(input),
.chat-field--spire :deep(textarea) {
  color: #4b1d4f !important;
  caret-color: #4b1d4f;
}

.chat-bubble--typing {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  padding: 12px 16px !important;
}

.chat-bubble-row--typing {
  margin-bottom: 4px;
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #6b4d7a;
  animation: spire-typing-bounce 1.15s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.18s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes spire-typing-bounce {
  0%,
  60%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-5px);
  }
}
</style>
