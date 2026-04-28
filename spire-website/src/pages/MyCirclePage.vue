<template>
  <q-page class="circle-page">
    <div class="circle-inner">
      <JobSeekerStickyHeader />
      <h1 class="page-title">Grow your circle</h1>

      <q-input
        v-model="circleSearch"
        dense
        outlined
        placeholder="Search for friends"
        class="circle-search"
      >
        <template #prepend>
          <q-icon name="search" class="circle-search-icon" />
        </template>
        <template v-if="circleSearch" #append>
          <q-btn
            round
            dense
            flat
            icon="close"
            class="circle-search-clear-btn"
            tabindex="-1"
            @click.stop="circleSearch = ''"
          />
        </template>
      </q-input>

      <div v-if="communityLoading" class="empty-state">
        <p>Loading…</p>
      </div>
      <div v-else-if="!visibleCommunityUsers.length" class="empty-state empty-state--soft">
        <p>No other members to show yet.</p>
      </div>
      <div v-else-if="!filteredCommunityUsers.length" class="empty-state empty-state--soft">
        <p>No members match your search.</p>
      </div>
      <div v-else class="member-cards">
        <div
          v-for="member in filteredCommunityUsers"
          :key="member.id"
          class="member-card"
        >
          <div class="member-card-inner">
            <q-avatar size="44px" class="member-avatar">
              <img v-if="member.profilePhotoUrl" :src="member.profilePhotoUrl" alt="" class="member-avatar-img">
              <span v-else>{{ member.initials }}</span>
            </q-avatar>
            <div class="member-text">
              <div class="member-name" @click.stop="openProfile(member.id)">
                {{ displayName(member.name) }}
              </div>
              <div class="member-role">
                {{ displayName(member.role) }}
              </div>
            </div>
            <div class="member-actions-row">
              <q-btn
                no-caps
                class="circle-apply-btn"
                :label="isPendingTo(member.id) ? 'Pending' : 'Connect'"
                :disable="isPendingTo(member.id)"
                :loading="followLoadingId === member.id"
                @click.stop="followUser(member)"
              />
              <q-btn
                no-caps
                class="circle-apply-btn circle-apply-btn--outline"
                label="Remove"
                @click.stop="removeFromCommunity(member.id)"
              />
            </div>
          </div>
        </div>
      </div>
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
import JobSeekerStickyHeader from 'src/components/JobSeekerStickyHeader.vue'

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
.circle-page {
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));
  padding-top: env(safe-area-inset-top);
}

.circle-inner {
  max-width: 480px;
  margin: 0 auto;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #1e1e1e;
}

.circle-search {
  margin-bottom: 16px;
}

.circle-search :deep(.q-field__control) {
  border-radius: 999px;
  background-color: #4b1d5a;
  color: #ffffff;
}

.circle-search :deep(.q-field__native),
.circle-search :deep(.q-placeholder) {
  color: #ffffff;
}

.circle-search-icon {
  color: #ffffff;
}

.circle-search-clear-btn {
  color: #ffffff !important;
}

.circle-search-clear-btn :deep(.q-icon) {
  color: #ffffff !important;
}

.member-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-card {
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.member-card-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  flex-wrap: nowrap;
}

.member-text {
  flex: 1;
  min-width: 0;
}

.member-avatar {
  background-color: #4b1d5a;
  color: #ffffff;
  font-weight: 700;
}

.member-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-name {
  font-size: 15px;
  font-weight: 600;
  color: #1e1e1e;
  cursor: pointer;
}

.member-role {
  font-size: 12px;
  color: #777777;
}

.member-actions-row {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 8px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

/* Match JobCard.vue `.apply-btn`; outline variant for Remove; equal width */
.circle-apply-btn {
  border-radius: 999px;
  padding: 0 12px;
  height: 36px;
  min-height: 36px;
  min-width: 96px;
  flex: 1 1 0;
  max-width: 120px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.circle-apply-btn:not(.circle-apply-btn--outline) {
  background-color: #4b1e5a;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(75, 30, 90, 0.35);
}

.circle-apply-btn:not(.circle-apply-btn--outline):hover,
.circle-apply-btn:not(.circle-apply-btn--outline):focus-visible {
  background-color: #ffffff;
  color: #4b1e5a;
  border: 1px solid #4b1e5a;
  box-shadow: 0 6px 16px rgba(75, 30, 90, 0.4);
}

.circle-apply-btn.q-btn--disabled:not(.circle-apply-btn--outline) {
  opacity: 0.55;
  box-shadow: none;
}

.circle-apply-btn--outline {
  background-color: #ffffff;
  color: #4b1e5a;
  border: 1px solid #4b1e5a;
  box-shadow: 0 4px 12px rgba(75, 30, 90, 0.2);
}

.circle-apply-btn--outline:hover,
.circle-apply-btn--outline:focus-visible {
  background-color: #4b1e5a;
  color: #ffffff;
  border: 1px solid #4b1e5a;
  box-shadow: 0 6px 16px rgba(75, 30, 90, 0.4);
}

.empty-state {
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: #777777;
}

.empty-state--soft {
  margin-top: 8px;
}
</style>
