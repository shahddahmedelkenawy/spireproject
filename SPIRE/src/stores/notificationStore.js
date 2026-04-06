import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  deleteNotification as deleteNotificationDoc,
  markNotificationRead,
  subscribeNotificationsForUser,
} from 'src/services/notificationService'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  let unsubscribe = null

  function fetchForUser(userId) {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    if (!userId) {
      notifications.value = []
      loading.value = false
      return
    }
    loading.value = true
    unsubscribe = subscribeNotificationsForUser(
      userId,
      (list) => {
        notifications.value = list
        loading.value = false
      },
      () => {
        loading.value = false
      }
    )
  }

  async function markAsRead(id) {
    const item = notifications.value.find((n) => n.id === id)
    if (item) item.read = true
    try {
      await markNotificationRead(id)
    } catch (e) {
      console.warn('markNotificationRead failed:', e)
    }
  }

  async function removeNotification(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
    try {
      await deleteNotificationDoc(id)
    } catch (e) {
      console.warn('deleteNotification failed:', e)
    }
  }

  return {
    notifications,
    loading,
    fetchForUser,
    markAsRead,
    removeNotification,
  }
})
