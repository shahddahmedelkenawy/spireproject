import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './userStore'
import { useAuthStore } from './authStore'
import {
  acceptFriendRequest,
  listPendingInvitesForUser,
  rejectFriendRequest,
} from 'src/services/userService'

export const useConnectionStore = defineStore('connections', () => {
  const userStore = useUserStore()
  const pendingInvites = ref([])
  const loading = ref(false)

  async function loadPending(userId) {
    if (!userId) {
      pendingInvites.value = []
      return
    }
    loading.value = true
    try {
      pendingInvites.value = await listPendingInvitesForUser(userId)
    } catch (e) {
      console.error('Failed to load invites:', e)
      pendingInvites.value = []
    } finally {
      loading.value = false
    }
  }

  async function acceptInvite(id) {
    await acceptFriendRequest(id)
    pendingInvites.value = pendingInvites.value.filter((item) => item.id !== id)
    userStore.incrementConnections(1)
    const auth = useAuthStore()
    if (auth.user?.uid) await userStore.fetchProfile(auth.user.uid)
  }

  async function ignoreInvite(id) {
    await rejectFriendRequest(id)
    pendingInvites.value = pendingInvites.value.filter((item) => item.id !== id)
  }

  return {
    pendingInvites,
    loading,
    loadPending,
    acceptInvite,
    ignoreInvite,
  }
})
