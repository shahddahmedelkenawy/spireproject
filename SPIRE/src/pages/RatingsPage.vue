<template>
  <q-page class="page">
    <div class="inner">
      <h1>Ratings</h1>
      <p v-if="!ratings.length" class="empty">No ratings yet.</p>
      <q-card v-for="item in ratings" :key="item.id" class="card">
        <div class="row">
          <div>
            <div class="name">From: {{ item.fromUserName || item.fromUser }}</div>
            <div class="sub">{{ item.review || 'No review' }}</div>
          </div>
          <q-rating :model-value="item.rating" readonly size="18px" color="amber" />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { getRatingsForUserWithSenderNames } from 'src/services/ratingService'

const authStore = useAuthStore()
const ratings = ref([])

onMounted(async () => {
  if (!authStore.user?.uid) return
  ratings.value = await getRatingsForUserWithSenderNames(authStore.user.uid)
})
</script>

<style scoped>
.page{background:#f6f6f7;min-height:100vh}
.inner{max-width:460px;margin:0 auto;padding:14px}
h1{font-size:20px;font-weight:600;margin:0 0 10px}
.empty{font-size:14px;color:#8A8A8A;margin-bottom:12px}
.card{border-radius:16px;padding:12px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.row{display:flex;justify-content:space-between;align-items:center;gap:10px}
.name{font-size:14px;font-weight:500}
.sub{font-size:13px;color:#8A8A8A}
</style>
