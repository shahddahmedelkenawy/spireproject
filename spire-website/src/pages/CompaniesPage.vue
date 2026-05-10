<template>
  <q-page class="page">
    <div class="page-content">
      <h2 class="page-title">Companies</h2>
      <p v-if="loading" class="page-sub">Loading…</p>
      <p v-else-if="!companies.length" class="page-sub">No companies registered yet.</p>
      <q-card v-for="c in companies" :key="c.id" class="card">
        <div class="name">{{ c.name || 'Company' }}</div>
        <div class="sub">{{ c.industry || c.type || '' }}</div>
        <div class="sub muted">{{ c.address || c.country || '' }}</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { listAllCompanies } from 'src/services/companyService'

const companies = ref([])
const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    companies.value = await listAllCompanies()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page {
  padding: clamp(16px, 3vw, 28px) 0;
  padding-bottom: max(32px, env(safe-area-inset-bottom));
}

.page-content {
  width: 100%;
  max-width: min(960px, 100%);
  margin: 0 auto;
  box-sizing: border-box;
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

.card {
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.name {
  font-size: 16px;
  font-weight: 600;
  color: #222;
}

.sub {
  font-size: 13px;
  color: #555;
  margin-top: 4px;
}

.sub.muted {
  color: #8a8a8a;
}
</style>
