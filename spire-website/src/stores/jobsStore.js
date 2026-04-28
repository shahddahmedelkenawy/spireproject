import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createJob, deleteJob, listAllJobs, updateJob } from 'src/services/jobService'

export const useJobsStore = defineStore('jobsApi', () => {
  const jobs = ref([])
  const loading = ref(false)

  async function fetchJobs() {
    loading.value = true
    try {
      jobs.value = await listAllJobs()
    } finally {
      loading.value = false
    }
  }

  async function addJob(payload) {
    const id = await createJob(payload)
    await fetchJobs()
    return id
  }

  async function editJob(jobId, updates) {
    await updateJob(jobId, updates)
    await fetchJobs()
  }

  async function removeJob(jobId) {
    await deleteJob(jobId)
    await fetchJobs()
  }

  return {
    jobs,
    loading,
    fetchJobs,
    addJob,
    editJob,
    removeJob,
  }
})

