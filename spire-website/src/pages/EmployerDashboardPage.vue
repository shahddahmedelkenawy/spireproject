<template>
  <q-page class="page page--employer-dashboard">
    <div class="inner">
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

      <section class="filters-section">
        <div class="filters-trigger-row">
          <q-btn
            flat
            no-caps
            dense
            icon="tune"
            class="filters-trigger-btn"
            label="Filters"
            :aria-expanded="showFilters"
            @click="toggleFilters"
          />
          <q-btn
            v-show="showFilters"
            flat
            no-caps
            dense
            icon="expand_less"
            class="filters-trigger-btn filters-trigger-btn--quiet"
            label="Hide filters"
            @click="hideFilters"
          />
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
        <div class="applicants-head-text">
          <h2 class="section-title">My Applicants</h2>
          <p class="section-sub">Accepted candidates only</p>
        </div>
        <q-btn
          flat
          no-caps
          dense
          class="sort-btn"
          :label="sortNewest ? 'Sort by Newest' : 'Sort by Oldest'"
          @click="sortNewest = !sortNewest"
        />
      </div>

      <p v-if="!filteredApplicants.length" class="dash-applicants-empty">
        {{
          hasAcceptedApplicants
            ? 'No accepted applicants match your search or filters.'
            : 'No accepted applicants yet.'
        }}
      </p>
      <div v-else class="cards">
        <EmployerApplicantCard
          v-for="applicant in filteredApplicants"
          :key="applicant.id"
          variant="dashboard"
          :applicant="applicant"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import EmployerApplicantCard from 'src/components/EmployerApplicantCard.vue'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import { useEmployerUiStore } from 'src/stores/employerUiStore'
import { getApplicationsForEmployer } from 'src/services/applicationService'
import { listCompaniesByOwner } from 'src/services/companyService'
import { listCompanyJobs } from 'src/services/jobService'
import { capitalizeProseWords } from 'src/utils/textFormat'

const authStore = useAuthStore()
const userStore = useUserStore()
const employerUi = useEmployerUiStore()
const { dashboardApplicantSearch, openDashboardFiltersEpoch } = storeToRefs(employerUi)

const applicants = ref([])
const companyJobs = ref([])
const company = ref(null)
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

function isAcceptedStatus(status) {
  return String(status || '').toLowerCase() === 'accepted'
}

/** At least one application is accepted (before search/filters). */
const hasAcceptedApplicants = computed(() =>
  applicants.value.some((a) => isAcceptedStatus(a.status))
)

const filteredApplicants = computed(() => {
  const acceptedOnly = applicants.value.filter((a) => isAcceptedStatus(a.status))
  const list = acceptedOnly.filter((a) => {
    const words = dashboardApplicantSearch.value.toLowerCase().trim().split(/\s+/).filter(Boolean)
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
/** Closed job posts vs all job posts (matches “Filled Positions vs Total Positions”). */
const hiringProgress = computed(() => {
  const total = companyJobs.value.length
  if (!total) return 0
  return Math.round((closedJobsCount.value / total) * 100)
})

function setFilter(key, value) {
  selectedFilters.value[key] = value
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function hideFilters() {
  showFilters.value = false
}

watch(openDashboardFiltersEpoch, () => {
  showFilters.value = true
})

async function loadDashboardData() {
  const uid = authStore.user?.uid
  if (!uid) return
  try {
    await userStore.fetchProfile(uid)
    const companies = await listCompaniesByOwner(uid)
    company.value = companies[0] ?? null
    const jobsFlat = []
    for (const c of companies) {
      jobsFlat.push(...(await listCompanyJobs(c.id)))
    }
    companyJobs.value = jobsFlat
    applicants.value = await getApplicationsForEmployer(uid)
  } catch (e) {
    console.error('[EmployerDashboard]', e)
  }
}

watch(
  () => authStore.user?.uid,
  (uid) => {
    if (uid) void loadDashboardData()
  },
  { immediate: true }
)
</script>

<style scoped>
.page {
  background: transparent;
  font-family: 'Inter', sans-serif;
  padding-top: 0;
}

.page--employer-dashboard {
  width: calc(100% + 2 * clamp(10px, 2vw, 22px));
  max-width: none;
  margin-left: calc(-1 * clamp(10px, 2vw, 22px));
  margin-right: calc(-1 * clamp(10px, 2vw, 22px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}

@media (max-width: 1023px) {
  .page--employer-dashboard {
    min-height: calc(
      100dvh - var(--jsk-nav-height, 130px) - env(safe-area-inset-top) - env(safe-area-inset-bottom)
    );
  }
}

.page--employer-dashboard .inner {
  width: 100%;
  max-width: none;
  margin: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 24px clamp(12px, 2vw, 28px) calc(28px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(61, 11, 82, 0.06);
  box-shadow: 0 8px 32px rgba(15, 15, 30, 0.06);
}

.welcome-block {
  margin-bottom: 18px;
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
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 700;
  color: #0f0f0f;
  line-height: 1.3;
  letter-spacing: -0.02em;
}

.filters-section {
  margin-bottom: 20px;
}

.filters-trigger-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.filters-trigger-btn {
  color: #3d0b52 !important;
  font-weight: 600;
  font-size: 13px;
}

.filters-trigger-btn--quiet {
  color: #8a8a8a !important;
  font-weight: 500;
}

.filters-row {
  margin-top: 4px;
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
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.dash-card {
  border-radius: 12px;
  padding: 22px 20px;
  background: #fafafa;
  border: 1px solid rgba(61, 11, 82, 0.07);
  box-shadow: 0 2px 12px rgba(15, 15, 30, 0.04);
  transition:
    box-shadow 0.25s ease,
    transform 0.2s ease,
    border-color 0.2s ease;
}

.dash-card:hover {
  box-shadow: 0 10px 28px rgba(61, 11, 82, 0.1);
  transform: translateY(-2px);
  border-color: rgba(61, 11, 82, 0.12);
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin: 14px 0 8px;
}

.applicants-head-text {
  min-width: 0;
}

.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #222;
}

.section-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8a8a8a;
}

.dash-applicants-empty {
  margin: 12px 0 20px;
  font-size: 14px;
  color: #8a8a8a;
  text-align: center;
}

.sort-btn {
  color: #8a8a8a;
  font-size: 13px;
}

.cards {
  margin-top: 6px;
}
</style>
