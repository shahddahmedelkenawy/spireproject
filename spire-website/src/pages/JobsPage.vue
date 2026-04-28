<template>
  <q-page class="page">
    <div class="page-content">
      <h2 class="page-title">Jobs</h2>
      <q-input v-model="search" rounded outlined placeholder="Search jobs" class="search" />
      <p v-if="loading" class="page-sub">Loadingâ€¦</p>
      <p v-else-if="!filtered.length" class="page-sub">No jobs found.</p>
      <q-card v-for="job in filtered" :key="job.id" class="card" @click="openJob(job.id)">
        <div class="title">{{ job.title || job.name }}</div>
        <div class="sub">{{ job.companyName }} Â· {{ job.type || 'role' }}</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { listAllJobs } from 'src/services/jobService'
import { getCompany } from 'src/services/companyService'

const router = useRouter()
const jobs = ref([])
const search = ref('')
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    const raw = await listAllJobs()
    const cache = new Map()
    const mapped = []
    for (const job of raw) {
      let companyName = 'Company'
      if (job.companyId) {
        if (!cache.has(job.companyId)) {
          cache.set(job.companyId, await getCompany(job.companyId))
        }
        companyName = cache.get(job.companyId)?.name || companyName
      }
      mapped.push({ ...job, companyName })
    }
    jobs.value = mapped
  } finally {
    loading.value = false
  }
})

const filtered = computed(() =>
  jobs.value.filter((j) =>
    `${j.title || ''} ${j.name || ''} ${j.description || ''} ${j.companyName || ''}`
      .toLowerCase()
      .includes(search.value.toLowerCase())
  )
)

function openJob(id) {
  router.push(`/jobseeker/job/${id}`)
}
</script>

<style scoped>
.page {
  padding: 20px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #2a2a2a;
  margin: 0 0 8px;
}

.page-sub {
  font-size: 15px;
  color: #666;
  margin: 0 0 12px;
}

.search {
  margin-bottom: 12px;
}

.card {
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  cursor: pointer;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #222;
}

.sub {
  font-size: 13px;
  color: #8a8a8a;
  margin-top: 4px;
}
</style>
