<template>
  <q-page class="messages-hub-page" :class="{ 'messages-hub-page--split': splitLayout }">
    <!-- Desktop / tablet: split — list stays mounted; chat switches via state (no route change). -->
    <div v-if="splitLayout" class="msg-hub-dashboard msg-hub-dashboard--split">
      <aside class="msg-hub-dashboard__sidebar" aria-label="Conversations">
        <MessagesListView
          variant="jobseeker"
          embedded
          hub-selection-mode
          :selected-peer-id="selectedPeerId"
          @select-peer="onSelectPeer"
        />
      </aside>
      <main class="msg-hub-dashboard__main" aria-label="Message thread">
        <transition name="msg-hub-thread" mode="out-in">
          <div v-if="selectedPeerId" :key="selectedPeerId" class="msg-hub-dashboard__thread-host">
            <ChatConversationPage
              panel-only
              :peer-id-override="selectedPeerId"
              @switch-peer="onSelectPeer"
            />
          </div>
          <div v-else key="placeholder" class="msg-hub-placeholder">
            <q-icon name="forum" size="72px" color="grey-5" aria-hidden="true" />
            <p class="msg-hub-placeholder__title">
              Select a conversation to start messaging
            </p>
            <p class="msg-hub-placeholder__sub">
              Choose a chat from the list to read and reply. Your threads stay exactly where you left them.
            </p>
          </div>
        </transition>
      </main>
    </div>

    <!-- Mobile / narrow: list first, full-screen chat with back (still /messages). -->
    <template v-else>
      <ChatConversationPage
        v-if="selectedPeerId"
        panel-only
        :peer-id-override="selectedPeerId"
        @hub-back="clearPeer"
        @switch-peer="onSelectPeer"
      />
      <MessagesListView
        v-else
        variant="jobseeker"
        hub-selection-mode
        :selected-peer-id="selectedPeerId"
        @select-peer="onSelectPeer"
      />
    </template>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import MessagesListView from 'src/components/messaging/MessagesListView.vue'
import ChatConversationPage from 'src/pages/ChatConversationPage.vue'
import { useJobSeekerUiStore } from 'src/stores/jobSeekerUiStore'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const jobSeekerUi = useJobSeekerUiStore()

const selectedPeerId = ref('')

/** WhatsApp-style split from tablet up (~768px). */
const splitLayout = computed(() => ($q.screen.width || 0) >= 768)

function onSelectPeer(peerId) {
  selectedPeerId.value = peerId
}

function clearPeer() {
  selectedPeerId.value = ''
}

/** Deep links: /messages?peer=… after redirect from legacy /messages/chat/:id */
function syncPeerFromRouteQuery() {
  const q = route.query.peer
  if (typeof q === 'string' && q.length > 0) {
    selectedPeerId.value = decodeURIComponent(q)
    router.replace({ path: '/messages', query: {} })
  }
}

onMounted(() => {
  syncPeerFromRouteQuery()
})

watch(
  () => route.query.peer,
  () => {
    syncPeerFromRouteQuery()
  }
)

watch(
  [selectedPeerId, splitLayout],
  ([peer, split]) => {
    jobSeekerUi.setMessagesMobileThreadOpen(Boolean(peer && !split))
  },
  { immediate: true }
)

watch(
  selectedPeerId,
  (id) => {
    jobSeekerUi.setMessagesHubPeerId(id || '')
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  jobSeekerUi.setMessagesMobileThreadOpen(false)
  jobSeekerUi.setMessagesHubPeerId('')
})
</script>

<style scoped>
.messages-hub-page {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

/** Split hub: lock viewport height so list vs chat scroll independently (no whole-page scroll). */
.messages-hub-page--split {
  overflow: hidden;
  flex: 1 1 auto;
  min-height: 0;
  max-height: calc(100dvh - var(--jsk-nav-height, 94px) - env(safe-area-inset-bottom));
}

.msg-hub-dashboard {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex: 1 1 auto;
  width: 100%;
  max-width: 100%;
  margin: 0;
  min-height: calc(100vh - var(--jsk-nav-height, 94px) - env(safe-area-inset-bottom));
  min-height: calc(100dvh - var(--jsk-nav-height, 94px) - env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.msg-hub-dashboard--split {
  min-height: 0;
  flex: 1 1 auto;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

.msg-hub-dashboard__sidebar {
  flex: 0 0 30%;
  width: 30%;
  min-width: 280px;
  max-width: min(420px, 40vw);
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.14);
}

.msg-hub-dashboard__main {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #ffffff;
  box-shadow: inset 1px 0 0 rgba(61, 10, 69, 0.06);
}

.msg-hub-dashboard__thread-host {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.msg-hub-dashboard__thread-host > :deep(.chat-route-page) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.msg-hub-placeholder {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
  gap: 12px;
  color: #6b6b76;
}

.msg-hub-placeholder__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #3d2c42;
}

.msg-hub-placeholder__sub {
  margin: 0;
  max-width: 36ch;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #7a7382;
}

.msg-hub-thread-enter-active,
.msg-hub-thread-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.msg-hub-thread-enter-from,
.msg-hub-thread-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
