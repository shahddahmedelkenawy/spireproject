<template>
  <q-page class="peer-page">
    <div class="peer-inner">
      <header class="peer-header">
        <q-btn flat round dense icon="arrow_back" class="back-btn" @click="router.back()" />
      </header>

      <div v-if="loading" class="empty-hint">Loading profile…</div>
      <div v-else-if="!peer" class="empty-hint">User not found.</div>
      <template v-else>
        <!-- Employer / company -->
        <template v-if="isEmployerPeer">
          <section class="cover-section">
            <div class="cover-gradient" />
            <div class="cover-content cover-content--employer">
              <q-avatar size="88px" class="profile-avatar profile-avatar--lg">
                <img v-if="employerAvatarUrl" :src="employerAvatarUrl" alt="" class="profile-avatar-img">
                <span v-else>{{ companyInitials }}</span>
              </q-avatar>
              <div class="profile-main">
                <p class="profile-badge">Company</p>
                <h1 class="profile-name">{{ displayName(companyDisplayName) }}</h1>
                <p class="profile-field">{{ displayName(peer.name) }}</p>
                <p v-if="company?.industry" class="profile-submeta">{{ company.industry }}</p>
                <p v-if="company?.address || peer.address" class="profile-submeta">
                  {{ company?.address || peer.address }}
                </p>
                <p v-if="company?.email || peer.email" class="profile-submeta profile-email">
                  {{ company?.email || peer.email }}
                </p>
              </div>
            </div>
          </section>

          <div v-if="showMessageCta" class="peer-actions">
            <q-btn
              no-caps
              unelevated
              class="msg-btn"
              icon="chat_bubble_outline"
              label="Message"
              @click="openChat"
            />
          </div>

          <section class="info-section">
            <h2 class="section-title">About the company</h2>
            <p class="section-text">{{ employerAbout }}</p>
          </section>

          <section v-if="companyRules" class="info-section">
            <h2 class="section-title">Rules & policies</h2>
            <p class="section-text">{{ companyRules }}</p>
          </section>

          <section v-if="companyAccessibility" class="info-section">
            <h2 class="section-title">Accessibility</h2>
            <p class="section-text">{{ companyAccessibility }}</p>
          </section>
        </template>

        <!-- Job seeker -->
        <template v-else>
          <section class="cover-section">
            <div class="cover-gradient" />
            <div class="cover-content">
              <q-avatar size="80px" class="profile-avatar">
                <img v-if="peerPhotoUrl" :src="peerPhotoUrl" alt="" class="profile-avatar-img">
                <span v-else>{{ initials }}</span>
              </q-avatar>
              <div class="profile-main">
                <h1 class="profile-name">{{ displayName(peer.name) }}</h1>
                <p class="profile-field">{{ displayName(peer.speciality || peer.fieldDescription || 'Job seeker') }}</p>
                <p v-if="peer.address" class="profile-submeta">{{ peer.address }}</p>
                <p v-if="peer.email" class="profile-submeta profile-email">{{ peer.email }}</p>
                <div class="profile-meta">
                  <span>{{ connectionsDisplay }} connections</span>
                </div>
              </div>
            </div>
          </section>

          <div v-if="showMessageCta" class="peer-actions">
            <q-btn
              no-caps
              unelevated
              class="msg-btn"
              icon="chat_bubble_outline"
              label="Message"
              @click="openChat"
            />
          </div>

          <section class="info-section">
            <h2 class="section-title">About</h2>
            <p class="section-text">{{ aboutText }}</p>
          </section>

          <section v-if="skillsList.length" class="info-section">
            <h2 class="section-title">Skills</h2>
            <div class="skills-row">
              <q-chip v-for="skill in skillsList" :key="skill" outline class="skill-chip">
                {{ skill }}
              </q-chip>
            </div>
          </section>
        </template>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { getCompanyByOwner } from 'src/services/companyService'
import {
  countAcceptedConnectionsForUser,
  getUserProfile,
} from 'src/services/userService'
import { capitalizeProseWords } from 'src/utils/textFormat'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const peer = ref(null)
const company = ref(null)
const connectionCount = ref(0)

const peerUserId = computed(() => String(route.params.userId || ''))

const isEmployerPeer = computed(() => {
  const p = peer.value
  if (!p) return false
  const r = String(p.role || '').toLowerCase()
  if (r === 'employer') return true
  // Legacy accounts: company name present but role missing
  if (!r && p.companyName && String(p.companyName).trim()) return true
  return false
})

const showMessageCta = computed(() => {
  if (!authStore.user?.uid || !peerUserId.value) return false
  if (authStore.user.uid === peerUserId.value) return false
  return true
})

function displayName(text) {
  return capitalizeProseWords(text || '')
}

const initials = computed(() => {
  const parts = (peer.value?.name || '').trim().split(' ')
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
})

