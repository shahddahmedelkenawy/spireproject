<template>
  <q-page class="page">
    <div class="inner">
      <EmployerStickyHeader />
      <section class="welcome-block">
        <div class="welcome-row">
          <q-avatar size="44px" class="welcome-avatar">
            <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="" class="welcome-avatar-img">
            <span v-else>{{ companyInitial }}</span>
          </q-avatar>
          <p class="welcome-line">
            Welcome, {{ companyWelcomeName }} !
          </p>
        </div>
      </section>

      <section class="search-section">
        <div class="search-bar-row">
          <button
            type="button"
            class="search-icon-btn"
            aria-label="Hide search filters"
            @click.stop.prevent="closeSearchFilters"
          >
            <q-icon name="search" size="24px" class="search-field-icon" />
          </button>
          <div class="search-input-grow" @click="onSearchBarClick">
            <q-input
              v-model="search"
              dense
              borderless
              placeholder="Search applicants by name, role, job, or location"
              class="search-input"
              @focus="openSearchFilters"
              @click="onSearchBarClick"
            >
              <template v-if="search" #append>
                <q-btn
                  round
                  dense
                  flat
                  icon="close"
                  class="search-clear-btn"
                  tabindex="-1"
                  @click.stop="clearSearch"
                />
              </template>
            </q-input>
          </div>
        </div>
        <q-slide-transition>
          <div v-show="showFilters" class="filters-row">
            <q-btn
              v-for="filter in filterDefs"
              :key="filter.key"
              no-caps
              unelevated
              class="filter-pill"
            >
              <div class="filter-label">
                <span>{{ filter.label }}</span>
                <q-icon name="expand_more" size="16px" />
              </div>
              <q-menu anchor="bottom middle" self="top middle">
                <q-list style="min-width: 180px">
                  <q-item
                    v-for="option in filter.options"
                    :key="option"
                    clickable
                    v-close-popup
                    @click="setFilter(filter.key, option)"
                  >
                    <q-item-section>{{ option }}</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="setFilter(filter.key, null)">
                    <q-item-section class="text-negative">Clear</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-slide-transition>
      </section>

      <div class="dashboard-cards">
        <q-card class="dash-card">
          <div class="dash-top">
            <span class="dash-title">Active Job Posts</span>
            <q-icon name="trending_up" color="positive" />
          </div>
          <div class="dash-value">{{ activeJobsCount }} jobs</div>
          <div class="dash-sub">Open roles in your company</div>
        </q-card>

        <q-card class="dash-card">
          <div class="dash-title">Closed Positions</div>
          <div class="dash-value">{{ closedJobsCount }} positions closed</div>
        </q-card>

        <q-card class="dash-card dash-card--hiring">
          <div class="dash-title">Hiring Progress</div>
          <div class="half-gauge-visual">
            <div class="half-gauge-clip">
              <q-circular-progress
                :value="hiringProgress"
                size="180px"
                :thickness="0.14"
                color="primary"
                track-color="grey-4"
                :show-value="false"
              />
            </div>
            <div class="half-gauge-center">{{ hiringProgress }}%</div>
          </div>
          <p class="half-gauge-hint">Filled Positions vs Total Positions</p>
        </q-card>
      </div>

      <div class="applicants-head">
        <h2 class="section-title">My Applicants</h2>
        <q-btn
          flat
          no-caps
          dense
          class="sort-btn"
          :label="sortNewest ? 'Sort by Newest' : 'Sort by Oldest'"
          @click="sortNewest = !sortNewest"
        />
      </div>

      <div class="cards">
        <EmployerApplicantCard
          v-for="applicant in filteredApplicants"
          :key="applicant.id"
          :applicant="applicant"
          @open="openApplicant"
          @accept="markStatus($event, 'accepted')"
          @reject="markStatus($event, 'rejected')"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import EmployerApplicantCard from 'src/components/EmployerApplicantCard.vue'
