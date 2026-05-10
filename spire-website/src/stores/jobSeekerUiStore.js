import { defineStore } from 'pinia'
import { ref } from 'vue'

/** UI-only glue between global job seeker navbar and HomePage filter panel. */
export const useJobSeekerUiStore = defineStore('jobSeekerUi', () => {
  const openHomeFiltersEpoch = ref(0)
  /** True when job seeker Messages hub shows full-screen chat on small viewports (layout chrome). */
  const messagesMobileThreadOpen = ref(false)
  /** Active peer when `/messages` hub has a thread open (route may not include peer id). */
  const messagesHubPeerId = ref('')

  function requestOpenHomeFilters() {
    openHomeFiltersEpoch.value += 1
  }

  function setMessagesMobileThreadOpen(open) {
    messagesMobileThreadOpen.value = Boolean(open)
  }

  function setMessagesHubPeerId(id) {
    messagesHubPeerId.value = typeof id === 'string' ? id : ''
  }

  return {
    openHomeFiltersEpoch,
    requestOpenHomeFilters,
    messagesMobileThreadOpen,
    setMessagesMobileThreadOpen,
    messagesHubPeerId,
    setMessagesHubPeerId,
  }
})
