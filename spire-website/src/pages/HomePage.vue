<template>
  <q-page class="home-page">
    <div class="home-inner">
      <section class="welcome-block">
        <p class="welcome-line">
          Welcome, {{ welcomeName }} ! 👋
        </p>
        <h2 class="section-kicker">
          Top job picks for you
        </h2>
        <p class="section-sub">
          Based on your profile, preferences, and activity like applies, searches, and saves
        </p>
        <div class="filters-toolbar">
          <q-btn
            type="button"
            flat
            no-caps
            class="filters-toggle"
            padding="sm md"
            icon="tune"
            label="Filters"
            @click="showFilters = !showFilters"
          />
        </div>
      </section>

      <section class="search-section">
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
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'
import { useJobStore } from 'src/stores/jobStore'
import JobCard from 'src/components/JobCard.vue'
import { useAuthStore } from 'src/stores/authStore'
import { countAcceptedConnectionsForUser } from 'src/services/userService'
import { capitalizeProseWords } from 'src/utils/textFormat'
import { useJobSeekerUiStore } from 'src/stores/jobSeekerUiStore'

const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()
const jobStore = useJobStore()
const jobSeekerUi = useJobSeekerUiStore()
const { search: jobSearch } = storeToRefs(jobStore)

const showFilters = ref(false)

watch(
  () => jobSeekerUi.openHomeFiltersEpoch,
  () => {
    showFilters.value = true
  }
)

const welcomeName = computed(() => capitalizeProseWords(userStore.name || 'Spire User'))

void jobSearch

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
  padding: 24px var(--spire-layout-gutter) calc(24px + env(safe-area-inset-bottom));
  padding-top: max(20px, env(safe-area-inset-top));
  background: #ffffff;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.home-inner {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.welcome-block {
  margin-bottom: 28px;
}

.welcome-line {
  margin: 0 0 20px;
  font-size: clamp(22px, 3.25vw, 34px);
  font-weight: 700;
  color: #0f0f0f;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.section-kicker {
  margin: 0 0 10px;
  font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.01em;
}

.section-sub {
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.55;
  color: #5c5c66;
  max-width: 720px;
}

.filters-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-toggle {
  color: #3d0b52;
  font-weight: 600;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.filters-toggle:hover {
  background: rgba(61, 11, 82, 0.08);
}

.search-section {
  margin-bottom: 28px;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-pill {
  border-radius: 999px;
  background-color: #3d0b52;
  color: #ffffff;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.filter-pill:hover {
  background-color: #4f1568;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.jobs-section {
  margin-top: 8px;
}

.empty-state {
  text-align: center;
  font-size: 15px;
  color: #666666;
  padding: 48px 16px;
}

.clear-filters-btn {
  margin-top: 8px;
  color: #3d0b52;
  font-weight: 600;
}

.jobs-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
