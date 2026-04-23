<template>
  <q-page class="page">
    <div class="inner">
      <h1>Friend Requests</h1>
      <p v-if="!requests.length" class="empty">No friend requests right now.</p>
      <q-card v-for="r in requests" :key="r.id" class="card">
        <div class="row">
          <div>
            <div class="name">{{ r.senderName }}</div>
            <div class="sub">Status: {{ r.status }}</div>
          </div>
          <div v-if="r.status === 'pending'" class="actions">
            <q-btn flat no-caps color="positive" label="Accept" @click="update(r.id, 'accepted')" />
            <q-btn flat no-caps color="negative" label="Reject" @click="update(r.id, 'rejected')" />
          </div>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import {
  listFriendRequestsForUser,
  getUserProfile,
  acceptFriendRequest,
  rejectFriendRequest,
} from 'src/services/userService'

const authStore = useAuthStore()
const requests = ref([])

async function fetchRequests() {
  if (!authStore.user?.uid) return
  const raw = await listFriendRequestsForUser(authStore.user.uid)
  const enriched = await Promise.all(
    raw.map(async (r) => {
      const p = await getUserProfile(r.senderId)
      return {
        ...r,
        senderName: p?.name || r.senderId,
      }
    })
  )
  requests.value = enriched
}

async function update(id, status) {
  if (status === 'accepted') await acceptFriendRequest(id)
  else await rejectFriendRequest(id)
  await fetchRequests()
}

onMounted(fetchRequests)
</script>

<style scoped>
.page{background:#f6f6f7;min-height:100vh}
.inner{max-width:460px;margin:0 auto;padding:14px}
h1{font-size:20px;font-weight:600;margin:0 0 10px}
.empty{font-size:14px;color:#8A8A8A;margin-bottom:12px}
.card{border-radius:16px;padding:12px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.name{font-size:16px;font-weight:500}
.sub{font-size:13px;color:#8A8A8A}
.actions{display:flex;gap:4px}
</style>
