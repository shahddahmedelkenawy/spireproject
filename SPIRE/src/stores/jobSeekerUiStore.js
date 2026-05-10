import { defineStore } from 'pinia'
import { ref } from 'vue'

/** UI-only glue between global job seeker navbar and HomePage filter panel. */
export const useJobSeekerUiStore = defineStore('jobSeekerUi', () => {
  const openHomeFiltersEpoch = ref(0)

  function requestOpenHomeFilters() {
    openHomeFiltersEpoch.value += 1
  }

  return {
    openHomeFiltersEpoch,
    requestOpenHomeFilters,
  }
})
