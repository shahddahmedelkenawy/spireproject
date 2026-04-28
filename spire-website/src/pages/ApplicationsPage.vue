<template>
  <q-page class="applications-page">
    <div class="applications-inner">
      <JobSeekerStickyHeader />

      <section class="page-head">
        <h1 class="page-title">My applications</h1>
        <p class="page-lead">Track jobs you have applied to.</p>
      </section>

      <div v-if="loading" class="state-muted">Loading…</div>
      <div v-else-if="!applications.length" class="empty-card">
        <q-icon name="assignment_outlined" size="40px" class="empty-ic" />
        <p class="empty-text">You have not applied to any jobs yet.</p>
      </div>

      <div v-else class="app-list">
        <q-card
          v-for="app in applications"
          :key="app.id"
          flat
          bordered
          class="app-card"
        >
          <div class="app-card-row">
            <q-avatar rounded class="company-avatar" size="52px">
              <img v-if="app.companyLogo" :src="app.companyLogo" alt="" class="company-img">
              <span v-else>{{ initialsFor(app.companyName) }}</span>
            </q-avatar>
            <div class="app-card-main">
              <div class="job-line">{{ app.jobTitle || `Job ${app.jobId}` }}</div>
              <div v-if="app.companyName" class="company-line">
                <q-icon name="business" size="14px" class="inline-ic" />
                {{ app.companyName }}
              </div>
              <div class="meta-row">
                <q-chip dense class="status-chip" :class="'status-chip--' + statusClass(app.status)">
                  {{ formatStatus(app.status) }}
                </q-chip>
                <span v-if="app.salary !== '' && app.salary != null" class="salary-pill">
                  <q-icon name="payments" size="14px" />
                  {{ app.salary }}
                </span>
              </div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import JobSeekerStickyHeader from 'src/components/JobSeekerStickyHeader.vue'
import { useAuthStore } from 'src/stores/authStore'
import { getApplicationsForJobSeeker } from 'src/services/applicationService'

const authStore = useAuthStore()
const applications = ref([])
const loading = ref(true)

function initialsFor(name) {
  const n = (name || 'Co').trim()
  return n
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CO'
}

function formatStatus(s) {
  const t = (s || 'pending').toString().toLowerCase()
  if (t === 'pending') return 'Pending'
  if (t === 'accepted') return 'Accepted'
  if (t === 'rejected') return 'Not selected'
  return s || '—'
}

function statusClass(s) {
  const t = (s || 'pending').toString().toLowerCase()
  if (t === 'accepted') return 'ok'
  if (t === 'rejected') return 'no'
  return 'wait'
}

onMounted(async () => {
  loading.value = true
  try {
    if (!authStore.user?.uid) {
      applications.value = []
      return
    }
    applications.value = await getApplicationsForJobSeeker(authStore.user.uid)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.applications-page {
  background: #f4f2f6;
  min-height: 100%;
}

.applications-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));
  padding-top: 4px;
}

.page-head {
  margin-bottom: 16px;
}

.page-title {
  margin: 0 0 4px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e1e1e;
  letter-spacing: -0.02em;
}

.page-lead {
  margin: 0;
  font-size: 13px;
  color: #6b6b6b;
  line-height: 1.4;
}

.state-muted {
  font-size: 14px;
  color: #8a8a8a;
  padding: 8px 0;
}

.empty-card {
  text-align: center;
  padding: 28px 16px;
  background: #fff;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.empty-ic {
  color: #4b1e5a;
  opacity: 0.5;
  margin-bottom: 8px;
}

.empty-text {
  margin: 0;
  font-size: 14px;
  color: #6b6b6b;
}

.app-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.app-card {
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 14px 14px 14px 12px;
}

.app-card-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.company-avatar {
  background: #f3e8ff;
  color: #4b1e5a;
  font-weight: 800;
  font-size: 15px;
  flex-shrink: 0;
  border: 1px solid rgba(75, 30, 90, 0.12);
}

.company-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.app-card-main {
  min-width: 0;
  flex: 1;
}

.job-line {
  font-size: 15px;
  font-weight: 700;
  color: #1e1e1e;
  line-height: 1.3;
  margin-bottom: 4px;
}

.company-line {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #5a5a5a;
  margin-bottom: 8px;
}

.inline-ic {
  color: #4b1e5a;
  flex-shrink: 0;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.status-chip {
  font-size: 11px;
  font-weight: 600;
  border-radius: 999px;
}

.status-chip--wait {
  background: #fff8e1;
  color: #8d6b00;
}

.status-chip--ok {
  background: #e8f5e9;
  color: #1b5e20;
}

.status-chip--no {
  background: #fce4ec;
  color: #880e4f;
}

.salary-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4b1e5a;
  font-weight: 500;
}
</style>
