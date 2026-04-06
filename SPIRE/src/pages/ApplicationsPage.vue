<template>
  <q-page class="page">
    <div class="inner">
      <h1>My Applications</h1>
      <p v-if="!applications.length" class="empty">You have not applied to any jobs yet.</p>
      <q-card v-for="app in applications" :key="app.id" class="card">
        <div class="title">{{ app.jobTitle || `Job ID: ${app.jobId}` }}</div>
        <div class="sub" v-if="app.companyName">{{ app.companyName }}</div>
        <div class="sub">Status: {{ app.status }}</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { getApplicationsForJobSeeker } from 'src/services/applicationService'

const authStore = useAuthStore()
const applications = ref([])

onMounted(async () => {
  if (!authStore.user?.uid) return
  applications.value = await getApplicationsForJobSeeker(authStore.user.uid)
})
</script>

<style scoped>
.page{background:#f6f6f7;min-height:100vh}
.inner{max-width:460px;margin:0 auto;padding:14px}
h1{font-size:20px;font-weight:600;margin:0 0 10px}
.empty{font-size:14px;color:#8A8A8A;margin-bottom:12px}
.card{border-radius:16px;padding:12px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.title{font-size:14px;font-weight:500}
.sub{font-size:13px;color:#8a8a8a}
</style>
