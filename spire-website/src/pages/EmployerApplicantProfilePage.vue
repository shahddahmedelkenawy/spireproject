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
          @click="$router.back()"
        />
      </div>

      <div v-if="loading" class="jsp-loading--shared">
        <q-spinner color="primary" size="40px" />
        <p class="loading-text--shared">Loading applicant…</p>
      </div>
      <div
        v-else-if="notFound"
        class="pvs-empty-hint"
        style="text-align: center; padding: 32px 16px"
      >
        Application not found.
      </div>
      <template v-else>
        <div class="pvs-profile-card pvs-profile-card--hero">
          <div class="pvs-hero-center">
            <div class="pvs-hero-avatar-wrap">
              <q-avatar size="96px" class="pvs-hero-avatar">
                <img
                  v-if="applicant.profilePhotoUrl"
                  :src="applicant.profilePhotoUrl"
                  alt=""
                  class="pvs-hero-avatar-img"
                >
                <span v-else>{{ applicant.initials }}</span>
              </q-avatar>
            </div>
            <h1 class="pvs-hero-name">{{ applicant.name }}</h1>
            <p class="pvs-hero-title">{{ applicant.role }}</p>
            <div v-if="applicant.location" class="pvs-hero-meta-row">
              <q-icon name="place" size="18px" class="pvs-meta-icon" />
              <span>{{ applicant.location }}</span>
            </div>
            <div v-if="applicant.email" class="pvs-hero-meta-row">
              <q-icon name="email" size="18px" class="pvs-meta-icon" />
              <span class="pvs-meta-email">{{ applicant.email }}</span>
            </div>
            <div
              v-if="applicationRecord?.jobTitle"
              class="pvs-hero-meta-row"
            >
              <q-icon name="work" size="18px" class="pvs-meta-icon" />
              <span>Applied: {{ applicationRecord.jobTitle }}</span>
            </div>
            <div class="pvs-hero-actions">
              <q-btn
                no-caps
                unelevated
                class="pvs-cta-pill"
                label="Message"
                @click="openChat"
              />
              <q-btn
                no-caps
                unelevated
                outline
                class="pvs-cta-pill pvs-cta-pill--outline"
                label="View full profile"
                @click="viewFullProfile"
              />
            </div>
          </div>
        </div>

        <div class="pvs-profile-card">
          <div class="pvs-card-head">
            <h2 class="pvs-card-title">Documents</h2>
          </div>
          <div v-for="doc in docs" :key="doc.name" class="pvs-file-row">
            <span class="pvs-about-text" style="margin: 0">{{ doc.name }}</span>
            <q-btn
              flat
              no-caps
              dense
              :disable="!doc.url"
              :class="['pvs-file-link', { 'pvs-file-link--disabled': !doc.url }]"
              :label="doc.url ? 'Open' : '—'"
              @click="openDocument(doc.url)"
            />
          </div>
        </div>

        <div class="pvs-profile-card">
          <div class="pvs-card-head">
            <h2 class="pvs-card-title">Summary</h2>
          </div>
          <p class="pvs-about-text">{{ summaryText }}</p>
        </div>

        <div class="pvs-profile-card">
          <div class="pvs-card-head">
            <h2 class="pvs-card-title">Cover letter</h2>
          </div>
          <p class="pvs-about-text">{{ coverLetterText }}</p>
        </div>

        <div class="pvs-profile-card">
          <div class="pvs-card-head">
            <h2 class="pvs-card-title">Applicant rating</h2>
          </div>
          <div class="pvs-rating-block">
            <q-rating
              :model-value="ratingDisplay"
              size="30px"
              color="amber"
              readonly
              max="5"
            />
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import { getApplicationsForEmployer } from 'src/services/applicationService'
import { getMedicalProfileByUser } from 'src/services/iqTestService'
import { getUserProfile } from 'src/services/userService'
import { getRatingsForUser } from 'src/services/ratingService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const applicationRecord = ref(null)
const seekerProfile = ref(null)
const ratingDisplay = ref(0)
const loading = ref(true)
const notFound = ref(false)
const appId = computed(() => String(route.params.id))
const applicant = ref({
  id: '',
  name: 'Applicant',
  role: 'Job seeker',
  location: '',
  email: '',
  initials: 'AP',
  jobSeekerId: '',
  profilePhotoUrl: '',
})
const docs = ref([{ name: 'No documents available', url: null }])

