<template>
  <component
    :is="panelOnly ? 'div' : 'q-page'"
    class="chat-route-page column no-wrap"
    :class="{ 'chat-route-page--panel': panelOnly }"
  >
    <div class="chat-route-root">
      <div class="chat-route-root__pane">
        <div
          class="chat-page column no-wrap"
          :class="{ 'chat-page--split': jobSeekerCompactPane }"
        >
          <header class="chat-top" :class="{ 'chat-top--spire': assistantMode }">
            <q-btn
              v-if="showChatBack"
              flat
              round
              dense
              icon="arrow_back"
              class="chat-top-icon"
              aria-label="Back"
              @click="goBack"
            />
      <button
        type="button"
        class="chat-top-peer"
        :disabled="assistantMode"
        aria-label="View profile"
        @click="goToPeerProfile"
      >
        <q-avatar
          size="40px"
          class="chat-top-avatar"
          :class="{ 'chat-top-avatar--spire': assistantMode }"
        >
          <img v-if="headerPhoto" :src="headerPhoto" alt="">
          <q-icon
            v-else-if="assistantMode"
            name="smart_toy"
            size="22px"
            class="chat-top-spira-ic"
          />
          <span v-else>{{ headerInitials }}</span>
        </q-avatar>
        <div class="chat-top-name-block">
          <div class="chat-top-name" :class="{ 'chat-top-name--spire': assistantMode }">
            {{ headerName }}
          </div>
          <div
            v-if="headerSubtitle"
            class="chat-top-sub"
            :class="{ 'chat-top-sub--spire': assistantMode }"
          >
            {{ headerSubtitle }}
          </div>
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
        <template v-for="row in timelineRows" :key="row.key">
          <div v-if="row.type === 'sep'" class="chat-day-separator" role="presentation">
            <span class="chat-day-separator__line" aria-hidden="true" />
            <span class="chat-day-separator__text">{{ row.label }}</span>
            <span class="chat-day-separator__line" aria-hidden="true" />
          </div>
          <div
            v-else
            class="chat-bubble-row"
            :class="
              row.message.senderId === currentUid ? 'chat-bubble-row--out' : 'chat-bubble-row--in'
            "
          >
            <div
              class="chat-bubble"
              :class="
                row.message.senderId === currentUid ? 'chat-bubble--out' : 'chat-bubble--in'
              "
            >
              {{ row.message.message }}
            </div>
            <div class="chat-bubble-time">{{ formatMsgTime(row.message.createdAt) }}</div>
          </div>
        </template>
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
            <div class="chat-input-row">
              <q-btn flat round dense icon="emoji_emotions" class="chat-input-side" @click="onEmoji" />
              <q-input
                v-model="draft"
                class="chat-field"
                :class="{ 'chat-field--brand-purple': !isEmployer }"
                rounded
                standout
                dense
                :placeholder="inputPlaceholder"
                @keyup.enter="send"
              >
                <template #prepend>
                  <q-btn
                    round
                    dense
                    unelevated
                    icon="add"
                    class="chat-input-attach-btn chat-input-infield"
                    aria-label="Attach file"
                    @click="onAttach"
                  />
                </template>
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    icon="send"
                    class="chat-input-send chat-input-infield"
                    :disable="!canSend"
                    aria-label="Send message"
                    @click="send"
                  />
                </template>
              </q-input>
              <q-btn flat round dense icon="mic" class="chat-input-side" aria-label="Voice input" @click="onMic" />
              <q-btn flat round dense icon="thumb_up_alt" class="chat-input-side" aria-label="Reaction" @click="onThumb" />
              <q-btn
                v-if="!assistantMode"
                round
                unelevated
                icon="accessibility_new"
                class="chat-a11y-btn"
                aria-label="Accessibility"
                @click="onAccessibility"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </component>
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
import {
  ASSISTANT_PEER_ID,
  assistantConversationDefaults,
  spireAssistantSeenMsgKey,
} from 'src/constants/messaging'

const ASSISTANT_WELCOME_ID = '__spire_welcome__'

const props = defineProps({
  /** When true, root is a div (embedded in Messages hub) instead of q-page. */
  panelOnly: { type: Boolean, default: false },
  /** Job seeker Messages hub: peer id without route navigation. */
  peerIdOverride: { type: String, default: '' },
})