import EmployerStickyHeader from 'src/components/EmployerStickyHeader.vue'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import { getApplicationsForEmployer, updateApplicationStatus } from 'src/services/applicationService'
import { getCompanyByOwner } from 'src/services/companyService'
import { listCompanyJobs } from 'src/services/jobService'
import { capitalizeProseWords } from 'src/utils/textFormat'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const applicants = ref([])
const companyJobs = ref([])
const company = ref(null)
const search = ref('')
const showFilters = ref(false)
const sortNewest = ref(true)
const selectedFilters = ref({
  location: null,
  experienceLevel: null,
  disabilityType: null,
  jobType: null,
  workMode: null,
})

const filterDefs = [
  {
    key: 'location',
    label: 'Location',
    options: ['Cairo', 'Giza', 'Alexandria', 'Remote'],
  },
  {
    key: 'experienceLevel',
    label: 'Experience Level',
    options: ['Entry level', 'Junior', 'Mid level', 'Senior'],
  },
  {
    key: 'disabilityType',
    label: 'Disability Type',
    options: [
      'Physical',
      'Visual',
      'Hearing',
      'Intellectual',
      'Mental health',
      'Neurodivergent',
    ],
  },
  {
    key: 'workMode',
    label: 'Work Mode',
    options: ['On Site', 'Remote', 'Hybrid', 'Flexible hours'],
  },
  {
    key: 'jobType',
    label: 'Job Type',
    options: ['Full Time', 'Part Time', 'Freelancer', 'Volunteer'],
  },
]

/** "Company Name" from employer company form: stored on `companies.name` and mirrored on `users.companyName` */
const companyDisplayName = computed(() => {
  const fromDoc = (company.value?.name || '').trim()
  if (fromDoc) return fromDoc
  const fromProfile = (userStore.profile?.companyName || '').trim()
  return fromProfile
})

const companyWelcomeName = computed(() =>
  companyDisplayName.value
    ? capitalizeProseWords(companyDisplayName.value)
    : 'Your Company',
)

const companyLogoUrl = computed(() => company.value?.logo || '')

const companyInitial = computed(() => {
  const n = (companyDisplayName.value || 'C').trim()
  return (n.charAt(0) || 'C').toUpperCase()
})

function applicantSearchHaystack(a) {
  const parts = [
    a.name,
    a.role,
    a.location,
    a.email,
    a.jobTitle,
    a.status,
    a.jobTypeLabel,
    a.workMode,
  ]
  return parts
    .map((x) => (x != null ? String(x) : ''))
    .join(' ')
    .toLowerCase()
}

const filteredApplicants = computed(() => {
  const list = applicants.value.filter((a) => {
    const words = search.value.toLowerCase().trim().split(/\s+/).filter(Boolean)
    const searchOk = !words.length || words.every((w) => applicantSearchHaystack(a).includes(w))
    if (!searchOk) return false

    const loc = (a.location || '').toLowerCase()
    const fl = selectedFilters.value.location
    if (fl && !loc.includes(fl.toLowerCase())) return false

    if (
      selectedFilters.value.experienceLevel &&
      a.experienceLevel !== selectedFilters.value.experienceLevel
    )
      return false
    if (
      selectedFilters.value.disabilityType &&
      a.disabilityType !== selectedFilters.value.disabilityType
    )
      return false
    const wm = (a.workMode || '').trim()
    if (selectedFilters.value.workMode && wm !== selectedFilters.value.workMode) return false
    if (selectedFilters.value.jobType && a.jobTypeLabel !== selectedFilters.value.jobType) return false
    return true
  })
  return [...list].sort((a, b) => {
    const aDate = a?.appliedAt?.toDate ? a.appliedAt.toDate().getTime() : new Date(a?.appliedAt || 0).getTime()
    const bDate = b?.appliedAt?.toDate ? b.appliedAt.toDate().getTime() : new Date(b?.appliedAt || 0).getTime()
    return sortNewest.value ? bDate - aDate : aDate - bDate
  })
})