const summaryText = computed(() => {
  const p = seekerProfile.value
  if (!p) return 'No profile summary available.'
  const parts = [p.speciality, p.education].filter((x) => x && String(x).trim())
  return parts.length
    ? parts.join(' · ')
    : 'This applicant has not added a detailed summary yet.'
})

const coverLetterText = computed(() => {
  const ans = applicationRecord.value?.answers
  if (!ans || typeof ans !== 'object') {
    return 'No cover letter was submitted with this application.'
  }
  const letter = ans.coverLetter || ans.letter || ans.message || ans.text
  return letter && String(letter).trim()
    ? String(letter).trim()
    : 'No cover letter was submitted with this application.'
})

function applicantInitials(name) {
  const parts = String(name || '').trim().split(' ')
  if (!parts.length) return 'AP'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

async function loadApplicant() {
  if (!authStore.user?.uid) {
    notFound.value = true
    return
  }
  const apps = await getApplicationsForEmployer(authStore.user.uid)
  const match = apps.find((a) => String(a.id) === appId.value)
  if (!match) {
    notFound.value = true
    return
  }
  notFound.value = false
  applicationRecord.value = match
  seekerProfile.value = await getUserProfile(match.jobSeekerId)
  const displayName =
    seekerProfile.value?.name || match.applicantName || match.name || 'Applicant'
  applicant.value = {
    ...match,
    name: displayName,
    role:
      seekerProfile.value?.speciality ||
      seekerProfile.value?.fieldDescription ||
      'Job seeker',
    location: seekerProfile.value?.address || match.location || '',
    email: seekerProfile.value?.email || match.email || '',
    initials: applicantInitials(displayName),
    jobSeekerId: match.jobSeekerId,
    profilePhotoUrl:
      match.profilePhotoUrl || seekerProfile.value?.profilePhotoUrl || '',
  }

  const medicalProfile = await getMedicalProfileByUser(match.jobSeekerId)
  const docList = []
  if (seekerProfile.value?.cvFile) {
    docList.push({ name: 'CV', url: seekerProfile.value.cvFile })
  }
  if (medicalProfile?.medicalReportFile) {
    docList.push({ name: 'Medical report', url: medicalProfile.medicalReportFile })
  }
  if (medicalProfile?.disabilityCardFile) {
    docList.push({ name: 'Disability card', url: medicalProfile.disabilityCardFile })
  }
  docs.value = docList.length
    ? docList
    : [{ name: 'No documents available', url: null }]

  const ratings = await getRatingsForUser(match.jobSeekerId)
  if (ratings.length) {
    const avg = ratings.reduce((s, r) => s + (Number(r.rating) || 0), 0) / ratings.length
    ratingDisplay.value = Math.min(5, Math.max(0, Math.round(avg * 2) / 2))
  } else {
    ratingDisplay.value = 0
  }
}

function openChat() {
  if (!applicant.value.jobSeekerId) return
  router.push({
    path: `/employer/messages/chat/${encodeURIComponent(applicant.value.jobSeekerId)}`,
  })
}

function viewFullProfile() {
  if (!applicant.value.jobSeekerId) return
  router.push(
    `/employer/user/${encodeURIComponent(applicant.value.jobSeekerId)}`,
  )
}

function openDocument(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(async () => {
  loading.value = true
  try {
    await loadApplicant()
  } finally {
    loading.value = false
  }
})
</script>