const emit = defineEmits(['hub-back', 'switch-peer'])

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const accessibilityStore = useAccessibilityStore()

const inputPlaceholder = 'Type your message here...'

const peerId = computed(() => {
  if (props.peerIdOverride) return props.peerIdOverride
  const raw = route.params.peerId
  return raw ? decodeURIComponent(String(raw)) : ''
})

const isEmployer = computed(() => route.path.startsWith('/employer'))
const listPath = computed(() => (isEmployer.value ? '/employer/messages' : '/messages'))

/** Job seeker thread uses compact header padding when embedded in Messages hub (list is separate). */
const jobSeekerCompactPane = computed(() => !isEmployer.value)

/** Hub mobile stack: back; hub desktop split & route chat at md+: no back (aligned with MessagesPage ≥768 split). */
const showChatBack = computed(() => {
  if (isEmployer.value) return true
  if (props.peerIdOverride) return ($q.screen.width || 0) < 768
  return $q.screen.lt.md
})

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

function startOfDayMs(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function dayKeyOfMessage(m) {
  if (!m?.createdAt?.toDate) return startOfDayMs(new Date())
  return startOfDayMs(m.createdAt.toDate())
}

function separatorLabelFromTimestamp(ts) {
  const d = ts?.toDate ? ts.toDate() : new Date()
  const now = new Date()
  const today0 = startOfDayMs(now)
  const msg0 = startOfDayMs(d)
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (msg0 === today0) return `Today | ${timeStr}`
  const yesterday0 = today0 - 86400000
  if (msg0 === yesterday0) return `Yesterday | ${timeStr}`
  const datePart = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  return `${datePart} | ${timeStr}`
}

function formatMsgTime(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

/** Day separators + messages (reference: centered “Today | 06:32 PM” style). */
const timelineRows = computed(() => {
  const list = visibleMessages.value
  const rows = []
  let prevDayKey = null
  for (const m of list) {
    const dk = dayKeyOfMessage(m)
    if (prevDayKey === null || dk !== prevDayKey) {
      prevDayKey = dk
      rows.push({
        type: 'sep',
        key: `sep-${m.id}-${dk}`,
        label: separatorLabelFromTimestamp(m.createdAt),
      })
    }
    rows.push({ type: 'msg', key: `m-${m.id}`, message: m })
  }
  return rows
})

const emptyLabel = computed(() => {
  if (assistantMode.value) return 'Messages will appear here.'
  return 'No messages yet. Say hello!'
})

const canSend = computed(
  () => !!draft.value.trim() && !sending.value && !isAssistantTyping.value && !!currentUid.value
)

function goBack() {
  if (props.peerIdOverride) {
    emit('hub-back')
    return
  }
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
  if (props.peerIdOverride) {
    emit('switch-peer', id)
    return
  }
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

function onAttach() {
  $q.notify({ message: 'Attachments coming soon', position: 'bottom' })
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

/** Keep list unread dot in sync while Spira chat is open (incl. mobile full-screen). */
function persistSpireSeenFromThread(list) {
  if (!assistantMode.value || !currentUid.value) return
  for (let i = list.length - 1; i >= 0; i--) {
    const m = list[i]
    if (m.senderId === ASSISTANT_PEER_ID && m.id) {
      localStorage.setItem(spireAssistantSeenMsgKey(currentUid.value), m.id)
      return
    }
  }
}

watch(
  () => messages.value,
  (list) => persistSpireSeenFromThread(list),
  { deep: true }
)
</script>

<style scoped>
.chat-route-page {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
}

.chat-route-page--panel {
  min-height: 0;
  overflow: hidden;
}

.chat-route-root {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  width: 100%;
}

.chat-route-root__pane {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
}

.chat-page {
  flex: 1 1 auto;
  min-height: 100%;
  min-width: 0;
  background: #f4f2f7;
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
}

.chat-page--split {
  flex: 1 1 auto;
  min-height: 0;
  padding-top: 0;
  background: #ffffff;
  overflow: hidden;
}

.chat-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #ffffff;
  border-bottom: 1px solid rgba(61, 10, 69, 0.08);
  box-shadow: 0 2px 14px rgba(28, 8, 36, 0.06);
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
  color: #8b8794 !important;
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

/** Spira: crisp white bar, dark purple titles, richer purple robot avatar */
.chat-top--spire {
  background: #ffffff;
  border-bottom: 1px solid rgba(61, 10, 69, 0.07);
  box-shadow: 0 1px 10px rgba(28, 8, 36, 0.05);
}

.chat-top-avatar--spire {
  background: linear-gradient(160deg, #f3e5f5 0%, #e1bee7 45%, #ce93d8 100%);
  color: #6a1b9a;
  border: 1px solid rgba(106, 27, 154, 0.35);
  box-shadow: 0 2px 8px rgba(74, 20, 140, 0.12);
}

.chat-top-spira-ic {
  color: #7b1fa2;
}

.chat-top-name--spire {
  color: #3d0b52;
  font-weight: 700;
}

.chat-top-sub--spire {
  color: #5e3570;
  font-weight: 600;
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

.chat-page--split .recent-chats {
  display: none;
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
  min-height: 0;
  overflow-y: auto;
  padding: 12px 12px 120px;
  -webkit-overflow-scrolling: touch;
  background: #ffffff;
}

.chat-page--split .chat-messages-wrap {
  padding: 20px 28px 16px;
}

.chat-messages {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble-row {
  display: flex;
  flex-direction: column;
  max-width: min(85%, 520px);
  margin-bottom: 4px;
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
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.45;
  word-break: break-word;
  box-shadow: 0 2px 10px rgba(45, 10, 52, 0.07);
}

.chat-day-separator {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 720px;
  margin: 8px auto 16px;
}

.chat-day-separator__line {
  flex: 1;
  height: 1px;
  background: rgba(61, 10, 69, 0.12);
}

.chat-day-separator__text {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #7a7382;
  letter-spacing: 0.02em;
}

.chat-bubble--in {
  background: #ede7f6;
  color: #1f1526;
  border-bottom-left-radius: 8px;
}

.chat-bubble--out {
  background: #4b1d4f;
  color: #fff;
  border-bottom-right-radius: 8px;
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
  background: linear-gradient(to top, #f4f2f7 82%, transparent);
  z-index: 10;
}

.chat-page--split .chat-input-dock {
  position: sticky;
  bottom: 0;
  left: auto;
  right: auto;
  width: 100%;
  margin-top: auto;
  background: #ffffff;
}

.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1px solid rgba(61, 10, 69, 0.08);
  box-shadow: 0 -6px 22px rgba(28, 8, 36, 0.06);
}

.chat-page--split .chat-input-row {
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}

.chat-field {
  flex: 1;
  min-width: 0;
}

.chat-field :deep(.q-field__control) {
  background: #ffffff !important;
  border-radius: 26px !important;
  min-height: 48px;
  padding-right: 6px;
  border: 1px solid rgba(61, 10, 69, 0.14) !important;
  box-shadow: 0 2px 12px rgba(28, 8, 36, 0.06);
}

.chat-page--split .chat-field :deep(.q-field__control) {
  box-shadow: 0 1px 8px rgba(28, 8, 36, 0.05);
}

.chat-input-side {
  color: #5a1e64;
}

.chat-input-infield {
  color: #6b5d78 !important;
}

.chat-input-attach-btn {
  background: #4b1d4f !important;
  color: #ffffff !important;
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  min-height: 34px !important;
  margin: 0 2px;
}

.chat-a11y-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  min-height: 44px !important;
  min-width: 44px !important;
  background: #4b1d4f !important;
  color: #ffffff !important;
  box-shadow: 0 4px 16px rgba(61, 10, 69, 0.35);
}

.chat-input-send:disabled {
  opacity: 0.4;
}

/** Job seeker messages: purple typing (same as former Spira-only styling). */
.chat-field--brand-purple :deep(.q-field__native),
.chat-field--brand-purple :deep(input),
.chat-field--brand-purple :deep(textarea) {
  color: #4b1d4f !important;
  caret-color: #6a1b9a;
  font-weight: 600;
}

.chat-field--brand-purple :deep(.q-field__native::placeholder),
.chat-field--brand-purple :deep(input::placeholder) {
  color: rgba(75, 29, 79, 0.45);
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
  background: #5a1e64;
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