const activeJobsCount = computed(() =>
  companyJobs.value.filter((job) => (job.status || 'open') === 'open').length
)
const closedJobsCount = computed(() =>
  companyJobs.value.filter((job) => (job.status || 'open') !== 'open').length
)
const acceptedCount = computed(() => applicants.value.filter((a) => a.status === 'accepted').length)
const hiringProgress = computed(() => {
  if (!applicants.value.length) return 0
  return Math.round((acceptedCount.value / applicants.value.length) * 100)
})

function openApplicant(id) {
  router.push(`/employer/applicant/${id}`)
}

async function markStatus(id, status) {
  await updateApplicationStatus(id, status, authStore.user?.uid)
  const item = applicants.value.find((a) => a.id === id)
  if (item) item.status = status
}

function setFilter(key, value) {
  selectedFilters.value[key] = value
}

function openSearchFilters() {
  showFilters.value = true
}

function closeSearchFilters() {
  showFilters.value = false
}

function clearSearch() {
  search.value = ''
}

function onSearchBarClick(evt) {
  const t = evt.target
  if (t.closest?.('.search-icon-btn') || t.closest?.('.search-clear-btn')) return
  openSearchFilters()
}

async function loadDashboardData() {
  const uid = authStore.user?.uid
  if (!uid) return
  await userStore.fetchProfile(uid)
  applicants.value = await getApplicationsForEmployer(uid)
  company.value = await getCompanyByOwner(uid)
  companyJobs.value = company.value?.id ? await listCompanyJobs(company.value.id) : []
}

onMounted(loadDashboardData)
</script>

<style scoped>
.page {
  background: #f6f6f7;
  font-family: 'Inter', sans-serif;
  padding-top: env(safe-area-inset-top);
}

.inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px calc(20px + env(safe-area-inset-bottom));
}

.welcome-block {
  margin-bottom: 14px;
}

.welcome-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.welcome-avatar {
  background-color: #4b1d5a;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.welcome-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.welcome-line {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e1e1e;
  line-height: 1.3;
}

.search-section {
  margin-bottom: 16px;
}

.search-bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 48px;
  padding: 4px 10px 4px 12px;
  border-radius: 999px;
  background-color: #4b1d5a;
  box-sizing: border-box;
}

.search-input-grow {
  flex: 1;
  min-width: 0;
  cursor: text;
}

.search-input :deep(.q-field__control) {
  background: transparent;
  box-shadow: none;
  min-height: 40px;
}

.search-input :deep(.q-field__native),
.search-input :deep(.q-placeholder) {
  color: #ffffff;
}

.search-field-icon {
  color: #ffffff;
  opacity: 0.95;
}

.search-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  color: inherit;
}

.search-clear-btn {
  color: #ffffff !important;
}

.search-clear-btn :deep(.q-icon) {
  color: #ffffff !important;
}

.filters-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-pill {
  border-radius: 999px;
  background-color: #4b1d5a;
  color: #ffffff;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.dash-card {
  border-radius: 16px;
  padding: 14px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.dash-card--hiring {
  padding: 16px 14px 18px;
  min-height: 180px;
}

.dash-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dash-title {
  font-size: 13px;
  color: #8a8a8a;
}

.dash-value {
  margin-top: 4px;
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.dash-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #1f8a5b;
}

.half-gauge-visual {
  position: relative;
  width: 180px;
  height: 100px;
  margin: 10px auto 0;
}

.half-gauge-clip {
  height: 90px;
  width: 180px;
  overflow: hidden;
  position: relative;
  margin: 0 auto;
}

.half-gauge-clip :deep(.q-circular-progress) {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(180deg);
}

.half-gauge-center {
  position: absolute;
  left: 50%;
  top: 58px;
  transform: translate(-50%, -50%);
  font-size: 22px;
  font-weight: 700;
  color: #4b1d5a;
  line-height: 1;
  pointer-events: none;
}

.half-gauge-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: #8a8a8a;
  text-align: center;
}

.applicants-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 14px 0 8px;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #222;
}

.sort-btn {
  color: #8a8a8a;
  font-size: 13px;
}

.cards {
  margin-top: 6px;
}
</style>