const companyInitials = computed(() => {
  const n = companyDisplayName.value || peer.value?.name || ''
  const parts = String(n).trim().split(' ')
  if (!parts.length) return 'CO'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
})

const peerPhotoUrl = computed(() => peer.value?.profilePhotoUrl || '')

const companyDisplayName = computed(() => company.value?.name || peer.value?.name || 'Company')

const employerAvatarUrl = computed(() => company.value?.logo || peer.value?.profilePhotoUrl || '')

const employerAbout = computed(() => {
  const d = company.value?.description
  if (d && String(d).trim()) return String(d).trim()
  if (peer.value?.bio && String(peer.value.bio).trim()) return peer.value.bio
  return 'No company description yet.'
})

const companyRules = computed(() => {
  const r = company.value?.rules
  return r && String(r).trim() ? String(r).trim() : ''
})

const companyAccessibility = computed(() => {
  const a = company.value?.accessibilityFeatures
  return a && String(a).trim() ? String(a).trim() : ''
})

const connectionsDisplay = computed(() => connectionCount.value)

const aboutText = computed(() => {
  const p = peer.value
  if (!p) return ''
  if (p.bio && String(p.bio).trim()) return p.bio
  if (p.speciality && String(p.speciality).trim()) return displayName(p.speciality)
  if (p.education && String(p.education).trim()) return displayName(p.education)
  return 'No additional details yet.'
})

const skillsList = computed(() => {
  const s = peer.value?.skills
  if (Array.isArray(s) && s.length) return s
  return []
})

function openChat() {
  const id = peerUserId.value
  if (!id) return
  if (authStore.userRole === 'employer') {
    router.push(`/employer/messages/chat/${encodeURIComponent(id)}`)
  } else {
    router.push(`/messages/chat/${encodeURIComponent(id)}`)
  }
}

async function loadPeer(userId) {
  if (!userId) {
    peer.value = null
    company.value = null
    loading.value = false
    return
  }
  if (!authStore.isReady) {
    return
  }
  loading.value = true
  company.value = null
  try {
    const data = await getUserProfile(userId)
    peer.value = data
    const role = String(data?.role || '').toLowerCase()
    const treatAsEmployer =
      role === 'employer' || (!role && data?.companyName && String(data.companyName).trim())
    if (data && treatAsEmployer) {
      company.value = await getCompanyByOwner(userId)
    }
    connectionCount.value = await countAcceptedConnectionsForUser(userId)
  } catch (e) {
    console.error(e)
    peer.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => [authStore.isReady, route.params.userId],
  () => {
    loadPeer(peerUserId.value ? String(peerUserId.value) : '')
  },
  { immediate: true },
)
</script>

<style scoped>
.peer-page {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
  background: #f6f6f7;
  min-height: 100%;
}

.peer-inner {
  max-width: 480px;
  margin: 0 auto;
}

.peer-header {
  padding: 8px 8px 0;
}

.back-btn {
  color: #4b1d5a;
}

.peer-actions {
  padding: 0 16px 16px;
}

.msg-btn {
  width: 100%;
  border-radius: 14px;
  background: #4b1d5a;
  color: #fff;
}

.cover-section {
  position: relative;
  padding-bottom: 16px;
}

.cover-gradient {
  height: 120px;
  background: linear-gradient(135deg, #4b1d5a, #6c2b86);
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
}

.cover-content {
  display: flex;
  align-items: flex-end;
  padding: 0 16px;
  margin-top: -48px;
  gap: 12px;
}

.cover-content--employer {
  align-items: flex-start;
}

.profile-avatar {
  background-color: #ffffff;
  color: #4b1d5a;
  font-weight: 700;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.profile-avatar--lg {
  flex-shrink: 0;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-main {
  flex: 1;
  min-width: 0;
}

.profile-badge {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #e8dff5;
  margin: 0 0 4px;
}

.profile-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2px;
}

.profile-field {
  font-size: 13px;
  color: #f3e8ff;
  margin: 0 0 4px;
}

.profile-submeta {
  font-size: 12px;
  color: #e8dff5;
  margin: 0 0 4px;
  word-break: break-word;
}

.profile-email {
  word-break: break-all;
}

.profile-meta {
  font-size: 12px;
  color: #f3e8ff;
}

.info-section {
  padding: 0 16px;
  margin-top: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1e1e1e;
}

.section-text {
  font-size: 13px;
  color: #555555;
  margin: 0;
  white-space: pre-wrap;
}

.skills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-chip {
  border-radius: 999px;
  border-color: #4b1d5a;
  color: #4b1d5a;
  font-size: 11px;
}

.empty-hint {
  text-align: center;
  padding: 24px 16px;
  color: #777777;
  font-size: 14px;
}
</style>
