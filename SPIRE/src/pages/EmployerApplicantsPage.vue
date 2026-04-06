<template>
  <q-page class="page">
    <div class="inner">
      <EmployerStickyHeader />
      <div class="title-row">
        <h1 class="title">New Applicants</h1>
        <span class="count">{{ filteredApplicants.length }} of {{ applicants.length }}</span>
      </div>

      <q-input
        v-model="applicantSearch"
        dense
        outlined
        placeholder="Search by name, role, job, email, or location"
        class="applicant-search"
      >
        <template #prepend>
          <q-icon name="search" class="applicant-search-icon" />
        </template>
        <template v-if="applicantSearch" #append>
          <q-btn
            round
            dense
            flat
            icon="close"
            class="applicant-search-clear-btn"
            tabindex="-1"
            @click.stop="applicantSearch = ''"
          />
        </template>
      </q-input>

      <div v-if="!applicants.length" class="empty-state">
        <p>No applications yet.</p>
      </div>
      <div v-else-if="!filteredApplicants.length" class="empty-state">
        <p>No applicants match your search.</p>
      </div>
      <template v-else>
        <EmployerApplicantCard
          v-for="applicant in filteredApplicants"
          :key="applicant.id"
          :applicant="applicant"
          @open="openApplicant"
          @accept="markStatus($event, 'accepted')"
          @reject="markStatus($event, 'rejected')"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmployerApplicantCard from 'src/components/EmployerApplicantCard.vue'
import EmployerStickyHeader from 'src/components/EmployerStickyHeader.vue'
import { useAuthStore } from 'src/stores/authStore'
import { getApplicationsForEmployer, updateApplicationStatus } from 'src/services/applicationService'

const router = useRouter()
const authStore = useAuthStore()
const applicants = ref([])
const applicantSearch = ref('')

function applicantHaystack(a) {
  const parts = [
    a.name,
    a.role,
    a.location,
    a.email,
    a.jobTitle,
    a.status,
    a.jobTypeLabel,
    a.workMode,
    a.initials,
  ]
  return parts
    .map((x) => (x != null ? String(x) : ''))
    .join(' ')
    .toLowerCase()
}

const filteredApplicants = computed(() => {
  const raw = applicantSearch.value.trim().toLowerCase()
  if (!raw) return applicants.value
  const words = raw.split(/\s+/).filter(Boolean)
  return applicants.value.filter((a) => {
    const hay = applicantHaystack(a)
    return words.every((w) => hay.includes(w))
  })
})

function openApplicant(id) {
  router.push(`/employer/applicant/${id}`)
}

async function markStatus(id, status) {
  await updateApplicationStatus(id, status, authStore.user?.uid)
  const item = applicants.value.find((a) => a.id === id)
  if (item) item.status = status
}

onMounted(async () => {
  if (!authStore.user?.uid) return
  applicants.value = await getApplicationsForEmployer(authStore.user.uid)
})
</script>

<style scoped>
.page {
  background: #f6f6f7;
  font-family: 'Inter', sans-serif;
  padding-top: env(safe-area-inset-top);
}

.inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px calc(14px + env(safe-area-inset-bottom));
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e1e1e;
}

.count {
  font-size: 13px;
  color: #8a8a8a;
}

.applicant-search {
  margin-bottom: 16px;
}

.applicant-search :deep(.q-field__control) {
  border-radius: 999px;
  background-color: #4b1d5a;
  color: #ffffff;
}

.applicant-search :deep(.q-field__native),
.applicant-search :deep(.q-placeholder) {
  color: #ffffff;
}

.applicant-search-icon {
  color: #ffffff;
}

.applicant-search-clear-btn {
  color: #ffffff !important;
}

.applicant-search-clear-btn :deep(.q-icon) {
  color: #ffffff !important;
}

.empty-state {
  text-align: center;
  font-size: 14px;
  color: #777777;
  margin-top: 16px;
}
</style>
