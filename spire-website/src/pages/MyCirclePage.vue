<template>
  <q-page class="circle-dash">
    <div class="circle-dash__shell">
      <!-- Left sidebar -->
      <aside class="circle-sidebar" aria-label="Circle navigation">
        <h2 class="circle-sidebar__title">
          Manage my circle
        </h2>
        <div class="circle-sidebar__divider" />

        <nav class="circle-sidebar__nav" aria-label="Manage sections">
          <div
            class="circle-sidebar__item circle-sidebar__item--active"
            aria-current="page"
          >
            <div class="circle-sidebar__item-main">
              <q-icon name="forward_to_inbox" size="22px" class="circle-sidebar__icon" aria-hidden="true" />
              <span class="circle-sidebar__label">Invitations</span>
            </div>
            <span v-if="!communityLoading" class="circle-sidebar__badge">{{ visibleCommunityUsers.length }}</span>
          </div>

          <div class="circle-sidebar__item circle-sidebar__item--muted" aria-disabled="true">
            <div class="circle-sidebar__item-main">
              <q-icon name="people" size="22px" class="circle-sidebar__icon" aria-hidden="true" />
              <span class="circle-sidebar__label">Connections</span>
            </div>
            <span v-if="!communityLoading" class="circle-sidebar__badge">{{ outgoingPendingReceiverIds.length }}</span>
          </div>
        </nav>
      </aside>

      <!-- Main -->
      <section class="circle-main" aria-labelledby="circle-invitations-heading">
        <header class="circle-main__top">
          <h1 id="circle-invitations-heading" class="circle-main__heading">
            Invitations ({{ visibleCommunityUsers.length }})
          </h1>
          <q-btn
            flat
            dense
            no-caps
            class="circle-main__show-all"
            label="Show All"
            aria-label="Clear search and show all"
            @click="circleSearch = ''"
          />
        </header>
        <div class="circle-main__divider" />

        <div class="circle-main__search-wrap">
          <q-input
            v-model="circleSearch"
            dense
            outlined
            placeholder="Search for friends"
            class="circle-main__search"
          >
            <template #prepend>
              <q-icon name="search" class="circle-main__search-icon" />
            </template>
            <template v-if="circleSearch" #append>
              <q-btn
                round
                dense
                flat
                icon="close"
                class="circle-main__search-clear"
                tabindex="-1"
                aria-label="Clear search"
                @click.stop="circleSearch = ''"
              />
            </template>
          </q-input>
        </div>

        <div v-if="communityLoading" class="circle-main__state">
          <p>Loading…</p>
        </div>
        <div v-else-if="!visibleCommunityUsers.length" class="circle-main__state circle-main__state--soft">
          <p>No other members to show yet.</p>
        </div>
        <div v-else-if="!filteredCommunityUsers.length" class="circle-main__state circle-main__state--soft">
          <p>No members match your search.</p>
        </div>
        <div v-else class="circle-main__list">
          <article
            v-for="member in filteredCommunityUsers"
            :key="member.id"
            class="member-row"
          >
            <div class="member-row__left">
              <q-avatar size="80px" class="member-row__avatar">
                <img v-if="member.profilePhotoUrl" :src="member.profilePhotoUrl" alt="" class="member-row__avatar-img">
                <span v-else>{{ member.initials }}</span>
              </q-avatar>
              <div class="member-row__text">
                <div class="member-row__name" @click.stop="openProfile(member.id)">
                  {{ displayName(member.name) }}
                </div>
                <div class="member-row__role">
                  {{ displayName(member.role) }}
                </div>
              </div>
            </div>
            <div class="member-row__actions">
              <q-btn
                no-caps
                unelevated
                class="circle-action-btn circle-action-btn--primary"
                :label="isPendingTo(member.id) ? 'Pending' : 'Connect'"
                :disable="isPendingTo(member.id)"
                :loading="followLoadingId === member.id"
                @click.stop="followUser(member)"
              />
              <q-btn
                no-caps
                unelevated
                class="circle-action-btn circle-action-btn--primary"
                label="Remove"
                @click.stop="removeFromCommunity(member.id)"
              />
            </div>
          </article>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import {
  listAllUsersExcept,
  listOutgoingPendingFriendRequests,
  sendFriendRequest,
} from 'src/services/userService'
import { capitalizeProseWords } from 'src/utils/textFormat'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

