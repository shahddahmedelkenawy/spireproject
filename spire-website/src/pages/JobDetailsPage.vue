<template>
  <q-page class="page">
    <div class="inner">
      <q-btn flat round icon="arrow_back" @click="$router.back()" />
      <q-card class="card">
        <h1>{{ job?.title || job?.name || 'Job Details' }}</h1>
        <p v-if="companyName" class="company">{{ companyName }}</p>
        <p class="sub">{{ job?.description || 'No description available.' }}</p>
        <p class="meta">Type: {{ job?.type || '-' }}</p>
        <p class="meta">Department: {{ job?.department || '-' }}</p>
        <p v-if="job?.salary != null && job?.salary !== ''" class="meta">Salary: {{ job.salary }}</p>
        <q-btn no-caps class="apply-btn" label="Apply now" icon="edit_note" @click="goApply" />
      </q-card>

      <q-card v-if="company && employerOwnerId" class="card card-employer">
        <h2 class="card-title">Employer</h2>
        <p class="company-sub">{{ companyName }}</p>
        <p v-if="companyDescription" class="sub employer-desc">{{ companyDescription }}</p>
        <div class="employer-actions">
          <q-btn
            outline
            no-caps
            color="primary"
            class="employer-btn"
            icon="business"
            label="View profile"
            @click="viewEmployerProfile"
          />
          <q-btn
            no-caps
            unelevated
            class="employer-btn employer-btn--primary"
            icon="chat_bubble_outline"
            label="Message"
            @click="messageEmployer"
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getJobById } from 'src/services/jobService'
import { getCompany } from 'src/services/companyService'
import { useAuthStore } from 'src/stores/authStore'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const job = ref(null)
const company = ref(null)
const companyName = ref('')

const employerOwnerId = computed(() => company.value?.ownerId || '')

const companyDescription = computed(() => {
  const d = company.value?.description
  return d && String(d).trim() ? String(d).trim() : ''
})

onMounted(async () => {
  const j = await getJobById(route.params.id)
  job.value = j
  if (j?.companyId) {
    const c = await getCompany(j.companyId)
    company.value = c
    companyName.value = c?.name || ''
  }
})

function viewEmployerProfile() {
  if (!employerOwnerId.value) return
  router.push(`/peer/${encodeURIComponent(employerOwnerId.value)}`)
}

function messageEmployer() {
  if (!employerOwnerId.value) return
  if (!authStore.user?.uid) {
    $q.notify({ type: 'warning', message: 'Sign in to message the employer', position: 'bottom' })
    router.push('/login')
    return
  }
  router.push(`/messages/chat/${encodeURIComponent(employerOwnerId.value)}`)
}

function goApply() {
  if (!job.value?.id) return
  router.push(`/jobseeker/job/${encodeURIComponent(job.value.id)}/apply`)
}
</script>

<style scoped>
.page {
  background: #f6f6f7;
  min-height: 100vh;
}
.inner {
  max-width: 460px;
  margin: 0 auto;
  padding: 14px;
}
.card {
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}
.card-employer {
  margin-top: 12px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px;
  color: #1e1e1e;
}
.company-sub {
  font-size: 15px;
  font-weight: 600;
  color: #4b1d5a;
  margin: 0 0 6px;
}
h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
}
.company {
  font-size: 14px;
  font-weight: 600;
  color: #4b1d5a;
  margin: 0 0 6px;
}
.sub,
.meta {
  font-size: 13px;
  color: #8a8a8a;
}
.employer-desc {
  margin-bottom: 12px;
  max-height: 96px;
  overflow: hidden;
}
.employer-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.employer-btn {
  border-radius: 12px;
  width: 100%;
}
.employer-btn--primary {
  background: #4b1d5a;
  color: #fff;
}
.apply-btn {
  width: 100%;
  margin-top: 10px;
  border-radius: 999px;
  background: #4b1d5a;
  color: #fff;
}
</style>
