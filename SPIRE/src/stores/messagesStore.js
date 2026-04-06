import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getChatHistory, sendMessage } from 'src/services/messageService'

export const useMessagesStore = defineStore('messagesApi', () => {
  const chat = ref([])
  const loading = ref(false)

  async function fetchChat(userA, userB) {
    if (!userA || !userB) return
    loading.value = true
    try {
      chat.value = await getChatHistory(userA, userB)
    } finally {
      loading.value = false
    }
  }

  async function postMessage(payload) {
    await sendMessage(payload)
    await fetchChat(payload.senderId, payload.receiverId)
  }

  return {
    chat,
    loading,
    fetchChat,
    postMessage,
  }
})