const communityLoading = ref(true)
const communityMembers = ref([])
const dismissedIds = ref([])
const outgoingPendingReceiverIds = ref([])
const followLoadingId = ref(null)
const circleSearch = ref('')

function displayName(text) {
  return capitalizeProseWords(text || '')
}

function userInitials(name) {
  const parts = (name || '').trim().split(' ')
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
}

const visibleCommunityUsers = computed(() =>
  communityMembers.value.filter((m) => !dismissedIds.value.includes(m.id)),
)

const filteredCommunityUsers = computed(() => {
  const q = circleSearch.value.trim().toLowerCase()
  if (!q) return visibleCommunityUsers.value
  return visibleCommunityUsers.value.filter(
    (m) =>
      (m.name || '').toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q),
  )
})

function isPendingTo(userId) {
  return outgoingPendingReceiverIds.value.includes(userId)
}

function openProfile(userId) {
  router.push(`/peer/${userId}`)
}

async function loadCommunity() {
  const uid = authStore.user?.uid
  if (!uid) {
    communityLoading.value = false
    communityMembers.value = []
    return
  }
  communityLoading.value = true
  try {
    const [users, outgoing] = await Promise.all([
      listAllUsersExcept(uid),
      listOutgoingPendingFriendRequests(uid),
    ])
    outgoingPendingReceiverIds.value = outgoing.map((r) => r.receiverId)
    communityMembers.value = users.map((u) => {
      const name = u.name || 'User'
      return {
        id: u.id,
        name,
        role: u.speciality || u.fieldDescription || 'Job Seeker',
        initials: userInitials(name),
        profilePhotoUrl: u.profilePhotoUrl || '',
      }
    })
  } catch (e) {
    console.error(e)
    communityMembers.value = []
    $q.notify({
      type: 'negative',
      message: e?.message || 'Could not load community',
      position: 'top',
    })
  } finally {
    communityLoading.value = false
  }
}

onMounted(() => {
  loadCommunity()
})

async function followUser(member) {
  if (!authStore.user?.uid || isPendingTo(member.id)) return
  followLoadingId.value = member.id
  try {
    await sendFriendRequest(authStore.user.uid, member.id)
    outgoingPendingReceiverIds.value = [...outgoingPendingReceiverIds.value, member.id]
    $q.notify({ type: 'positive', message: 'Request sent', position: 'top' })
  } catch (e) {
    console.error(e)
    const code = e?.code || ''
    let msg = e?.message || 'Could not send request'
    if (code === 'permission-denied') {
      msg =
        'Permission denied. Deploy Firestore rules (notifications + friendRequests) in Firebase Console.'
    }
    if (String(msg).includes('index')) {
      msg = 'Database index required — check the Firebase console link in the browser devtools console.'
    }
    $q.notify({
      type: 'negative',
      message: msg,
      position: 'top',
    })
  } finally {
    followLoadingId.value = null
  }
}

function removeFromCommunity(userId) {
  if (!dismissedIds.value.includes(userId)) {
    dismissedIds.value = [...dismissedIds.value, userId]
  }
}
</script>

<style scoped>
.circle-dash {
  --circle-purple: #3d0b52;
  --circle-bg: #f3f4f7;
  background: var(--circle-bg);
  min-height: 100%;
  padding: clamp(20px, 3vw, 36px) var(--spire-layout-gutter);
  padding-bottom: calc(28px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.circle-dash__shell {
  width: 100%;
  max-width: min(1280px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 264px) minmax(0, 1fr);
  gap: clamp(20px, 3vw, 36px);
  align-items: start;
}

/* Sidebar card */
.circle-sidebar {
  background: var(--circle-purple);
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 18px 48px rgba(61, 11, 82, 0.35);
  width: 100%;
  max-width: 270px;
  box-sizing: border-box;
}

.circle-sidebar__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.01em;
  line-height: 1.3;
}

.circle-sidebar__divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.22);
  margin: 18px 0 16px;
}

.circle-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.circle-sidebar__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  transition:
    background-color 0.2s ease,
    transform 0.15s ease;
  color: #ffffff;
}

.circle-sidebar__item:not(.circle-sidebar__item--muted):hover {
  background: rgba(255, 255, 255, 0.12);
}

