<template>
  <q-page class="page">
    <div class="inner">
      <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="back" />

      <q-card class="main-card">
        <q-avatar size="88px" class="avatar">
          <img v-if="applicant.profilePhotoUrl" :src="applicant.profilePhotoUrl" alt="" class="avatar-img">
          <span v-else>{{ applicant.initials }}</span>
        </q-avatar>
        <h1 class="name">{{ applicant.name }}</h1>
        <p class="role">{{ applicant.role }}</p>

        <div class="meta"><q-icon name="location_on" /> {{ applicant.location }}</div>
        <div class="meta"><q-icon name="mail_outline" /> {{ applicant.email }}</div>
        <div v-if="applicationRecord?.jobTitle" class="meta"><q-icon name="work" /> Applied: {{ applicationRecord.jobTitle }}</div>

        <div class="applicant-actions">
          <q-btn no-caps class="message-btn" label="Message" @click="openChat" />
          <q-btn
            outline
            no-caps
            color="primary"
            class="profile-btn"
            label="View full profile"
            @click="viewFullProfile"
          />
        </div>
      </q-card>

      <section class="section">
        <h2 class="section-title">Documents</h2>
        <div class="doc-card" v-for="doc in docs" :key="doc.name">
          <span>{{ doc.name }}</span>
          <q-btn
            flat
            no-caps
            color="primary"
            label="Open"
            :disable="!doc.url"
            @click="openDocument(doc.url)"
          />
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">Summary</h2>
        <p class="text">{{ summaryText }}</p>
      </section>

      <section class="section">
        <h2 class="section-title">Cover Letter</h2>
        <p class="text">{{ coverLetterText }}</p>
      </section>

      <section class="section">
        <h2 class="section-title">Applicant Rating</h2>
        <q-rating :model-value="ratingDisplay" size="30px" color="amber" readonly max="5" />
      </section>
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
const appId = computed(() => String(route.params.id))
const applicant = ref({
  id: '',
  name: 'Applicant',
  role: 'Job Seeker',
  location: 'Egypt',
  email: '',
  initials: 'AP',
  jobSeekerId: '',
})
const docs = ref([{ name: 'No documents available', url: null }])

const summaryText = computed(() => {
  const p = seekerProfile.value
  if (!p) return 'No profile summary available.'
  const parts = [p.speciality, p.education].filter((x) => x && String(x).trim())
  return parts.length ? parts.join(' · ') : 'This applicant has not added a detailed summary yet.'
})

const coverLetterText = computed(() => {
  const ans = applicationRecord.value?.answers
  if (!ans || typeof ans !== 'object') return 'No cover letter was submitted with this application.'
  const letter = ans.coverLetter || ans.letter || ans.message || ans.text
  return letter && String(letter).trim() ? String(letter).trim() : 'No cover letter was submitted with this application.'
})

async function loadApplicant() {
  if (!authStore.user?.uid) return
  const apps = await getApplicationsForEmployer(authStore.user.uid)
  const match = apps.find((a) => String(a.id) === appId.value)
  if (!match) return
  applicationRecord.value = match
  applicant.value = match

  seekerProfile.value = await getUserProfile(match.jobSeekerId)
  applicant.value = {
    ...applicant.value,
    profilePhotoUrl: match.profilePhotoUrl || seekerProfile.value?.profilePhotoUrl || '',
  }

  const medicalProfile = await getMedicalProfileByUser(match.jobSeekerId)
  const docList = []
  if (seekerProfile.value?.cvFile) {
    docList.push({ name: 'CV', url: seekerProfile.value.cvFile })
  }
  if (medicalProfile?.medicalReportFile) {
    docList.push({ name: 'medical-report.pdf', url: medicalProfile.medicalReportFile })
  }
  if (medicalProfile?.disabilityCardFile) {
    docList.push({ name: 'disability-card.pdf', url: medicalProfile.disabilityCardFile })
  }
  docs.value = docList.length ? docList : [{ name: 'No documents available', url: null }]

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
  router.push(`/employer/user/${encodeURIComponent(applicant.value.jobSeekerId)}`)
}

function openDocument(url) {
  if (!url) return
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(loadApplicant)
</script>

<style scoped>
.page { background: #F6F6F7; font-family: "Inter", sans-serif; }
.inner { max-width: 460px; margin: 0 auto; padding: 14px; }
.main-card {
  border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); padding: 16px; text-align: center; background: #fff;
}
.avatar { margin: 0 auto 10px; background: #ede7f6; color: #4B1D5A; font-weight: 700; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.name { margin: 0; font-size: 20px; font-weight: 600; }
.role { margin: 4px 0 10px; font-size: 13px; color: #8A8A8A; }
.meta { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; color: #555; margin-top: 6px; }
.applicant-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
.message-btn { width: 100%; border-radius: 999px; background: #4B1D5A; color: #fff; }
.profile-btn { width: 100%; border-radius: 999px; }
.section { margin-top: 20px; }
.section-title { margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #222; }
.doc-card {
  border: 1px solid #ececec; border-radius: 12px; padding: 10px 12px; background: #fff;
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
}
.text { margin: 0; font-size: 13px; color: #555; line-height: 1.6; }
</style>

