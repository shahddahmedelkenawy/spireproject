import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Sync employer sidebar/nav search with EmployerDashboard filters (same filters, shared query string). */
export const useEmployerUiStore = defineStore('employerUi', () => {
  const dashboardApplicantSearch = ref('')
  const openDashboardFiltersEpoch = ref(0)

  function setDashboardApplicantSearch(v) {
    dashboardApplicantSearch.value = typeof v === 'string' ? v : ''
  }

  function requestOpenDashboardFilters() {
    openDashboardFiltersEpoch.value += 1
  }

  return {
    dashboardApplicantSearch,
    openDashboardFiltersEpoch,
    setDashboardApplicantSearch,
    requestOpenDashboardFilters,
  }
})
