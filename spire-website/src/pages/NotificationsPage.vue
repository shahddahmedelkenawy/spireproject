<template>
  <q-page class="notifications-page">
    <div class="notifications-inner">
      <JobSeekerStickyHeader v-if="!isEmployerNotifications" />
      <EmployerStickyHeader v-else />

      <h1 class="page-title">Notifications</h1>

      <div class="filter-pills" role="tablist" aria-label="Filter notifications">
        <button
          v-for="tab in filterTabs"
          :key="tab.id"
          type="button"
          class="filter-pill"
          :class="{ 'filter-pill--active': activeFilter === tab.id }"
          role="tab"
          :aria-selected="activeFilter === tab.id"
          @click="activeFilter = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="notificationStore.loading" class="state-block">
        <q-spinner color="primary" size="36px" />
        <p class="state-text">Loading notifications…</p>
      </div>

      <div v-else-if="!filteredNotifications.length" class="state-block state-block--empty">
        <p class="state-text">{{ emptyMessage }}</p>
      </div>

      <div v-else class="notif-list-wrap">
        <article
          v-for="(item, index) in filteredNotifications"
          :key="item.id"
          class="notif-row"
          :class="{ 'notif-row--unread': !item.read }"
        >
          <div
            class="notif-row__main"
            :class="{ 'notif-row__main--clickable': !isFriendRequestItem(item) }"
            @click="!isFriendRequestItem(item) ? markRead(item.id) : undefined"
          >
            <span
              class="notif-dot"
              :class="item.read ? 'notif-dot--read' : 'notif-dot--unread'"
              aria-hidden="true"
            />

            <div
              v-if="item.avatarShape === 'square'"
              class="notif-avatar notif-avatar--square"
            >
              <img
                v-if="item.avatarSrc"
                :src="item.avatarSrc"
                alt=""
                class="notif-avatar__img"
              >
              <q-icon v-else name="business" size="22px" class="notif-avatar__fallback" />
            </div>
            <q-avatar v-else size="44px" class="notif-avatar notif-avatar--circle">
              <img v-if="item.avatarSrc" :src="item.avatarSrc" alt="" class="notif-avatar__img">
              <span v-else class="notif-avatar__initial">{{ avatarInitial(item) }}</span>
            </q-avatar>

            <div class="notif-body">
              <p class="notif-message">{{ item.message }}</p>
              <div
                v-if="isFriendRequestItem(item)"
                class="notif-actions"
                @click.stop
              >
                <q-btn
                  no-caps
                  unelevated
                  class="accept-notif-btn"
                  label="Accept"
                  :loading="processingId === item.id"
                  @click="acceptFriend(item)"
                />
                <q-btn
                  no-caps
                  flat
                  class="reject-notif-btn"
                  label="Reject"
                  :disable="processingId === item.id"
                  @click="rejectFriend(item)"
                />
              </div>
            </div>

            <div class="notif-aside">
              <span class="notif-time">{{ item.time }}</span>
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                class="notif-more-btn"
                aria-label="More options"
                @click.stop
              >
                <q-menu anchor="bottom right" self="top right" @click.stop>
                  <q-list dense class="notif-menu-list">
                    <q-item
                      v-close-popup
                      clickable
                      :disable="item.read"
                      @click="markRead(item.id)"
                    >
                      <q-item-section>Mark as read</q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      class="text-negative"
                      @click="confirmDelete(item)"
                    >
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
          <div v-if="index < filteredNotifications.length - 1" class="notif-divider" />
        </article>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useNotificationStore } from 'src/stores/notificationStore'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import {
  acceptFriendRequest,
  rejectFriendRequest,
  countAcceptedConnectionsForUser,
} from 'src/services/userService'
import JobSeekerStickyHeader from 'src/components/JobSeekerStickyHeader.vue'
import EmployerStickyHeader from 'src/components/EmployerStickyHeader.vue'

const route = useRoute()
const isEmployerNotifications = computed(() => route.path.startsWith('/employer/'))

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'requests', label: 'Requests' },
]

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const $q = useQuasar()
const processingId = ref(null)
const activeFilter = ref('all')

const filteredNotifications = computed(() => {
  const list = notificationStore.notifications || []
  if (activeFilter.value === 'all') return list
  return list.filter((n) => n.filterTab === activeFilter.value)
})

