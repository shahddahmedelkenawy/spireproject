<template>
  <q-page class="jsp-page--shared-profile">
    <div class="jsp-inner--shared">
      <div class="peer-top-nav">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          aria-label="Back"
          @click="router.back()"
        />
      </div>

      <div v-if="loading" class="jsp-loading--shared">
        <q-spinner color="primary" size="40px" />
        <p class="loading-text--shared">Loading profile…</p>
      </div>
      <div v-else-if="!peer" class="pvs-empty-hint" style="text-align: center; padding: 32px 16px">
        User not found.
      </div>
      <template v-else>
        <!-- Employer / company (same card layout as job seeker profile) -->
        <template v-if="isEmployerPeer">
          <div class="pvs-profile-card pvs-profile-card--hero">
            <div class="pvs-hero-center">
              <div class="pvs-hero-avatar-wrap">
                <q-avatar size="96px" class="pvs-hero-avatar">
                  <img
                    v-if="employerAvatarUrl"
                    :src="employerAvatarUrl"
                    alt=""
                    class="pvs-hero-avatar-img"
                  >
                  <span v-else>{{ companyInitials }}</span>
                </q-avatar>
              </div>
              <p class="pvs-hero-kicker">Company</p>
              <h1 class="pvs-hero-name">
                {{ displayName(companyDisplayName) }}
              </h1>
              <p class="pvs-hero-title">
                {{ displayName(peer.name) }}
              </p>
              <div v-if="company?.industry" class="pvs-hero-meta-row">
                <q-icon name="business" size="18px" class="pvs-meta-icon" />
                <span>{{ company.industry }}</span>
              </div>
              <div
                v-if="company?.address || peer.address"
                class="pvs-hero-meta-row"
              >
                <q-icon name="place" size="18px" class="pvs-meta-icon" />
                <span>{{ company?.address || peer.address }}</span>
              </div>
              <div
                v-if="company?.email || peer.email"
                class="pvs-hero-meta-row"
              >
                <q-icon name="email" size="18px" class="pvs-meta-icon" />
                <span class="pvs-meta-email">{{
                  company?.email || peer.email
                }}</span>
              </div>
              <q-btn
                v-if="showMessageCta"
                no-caps
                unelevated
                class="pvs-cta-pill"
                icon="chat_bubble_outline"
                label="Message"
                @click="openChat"
              />
            </div>
          </div>

          <div class="pvs-profile-card">
            <div class="pvs-card-head">
              <h2 class="pvs-card-title">About the company</h2>
            </div>
            <p class="pvs-about-text">{{ employerAbout }}</p>
          </div>

          <div v-if="companyRules" class="pvs-profile-card">
            <div class="pvs-card-head">
              <h2 class="pvs-card-title">Rules &amp; policies</h2>
            </div>
            <p class="pvs-about-text">{{ companyRules }}</p>
          </div>

          <div v-if="companyAccessibility" class="pvs-profile-card">
            <div class="pvs-card-head">
              <h2 class="pvs-card-title">Accessibility</h2>
            </div>
            <p class="pvs-about-text">{{ companyAccessibility }}</p>
          </div>
        </template>

        <!-- Job seeker peer -->
        <template v-else>
          <div class="pvs-profile-card pvs-profile-card--hero">
            <div class="pvs-hero-center">
              <div class="pvs-hero-avatar-wrap">
                <q-avatar size="96px" class="pvs-hero-avatar">
                  <img
                    v-if="peerPhotoUrl"
                    :src="peerPhotoUrl"
                    alt=""
                    class="pvs-hero-avatar-img"
                  >
                  <span v-else>{{ initials }}</span>
                </q-avatar>
              </div>
              <h1 class="pvs-hero-name">
                {{ displayName(peer.name) }}
              </h1>
              <p class="pvs-hero-title">
                {{ displayName(peer.speciality || peer.fieldDescription || 'Job seeker') }}
              </p>
              <div v-if="peer.address" class="pvs-hero-meta-row">
                <q-icon name="place" size="18px" class="pvs-meta-icon" />
                <span>{{ peer.address }}</span>
              </div>
              <div v-if="peer.email" class="pvs-hero-meta-row">
                <q-icon name="email" size="18px" class="pvs-meta-icon" />
                <span class="pvs-meta-email">{{ peer.email }}</span>
              </div>
              <p v-if="isOwnPeerProfile" class="pvs-connections-line">
                {{ connectionsDisplay }} connections
              </p>
              <q-btn
                v-if="showMessageCta"
                no-caps
                unelevated
                class="pvs-cta-pill"
                icon="chat_bubble_outline"
                label="Message"
                @click="openChat"
              />
            </div>
          </div>

          <div class="pvs-profile-card">
            <div class="pvs-card-head">
              <h2 class="pvs-card-title">About</h2>
            </div>
            <p class="pvs-about-text">{{ aboutText }}</p>
          </div>

          <div v-if="skillsList.length" class="pvs-profile-card">
            <div class="pvs-card-head">
              <h2 class="pvs-card-title">Skills</h2>
            </div>
            <ul class="pvs-skills-list">
              <li
                v-for="skill in skillsList"
                :key="skill"
                class="pvs-skill-item"
              >
                <span class="pvs-skill-dot" />
                <span>{{ skill }}</span>
              </li>
            </ul>
          </div>
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
  if (!r && p.companyName && String(p.companyName).trim()) return true
  return false
})

const showMessageCta = computed(() => {
  if (!authStore.user?.uid || !peerUserId.value) return false
  if (authStore.user.uid === peerUserId.value) return false
  return true
})

const isOwnPeerProfile = computed(() => {
  const uid = authStore.user?.uid
  return !!(uid && peerUserId.value && uid === peerUserId.value)
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

const companyDisplayName = computed(
  () => company.value?.name || peer.value?.name || 'Company',
)

const employerAvatarUrl = computed(
  () => company.value?.logo || peer.value?.profilePhotoUrl || '',
)

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
      try {
        company.value = await getCompanyByOwner(userId)
      } catch (err) {
        console.error('getCompanyByOwner', err)
        company.value = null
      }
    }
    const viewerId = authStore.user?.uid
    if (viewerId && viewerId === userId) {
      try {
        connectionCount.value = await countAcceptedConnectionsForUser(userId)
      } catch (err) {
        console.error('countAcceptedConnectionsForUser', err)
        connectionCount.value = 0
      }
    } else {
      connectionCount.value = 0
    }
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
