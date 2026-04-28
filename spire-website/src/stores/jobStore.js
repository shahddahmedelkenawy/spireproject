import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { listAllJobs } from 'src/services/jobService'
import { getCompany } from 'src/services/companyService'

export const useJobStore = defineStore('jobs', () => {
  const search = ref('')
  const loading = ref(false)
  const loadError = ref('')

  const filters = ref({
    datePosted: null,
    location: null,
    experienceLevel: null,
    companyType: null,
    workMode: null,
    jobType: null,
    accessibilityPolicy: null,
  })

  const jobs = ref([])

  function setSearch(term) {
    search.value = term
  }

  function setFilter(key, value) {
    if (Object.prototype.hasOwnProperty.call(filters.value, key)) {
      filters.value[key] = value
    }
  }

  function clearFilters() {
    Object.keys(filters.value).forEach((key) => {
      filters.value[key] = null
    })
  }

  function mapDatePosted(createdAt) {
    if (!createdAt?.toDate) return 'Last 30 days'
    const created = createdAt.toDate()
    const now = new Date()
    const days = Math.floor((now - created) / (1000 * 60 * 60 * 24))
    if (days <= 1) return 'Last 24 hours'
    if (days <= 7) return 'Last 7 days'
    if (days <= 14) return 'Last 14 days'
    return 'Last 30 days'
  }

  function mapDbJobTypeToFormLabel(type) {
    const t = (type || 'fulltime').toLowerCase()
    if (t === 'parttime') return 'Part Time'
    if (t === 'freelancer') return 'Freelancer'
    if (t === 'volunteer') return 'Volunteer'
    return 'Full Time'
  }

  function capFirstEachWord(value) {
    if (!value) return ''
    return String(value)
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')
  }

  function mapCompanyTypeForFilter(company) {
    const t = String(company?.type || '').toLowerCase()
    if (t === 'government') return 'Governmental'
    if (t === 'private') return 'Private'
    if (t === 'nonprofit' || t === 'non-profit' || t === 'non profit') return 'Non profit'
    if (!company?.type) return 'Corporate'
    return capFirstEachWord(String(company.type))
  }

  function toHomeJobShape(job, company) {
    const companyName = company?.name || 'Unknown Company'
    const logoInitials = companyName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()

    const accessibility = job.accessibilityFeatures || 'Inclusive Workplace'
    const tags = accessibility
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const wm = job.accessibilityFeatures || ''
    const workMode = wm === 'Flexible' ? 'Flexible hours' : String(wm).trim()
    return {
      id: job.id,
      title: job.title || job.name || 'Untitled Job',
      company: companyName,
      location: job.department || company?.address || 'Remote',
      type: capFirstEachWord(job.type || 'fulltime'),
      datePosted: mapDatePosted(job.createdAt),
      experienceLevel: 'Mid level',
      companyType: mapCompanyTypeForFilter(company),
      workMode,
      jobType: mapDbJobTypeToFormLabel(job.type),
      accessibilityPolicy: tags[0] || 'Inclusive Workplace',
      accessibilityTags: tags.length ? tags : ['Inclusive Workplace'],
      logoInitials: logoInitials || 'SP',
    }
  }

  async function fetchJobsFromDb() {
    loading.value = true
    loadError.value = ''
    try {
      const dbJobs = await listAllJobs()
      const companyCache = new Map()

      const mapped = []
      for (const job of dbJobs) {
        let company = null
        if (job.companyId) {
          if (!companyCache.has(job.companyId)) {
            const c = await getCompany(job.companyId)
            companyCache.set(job.companyId, c)
          }
          company = companyCache.get(job.companyId)
        }
        mapped.push(toHomeJobShape(job, company))
      }
      jobs.value = mapped
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      loadError.value = error?.message || 'Failed to load jobs'
      jobs.value = []
    } finally {
      loading.value = false
    }
  }

  const filteredJobs = computed(() => {
    const term = search.value.trim().toLowerCase()
    return jobs.value.filter((job) => {
      if (term) {
        const haystack = `${job.title} ${job.company} ${job.location}`.toLowerCase()
        if (!haystack.includes(term)) return false
      }

      const {
        datePosted,
        location,
        experienceLevel,
        companyType,
        workMode,
        jobType,
        accessibilityPolicy,
      } = filters.value

      if (datePosted && job.datePosted !== datePosted) return false
      if (location && !job.location.toLowerCase().includes(location.toLowerCase())) return false
      if (experienceLevel && job.experienceLevel !== experienceLevel) return false
      if (companyType && job.companyType !== companyType) return false
      if (workMode && String(job.workMode || '') !== workMode) return false
      if (jobType && job.jobType !== jobType) return false
      if (accessibilityPolicy && job.accessibilityPolicy !== accessibilityPolicy) return false

      return true
    })
  })

  return {
    jobs,
    search,
    loading,
    loadError,
    filters,
    filteredJobs,
    setSearch,
    setFilter,
    clearFilters,
    fetchJobsFromDb,
  }
})

