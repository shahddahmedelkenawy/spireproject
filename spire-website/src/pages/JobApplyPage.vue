<template>
  <q-page class="apply-page">
    <div class="apply-inner">
      <div class="apply-back-row">
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          class="apply-back-btn"
          aria-label="Back"
          @click="goBack"
        />
      </div>

      <q-inner-loading :showing="pageLoading" color="primary" />

      <div v-if="!pageLoading" class="apply-body">
        <div v-if="loadError" class="banner-err">
          {{ loadError }}
        </div>

        <template v-else-if="job && company">
          <!-- Employer card -->
          <q-card class="apply-card apply-card--employer" flat bordered>
            <div class="employer-top">
              <q-avatar class="employer-avatar" size="56px">
                <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="" class="employer-avatar-img">
                <span v-else>{{ companyInitials }}</span>
              </q-avatar>
              <div class="employer-title-block">
                <div class="employer-name">{{ company.name || 'Company' }}</div>
                <div class="employer-meta-list">
                  <div v-if="industryLine" class="meta-row">
                    <q-icon name="domain" size="18px" class="meta-ic" />
                    <span>{{ industryLine }}</span>
                  </div>
                  <div v-if="locationLine" class="meta-row">
                    <q-icon name="place" size="18px" class="meta-ic" />
                    <span>{{ locationLine }}</span>
                  </div>
                  <div v-if="telephoneLine" class="meta-row">
                    <q-icon name="phone" size="18px" class="meta-ic" />
                    <a :href="'tel:' + telephoneLine" class="meta-link">{{ telephoneLine }}</a>
                  </div>
                  <div v-if="employerNameLine" class="meta-row">
                    <q-icon name="person" size="18px" class="meta-ic" />
                    <span>{{ employerNameLine }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="employer-actions">
              <q-btn
                outline
                no-caps
                class="action-pair-btn"
                icon="open_in_new"
                label="View profile"
                @click="viewEmployerProfile"
              />
              <q-btn
                unelevated
                no-caps
                class="action-pair-btn action-pair-btn--solid"
                icon="chat"
                label="Message"
                @click="messageEmployer"
              />
            </div>
          </q-card>

          <!-- Job card -->
          <q-card class="apply-card apply-card--job" flat bordered>
            <div class="job-card-header">
              <q-icon name="work_outline" size="22px" class="section-ic" />
              <span class="section-title">Job details</span>
            </div>
            <div class="job-field" v-if="jobTitle">
              <q-icon name="badge" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Job title</div>
                <div class="field-value">{{ jobTitle }}</div>
              </div>
            </div>
            <div class="job-field" v-if="job.department">
              <q-icon name="apartment" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Department</div>
                <div class="field-value">{{ job.department }}</div>
              </div>
            </div>
            <div class="job-field" v-if="salaryText !== ''">
              <q-icon name="payments" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Salary</div>
                <div class="field-value">{{ salaryText }}</div>
              </div>
            </div>
            <div class="job-field" v-if="workModeLabel">
              <q-icon name="location_city" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Work mode</div>
                <div class="field-value">{{ workModeLabel }}</div>
              </div>
            </div>
            <div class="job-field">
              <q-icon name="schedule" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Job type</div>
                <div class="field-value">{{ jobTypeLabel }}</div>
              </div>
            </div>
            <div
              v-if="jobTypeKey === 'fulltime' && (job.insurance === true || job.insurance === false)"
              class="job-field"
            >
              <q-icon name="health_and_safety" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Insurance</div>
                <div class="field-value">{{ job.insurance ? 'Yes' : 'No' }}</div>
              </div>
            </div>
            <div v-if="jobTypeKey === 'fulltime' && hasNum(job.workingDays)" class="job-field">
              <q-icon name="calendar_today" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Working days (per week)</div>
                <div class="field-value">{{ job.workingDays }}</div>
              </div>
            </div>
            <div v-if="jobTypeKey === 'parttime' && hasNum(job.workingHours)" class="job-field">
              <q-icon name="hourglass_empty" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Working hours</div>
                <div class="field-value">{{ job.workingHours }}</div>
              </div>
            </div>
            <div v-if="jobTypeKey === 'freelancer' && job.task" class="job-field">
              <q-icon name="task_alt" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Task</div>
                <div class="field-value">{{ job.task }}</div>
              </div>
            </div>
            <div v-if="jobTypeKey === 'volunteer' && hasNum(job.volunteerHours)" class="job-field">
              <q-icon name="volunteer_activism" class="field-ic" size="18px" />
              <div class="field-body">
                <div class="field-label">Volunteer hours</div>
                <div class="field-value">{{ job.volunteerHours }}</div>
              </div>
            </div>
            <div v-if="descriptionText" class="job-field job-field--block">
              <q-icon name="description" class="field-ic field-ic--top" size="18px" />
              <div class="field-body">
                <div class="field-label">Description</div>
                <div class="field-value field-value--multiline">{{ descriptionText }}</div>
              </div>
            </div>

            <div class="job-actions">
              <q-btn
                no-caps
                outline
                class="action-pair-btn"
                icon="close"
                label="Cancel"
                :disable="submitting"
                @click="onCancel"
              />
              <q-btn
                no-caps
                unelevated
                class="action-pair-btn action-pair-btn--solid"
                icon="send"
                label="Apply"
                :loading="submitting"
                :disable="!canSubmit"
                @click="submitApplication"
              />
            </div>
          </q-card>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getJobById } from 'src/services/jobService'