const emptyMessage = computed(() => {
  if (activeFilter.value === 'jobs') {
    return 'No job notifications yet. Applications and job updates will appear here.'
  }
  if (activeFilter.value === 'requests') {
    return 'No requests yet. Connection invites will appear here.'
  }
  return 'No notifications yet. Updates from applications and your circle will appear here.'
})

function isFriendRequestItem(item) {
  return !!(item.friendRequestId && (item.type === 'friend_request' || item.type === 'request'))
}

function avatarInitial(item) {
  const n = (item.senderName || item.message || '?').trim()
  const parts = n.split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
}

function markRead(id) {
  notificationStore.markAsRead(id)
}

function confirmDelete(item) {
  $q.dialog({
    title: 'Delete notification',
    message: 'Remove this notification?',
    cancel: true,
    persistent: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(() => {
    notificationStore.removeNotification(item.id)
  })
}

async function acceptFriend(item) {
  if (!item.friendRequestId || !authStore.user?.uid) return
  processingId.value = item.id
  try {
    await acceptFriendRequest(item.friendRequestId)
    await notificationStore.removeNotification(item.id)
    const n = await countAcceptedConnectionsForUser(authStore.user.uid)
    userStore.setConnectionsCount(n)
    await userStore.fetchProfile(authStore.user.uid)
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Could not accept request', position: 'top' })
  } finally {
    processingId.value = null
  }
}

async function rejectFriend(item) {
  if (!item.friendRequestId) return
  processingId.value = item.id
  try {
    await rejectFriendRequest(item.friendRequestId)
    await notificationStore.removeNotification(item.id)
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Could not reject request', position: 'top' })
  } finally {
    processingId.value = null
  }
}
</script>

<style scoped>
.notifications-page {
  background: #f0f0f2;
  min-height: 100%;
  padding: 0 16px calc(88px + env(safe-area-inset-bottom));
  padding-top: env(safe-area-inset-top);
}

.notifications-inner {
  max-width: 480px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: #1a1a1a;
}

.filter-pills {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-pill {
  flex: 1;
  border: none;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  background: #e8e8ec;
  color: #333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: background 0.15s ease, color 0.15s ease;
}

.filter-pill--active {
  background: #4b1e5a;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(75, 30, 90, 0.35);
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 16px;
  color: #4b1e5a;
}

.state-block--empty {
  color: #666;
}

.state-text {
  margin: 0;
  font-size: 0.9rem;
  text-align: center;
  line-height: 1.5;
  max-width: 280px;
}

.notif-list-wrap {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.notif-row {
  padding: 0;
}

.notif-row__main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 12px 14px 14px;
  min-height: 72px;
}

.notif-row__main--clickable {
  cursor: pointer;
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8px;
}

.notif-dot--unread {
  background: #4b1e5a;
  box-shadow: 0 0 0 2px rgba(75, 30, 90, 0.2);
}

.notif-dot--read {
  background: #d0d0d8;
}

.notif-avatar {
  flex-shrink: 0;
}

.notif-avatar--square {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: #f0edf3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-avatar--circle {
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(75, 30, 90, 0.12);
}

.notif-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notif-avatar__fallback {
  color: #4b1e5a;
  opacity: 0.85;
}

.notif-avatar__initial {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4b1e5a;
}

.notif-body {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.notif-message {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: #2a2a2a;
  font-weight: 500;
}

.notif-row--unread .notif-message {
  color: #1a1a1a;
  font-weight: 600;
}

.notif-aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  margin-left: 4px;
}

.notif-time {
  font-size: 0.7rem;
  color: #999;
  white-space: nowrap;
}

.notif-more-btn {
  color: #9e9e9e !important;
  margin: -4px -6px 0 0;
}

.notif-menu-list {
  min-width: 160px;
}

.notif-divider {
  height: 1px;
  background: #ececf0;
  margin: 0 14px 0 52px;
}

.notif-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.accept-notif-btn {
  border-radius: 999px;
  background-color: #4b1e5a !important;
  color: #ffffff !important;
  font-size: 12px;
  font-weight: 600;
  padding: 0 16px;
}

.reject-notif-btn {
  border-radius: 999px;
  color: #666666;
  font-size: 12px;
}
</style>
