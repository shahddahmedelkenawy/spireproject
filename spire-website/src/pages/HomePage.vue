<template>
  <q-page class="home-page">
    <div class="home-inner">
      <JobSeekerStickyHeader />

      <section class="welcome-block">
        <div class="welcome-row">
          <q-avatar size="44px" class="welcome-avatar">
            <img v-if="welcomePhotoUrl" :src="welcomePhotoUrl" alt="" class="welcome-avatar-img">
            <span v-else>{{ welcomeInitial }}</span>
          </q-avatar>
          <p class="welcome-line">
            Welcome, {{ welcomeName }} !
          </p>
        </div>
      </section>

      <!-- Icon is outside the field so its click never hits the input / open handler -->
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
              :model-value="jobSearch"
              dense
              borderless
              placeholder="Search For Roles, Companies Or Locations"
              class="search-input"
              @update:model-value="jobStore.setSearch"
              @focus="openSearchFilters"
              @click="onSearchBarClick"
            >
              <template v-if="jobSearch" #append>
                <q-btn
                  round
                  dense
                  flat
                  icon="close"
                  class="search-clear-btn"
                  tabindex="-1"
                  @click.stop="clearJobSearch"
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
                    <q-item-section>
                      {{ option }}
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup @click="clearFilter(filter.key)">
                    <q-item-section class="text-negative">
                      Clear
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-slide-transition>
      </section>

      <!-- Jobs feed -->
      <section class="jobs-section">
        <h2 class="section-title">
          Recommended Jobs
        </h2>
        <div v-if="jobStore.loading" class="empty-state">
          <p>Loading Jobs…</p>
        </div>
        <div v-else-if="jobStore.loadError" class="empty-state">
          <p>{{ jobStore.loadError }}</p>
          <q-btn
            flat
            no-caps
            class="clear-filters-btn"
            label="Try Again"
            @click="jobStore.fetchJobsFromDb"
          />
        </div>
        <div v-else-if="jobStore.filteredJobs.length" class="jobs-list">
          <JobCard
            v-for="job in jobStore.filteredJobs"
            :key="job.id"
            :job="job"
            @open="openJob"
            @apply="goApply"
          />
        </div>
        <div v-else class="empty-state">
          <p>No Jobs Match Your Current Filters.</p>
          <q-btn
            flat
            no-caps
            class="clear-filters-btn"
            label="Clear Filters"
            @click="clearAllFilters"
          />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'
import { useJobStore } from 'src/stores/jobStore'
import JobCard from 'src/components/JobCard.vue'
import JobSeekerStickyHeader from 'src/components/JobSeekerStickyHeader.vue'
import { useAuthStore } from 'src/stores/authStore'
import { countAcceptedConnectionsForUser } from 'src/services/userService'
import { capitalizeProseWords } from 'src/utils/textFormat'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const jobStore = useJobStore()
const { search: jobSearch } = storeToRefs(jobStore)

const showFilters = ref(false)

const welcomeName = computed(() => capitalizeProseWords(userStore.name || 'Spire User'))

const welcomeInitial = computed(() => {
  const n = (userStore.name || 'S').trim()
  return (n.charAt(0) || 'S').toUpperCase()
})

const welcomePhotoUrl = computed(() => userStore.profile?.profilePhotoUrl || '')

const filterDefs = [
  {
    key: 'datePosted',
    label: 'Date Posted',
    options: ['Last 24 hours', 'Last 7 days', 'Last 14 days', 'Last 30 days'],
  },
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
    key: 'companyType',
    label: 'Company Type',
    options: ['Startup', 'Tech', 'Corporate', 'Governmental', 'Non profit', 'Private'],
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
  {
    key: 'accessibilityPolicy',
    label: 'Accessibility Policy',
    options: ['Fully Accessible', 'Mobility Friendly', 'Assistive Technology', 'Inclusive Workplace'],
  },
]

function setFilter(key, value) {
  jobStore.setFilter(key, value)
}

function clearFilter(key) {
  jobStore.setFilter(key, null)
}

function clearAllFilters() {
  jobStore.clearFilters()
}

function clearJobSearch() {
  jobStore.setSearch('')
}

function openSearchFilters() {
  showFilters.value = true
}

function closeSearchFilters() {
  showFilters.value = false
}

/** Every click on the field (not icon / clear) opens filters — needed when input stays focused */
function onSearchBarClick(evt) {
  const t = evt.target
  if (t.closest?.('.search-icon-btn') || t.closest?.('.search-clear-btn')) return
  openSearchFilters()
}

function openJob(id) {
  if (!id) return
  router.push(`/jobseeker/job/${id}`)
}

function goApply(id) {
  if (!id) return
  router.push(`/jobseeker/job/${id}/apply`)
}

onMounted(async () => {
  const uid = authStore.user?.uid
  if (uid) {
    await userStore.fetchProfile(uid)
    userStore.setConnectionsCount(await countAcceptedConnectionsForUser(uid))
  }
  if (!jobStore.jobs.length) {
    await jobStore.fetchJobsFromDb()
  }
})
</script>

<style scoped>
.home-page {
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));
  padding-top: env(safe-area-inset-top);
}

.home-inner {
  max-width: 480px;
  margin: 0 auto;
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

/* Same visual weight as My Circle `circle-search` prepend icon (dense field default ~24px) */
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

.jobs-section {
  margin-top: 8px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e1e1e;
  margin: 0 0 12px;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  font-size: 14px;
  color: #666666;
}

.clear-filters-btn {
  margin-top: 4px;
  color: #4b1d5a;
  font-weight: 600;
}
</style>