import { getCompany } from 'src/services/companyService'
import { getUserProfile } from 'src/services/userService'
import { createApplication } from 'src/services/applicationService'
import { useAuthStore } from 'src/stores/authStore'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const job = ref(null)
const company = ref(null)
const employerProfile = ref(null)
const pageLoading = ref(true)
const loadError = ref('')
const submitting = ref(false)

const employerOwnerId = computed(() => company.value?.ownerId || '')

const companyInitials = computed(() => {
  const n = (company.value?.name || 'C').trim()
  return n
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const companyLogoUrl = computed(() => {
  const u = company.value?.logo
  return u && String(u).trim() ? String(u).trim() : ''
})

const industryLine = computed(() => (company.value?.industry || '').trim() || '')

const locationLine = computed(() => (company.value?.address || '').trim() || '')

const telephoneLine = computed(() => (company.value?.telephone || '').trim() || '')

const employerNameLine = computed(
  () => (employerProfile.value?.name || '').trim() || ''
)

const jobTitle = computed(
  () => (job.value?.jobTitle || job.value?.title || job.value?.name || '').trim() || ''
)

const jobTypeKey = computed(() => {
  const t = (job.value?.type || 'fulltime').toLowerCase()
  if (t === 'parttime') return 'parttime'
  if (t === 'freelancer') return 'freelancer'
  if (t === 'volunteer') return 'volunteer'
  return 'fulltime'
})

const jobTypeLabel = computed(() => {
  const k = jobTypeKey.value
  if (k === 'parttime') return 'Part time'
  if (k === 'freelancer') return 'Freelancer'
  if (k === 'volunteer') return 'Volunteer'
  return 'Full time'
})

function normalizeWorkMode(v) {
  if (v === 'Flexible') return 'Flexible hours'
  return v
}

const workModeLabel = computed(() => {
  const raw = job.value?.accessibilityFeatures
  if (raw == null || String(raw).trim() === '') return ''
  return normalizeWorkMode(String(raw).trim())
})

const salaryText = computed(() => {
  const s = job.value?.salary
  if (s == null || s === '') return ''
  return String(s)
})

const descriptionText = computed(() => (job.value?.description || '').trim() || '')

const canSubmit = computed(() => !!authStore.user?.uid && !!job.value?.id)

function hasNum(n) {
  return n != null && n !== '' && !Number.isNaN(Number(n))
}

async function load() {
  pageLoading.value = true
  loadError.value = ''
  try {
    const id = String(route.params.id || '')
    if (!id) {
      loadError.value = 'Missing job.'
      return
    }
    const j = await getJobById(id)
    if (!j) {
      loadError.value = 'This job is no longer available.'
      return
    }
    if (!j.companyId) {
      loadError.value = 'This job is not linked to a company.'
      return
    }
    job.value = j
    const c = await getCompany(j.companyId)
    if (!c) {
      loadError.value = 'Could not load the employer for this job.'
      return
    }
    company.value = c
    if (c.ownerId) {
      employerProfile.value = await getUserProfile(c.ownerId)
    } else {
      employerProfile.value = null
    }
  } catch (e) {
    console.error(e)
    loadError.value = e?.message || 'Could not load job.'
  } finally {
    pageLoading.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/jobseeker/browse-jobs')
}

function viewEmployerProfile() {
  if (!employerOwnerId.value) return
  router.push(`/peer/${encodeURIComponent(employerOwnerId.value)}`)
}

function messageEmployer() {
  if (!employerOwnerId.value) return
  if (!authStore.user?.uid) {
    $q.notify({ type: 'warning', message: 'Sign in to message the employer', position: 'bottom' })
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  router.push({
    path: `/messages/chat/${encodeURIComponent(employerOwnerId.value)}`,
    query: { from: route.fullPath },
  })
}

function onCancel() {
  goBack()
}

async function submitApplication() {
  if (!job.value || !authStore.user?.uid) {
    $q.notify({ type: 'warning', message: 'Sign in to apply', position: 'bottom' })
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  submitting.value = true
  try {
    await createApplication({
      jobId: job.value.id,
      jobSeekerId: authStore.user.uid,
      answers: {},
    })
    $q.notify({ type: 'positive', message: 'Application sent', position: 'top' })
    await router.push('/home/applications')
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.message || 'Could not submit application',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
/* Align with ProfilePage `.jsp-page` / `.jsp-inner` column width & backdrop */
.apply-page {
  background: #f0f0f2;
  min-height: 100%;
  padding-top: env(safe-area-inset-top);
  box-sizing: border-box;
}

.apply-inner {
  width: 100%;
  max-width: var(--spire-content-max);
  margin: 0 auto;
  padding: 8px var(--spire-layout-gutter) calc(24px + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.apply-back-row {
  margin: 0 0 12px;
}

.apply-back-btn {
  color: #1e1e1e !important;
}

.banner-err {
  background: #ffebee;
  color: #b71c1c;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 12px;
}

.apply-card {
  width: 100%;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(15, 15, 15, 0.06);
  border: 1px solid rgba(61, 11, 82, 0.08);
  margin-bottom: 14px;
}

.apply-card--employer {
  padding-bottom: 14px;
}

.employer-top {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.employer-avatar {
  background: #f3e8ff;
  color: #4b1e5a;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
  border: 1px solid rgba(75, 30, 90, 0.12);
}

.employer-avatar-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.employer-title-block {
  min-width: 0;
  flex: 1;
}

.employer-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1e1e1e;
  line-height: 1.3;
  margin-bottom: 8px;
}

.employer-meta-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #444;
  line-height: 1.35;
}

.meta-ic {
  color: #4b1e5a;
  flex-shrink: 0;
  margin-top: 1px;
}

.meta-link {
  color: #4b1e5a;
  text-decoration: none;
  word-break: break-word;
}

.employer-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #eee;
}

.action-pair-btn {
  flex: 1;
  border-radius: 12px;
  min-height: 44px;
  font-weight: 600;
  font-size: 13px;
  border: 1px solid #4b1e5a;
  color: #4b1e5a;
}

.action-pair-btn--solid {
  background: #4b1e5a;
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(75, 30, 90, 0.28);
}

.job-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.section-ic {
  color: #4b1e5a;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e1e1e;
}

.job-field {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.job-field--block {
  align-items: flex-start;
}

.field-ic {
  color: #7b4d8a;
  flex-shrink: 0;
  margin-top: 2px;
}

.field-ic--top {
  margin-top: 3px;
}

.field-body {
  min-width: 0;
  flex: 1;
}

.field-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8a8a8a;
  font-weight: 600;
  margin-bottom: 2px;
}

.field-value {
  font-size: 14px;
  color: #1e1e1e;
  line-height: 1.4;
  word-break: break-word;
}

.field-value--multiline {
  white-space: pre-wrap;
}

.job-actions {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #eee;
}
</style>
