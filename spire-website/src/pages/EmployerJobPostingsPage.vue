<template>
  <q-page class="page">
    <div class="inner">
      <q-btn
        unelevated
        no-caps
        class="post-new-btn"
        label="+ Post a New Job"
        @click="router.push('/employer/post-job/new')"
      />

      <h2 class="section-title">Active Job Postings</h2>

      <div v-if="loading" class="state muted">Loading your job posts…</div>
      <div v-else-if="loadError" class="state error">{{ loadError }}</div>
      <div v-else-if="!companyId" class="state muted">
        Complete your company profile before posting jobs.
      </div>
      <div v-else-if="!activeJobs.length" class="state muted">
        No active postings yet. Create your first job to reach candidates.
      </div>

      <div v-else class="cards">
        <q-card v-for="job in activeJobs" :key="job.id" flat class="job-card">
          <div class="card-body">
            <div class="logo-wrap">
              <img v-if="companyLogo" :src="companyLogo" alt="" class="logo-img" />
              <div v-else class="logo-placeholder">
                <q-icon name="business" size="22px" color="white" />
              </div>
            </div>
            <div class="card-main">
              <div class="job-title">{{ displayTitle(job) }}</div>
              <div class="posted-ago">Posted {{ daysAgoLabel(job.createdAt) }}</div>
            </div>
          </div>
          <div class="card-actions">
            <q-btn
              unelevated
              no-caps
              class="btn-edit"
              icon="edit"
              label="Edit"
              @click="router.push(`/employer/post-job/edit/${job.id}`)"
            />
            <q-btn
              unelevated
              no-caps
              class="btn-delete"
              icon="delete"
              label="Delete"
              :loading="deletingId === job.id"
              @click="confirmDelete(job)"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { getCompanyByOwner } from 'src/services/companyService'
import { listCompanyJobs, deleteJob } from 'src/services/jobService'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(true)
const loadError = ref('')
const companyId = ref('')
const companyLogo = ref('')
const jobs = ref([])
const deletingId = ref(null)

const activeJobs = computed(() =>
  jobs.value.filter((j) => (j.status || 'open') === 'open'),
)

function displayTitle(job) {
  return job.jobTitle || job.title || job.name || 'Untitled role'
}

function daysAgoLabel(createdAt) {
  if (!createdAt) return 'recently'
  let d
  if (typeof createdAt.toDate === 'function') d = createdAt.toDate()
  else if (createdAt.seconds != null) d = new Date(createdAt.seconds * 1000)
  else return 'recently'

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days < 0) return 'today'
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

async function load() {
  loading.value = true
  loadError.value = ''
  companyId.value = ''
  companyLogo.value = ''
  jobs.value = []

  if (!authStore.user?.uid) {
    loading.value = false
    loadError.value = 'Sign in to manage job posts.'
    return
  }

  try {
    const company = await getCompanyByOwner(authStore.user.uid)
    if (!company?.id) {
      loading.value = false
      return
    }
    companyId.value = company.id
    companyLogo.value = company.logo || ''
    jobs.value = await listCompanyJobs(company.id)
  } catch (e) {
    console.error(e)
    loadError.value = e?.message || 'Could not load jobs.'
  } finally {
    loading.value = false
  }
}

function confirmDelete(job) {
  const title = displayTitle(job)
  const jobId = String(job.id)

  $q.dialog({
    title: 'Delete job',
    message: `Remove “${title}”? This cannot be undone.`,
    cancel: true,
    persistent: true,
    ok: { label: 'Delete', color: 'negative', flat: true },
  }).onOk(async () => {
    deletingId.value = jobId
    try {
      await deleteJob(jobId)
      jobs.value = jobs.value.filter((j) => String(j.id) !== jobId)
      $q.notify({ type: 'positive', message: 'Job deleted', position: 'top' })
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        message: e?.message || 'Failed to delete job',
        position: 'top',
      })
    } finally {
      deletingId.value = null
    }
  })
}

watch(
  () => route.path,
  (path) => {
    if (path === '/employer/post-job') load()
  },
  { immediate: true },
)
</script>

<style scoped>
.page {
  background: #f6f6f7;
  font-family: 'Inter', sans-serif;
  min-height: 100%;
  padding-top: env(safe-area-inset-top);
}

.inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px 16px 88px;
  box-sizing: border-box;
}

.post-new-btn {
  width: 100%;
  border-radius: 16px;
  background: #4b1d5a;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  min-height: 48px;
  box-shadow: 0 6px 16px rgba(75, 29, 90, 0.25);
}

.section-title {
  margin: 22px 0 14px;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.state {
  font-size: 14px;
  line-height: 1.45;
  padding: 8px 0;
}

.state.muted {
  color: #8a8a8a;
}

.state.error {
  color: #c62828;
}

.cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.job-card {
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  padding: 14px;
  overflow: hidden;
}

.card-body {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.logo-wrap {
  flex-shrink: 0;
}

.logo-img {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  display: block;
}

.logo-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #4b1d5a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-main {
  flex: 1;
  min-width: 0;
}

.job-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.posted-ago {
  margin-top: 4px;
  font-size: 12px;
  color: #8a8a8a;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.btn-edit {
  flex: 1;
  border-radius: 12px;
  background: #4b1d5a;
  color: #fff;
  font-weight: 600;
  min-height: 40px;
}

.btn-delete {
  flex: 1;
  border-radius: 12px;
  background: #e8e8ea;
  color: #333;
  font-weight: 600;
  min-height: 40px;
}
</style>
