<template>
  <q-page class="page">
    <div class="inner">
      <h1>Browse Jobs</h1>
      <q-input v-model="search" rounded outlined placeholder="Search jobs" class="search" />
      <q-card v-for="job in filtered" :key="job.id" class="card" @click="openJob(job.id)">
        <div class="title">{{ job.title }}</div>
        <div class="sub">{{ job.companyName }} • {{ job.type }}</div>
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

onMounted(async () => {
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
})

const filtered = computed(() =>
  jobs.value.filter((j) => `${j.title} ${j.description}`.toLowerCase().includes(search.value.toLowerCase()))
)

function openJob(id) {
  router.push(`/jobseeker/job/${id}`)
}
</script>

<style scoped>
.page{background:#f6f6f7;min-height:100vh}
.inner{max-width:460px;margin:0 auto;padding:14px}
h1{font-size:20px;font-weight:600;margin:0 0 10px}
.search{margin-bottom:10px}
.card{border-radius:16px;padding:12px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.06);cursor:pointer}
.title{font-size:16px;font-weight:500}
.sub{font-size:13px;color:#8a8a8a}
</style>