.circle-sidebar__item--active {
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.circle-sidebar__item--muted {
  opacity: 0.72;
  cursor: default;
}

.circle-sidebar__item-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.circle-sidebar__icon {
  flex-shrink: 0;
  opacity: 0.95;
}

.circle-sidebar__label {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
}

.circle-sidebar__badge {
  flex-shrink: 0;
  min-width: 26px;
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Main column */
.circle-main {
  min-width: 0;
  background: transparent;
}

.circle-main__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 4px;
}

.circle-main__heading {
  margin: 0;
  font-size: clamp(20px, 2.4vw, 24px);
  font-weight: 800;
  color: #1a1520;
  letter-spacing: -0.02em;
}

.circle-main__show-all {
  font-size: 14px;
  font-weight: 600;
  color: var(--circle-purple) !important;
  letter-spacing: 0.02em;
}

.circle-main__show-all:hover {
  background: rgba(61, 11, 82, 0.08) !important;
}

.circle-main__divider {
  height: 1px;
  background: rgba(26, 21, 32, 0.12);
  margin: 14px 0 20px;
  width: 100%;
}

.circle-main__search-wrap {
  margin-bottom: 22px;
}

.circle-main__search :deep(.q-field__control) {
  border-radius: 999px;
  background: #ffffff;
  min-height: 44px;
}

.circle-main__search :deep(.q-field__native),
.circle-main__search :deep(.q-placeholder) {
  color: #1e1e1e;
}

.circle-main__search-icon {
  color: #6b7280;
}

.circle-main__search-clear {
  color: #6b7280 !important;
}

.circle-main__state {
  margin-top: 8px;
  text-align: center;
  font-size: 15px;
  color: #5c5563;
  padding: 32px 16px;
}

.circle-main__state--soft {
  color: #6d6575;
}

.circle-main__list {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(26, 21, 32, 0.06);
  box-shadow: 0 8px 28px rgba(15, 15, 30, 0.06);
  overflow: hidden;
}

.member-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: clamp(16px, 3vw, 28px);
  flex-wrap: wrap;
  min-height: 118px;
  padding: clamp(16px, 2.5vw, 22px) clamp(18px, 2.5vw, 28px);
  background: #ffffff;
  border-bottom: 1px solid rgba(26, 21, 32, 0.08);
  transition: background-color 0.2s ease;
}

.member-row:last-child {
  border-bottom: none;
}

.member-row:hover {
  background: #fafafc;
}

.member-row__left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(14px, 2vw, 22px);
  min-width: 0;
  flex: 1 1 240px;
}

.member-row__avatar {
  background-color: var(--circle-purple);
  color: #ffffff;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(61, 11, 82, 0.25);
}

.member-row__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-row__text {
  flex: 1;
  min-width: 0;
}

.member-row__name {
  font-size: 17px;
  font-weight: 700;
  color: #1a1520;
  cursor: pointer;
  line-height: 1.25;
  transition: color 0.2s ease;
}

.member-row__name:hover {
  color: var(--circle-purple);
}

.member-row__role {
  margin-top: 6px;
  font-size: 14px;
  color: #6d6575;
  line-height: 1.35;
}

.member-row__actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex: 0 1 auto;
}

.circle-action-btn {
  border-radius: 999px !important;
  min-height: 42px !important;
  padding: 0 22px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  min-width: 112px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease !important;
}

.circle-action-btn--primary {
  background: var(--circle-purple) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 14px rgba(61, 11, 82, 0.35);
}

.circle-action-btn--primary:hover:not(.q-btn--disabled):not(:disabled) {
  background: #4f1568 !important;
  box-shadow: 0 6px 18px rgba(61, 11, 82, 0.42);
  transform: translateY(-1px);
}

.circle-action-btn--primary.q-btn--disabled {
  opacity: 0.55;
  box-shadow: none;
}

@media (max-width: 1100px) {
  .circle-sidebar {
    max-width: 240px;
  }
}

@media (max-width: 900px) {
  .circle-dash__shell {
    grid-template-columns: 1fr;
  }

  .circle-sidebar {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .circle-dash {
    padding-left: clamp(12px, 4vw, 16px);
    padding-right: clamp(12px, 4vw, 16px);
  }

  .member-row {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
  }

  .member-row__left {
    flex: 1 1 auto;
  }

  .member-row__actions {
    width: 100%;
    justify-content: stretch;
  }

  .member-row__actions :deep(.q-btn) {
    flex: 1 1 50%;
    min-width: 0 !important;
  }
}
</style>
