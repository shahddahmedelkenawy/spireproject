<template>
  <q-page class="job-seeker-page spire-form-page">
    <div class="page-inner spire-form-shell">
      <EmployerStickyHeader surface="dark" />
      <div class="top-section">
        <h1 class="title">{{ isEdit ? 'Edit Job' : 'Add Job' }}</h1>
        <p class="subtitle">
          {{ isEdit ? 'Update your job posting details.' : 'Create a job posting with complete details.' }}
        </p>
      </div>

      <div v-if="loadJobError" class="banner-error">{{ loadJobError }}</div>

      <div class="form-section">
        <q-form ref="formRef" @submit.prevent="publishJob">
          <div class="form-row">
            <q-input
              v-model="form.title"
              label="Job Title"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Job Title Is Required']"
              @blur="form.title = titleCaseWords(form.title)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.department"
              label="Department"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Department Is Required']"
              @blur="form.department = titleCaseWords(form.department)"
            />
            <q-input
              v-model="form.salary"
              label="Salary"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Salary Is Required']"
              @blur="form.salary = titleCaseWords(form.salary)"
            />
          </div>

          <div class="form-row">
            <q-select
              v-model="form.workMode"
              :options="['On Site', 'Remote', 'Hybrid', 'Flexible hours']"
              label="Work Mode"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Work Mode Is Required']"
            />
            <q-select
              v-model="form.jobType"
              :options="['Full Time', 'Part Time', 'Freelancer', 'Volunteer']"
              label="Job Type"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Job Type Is Required']"
            />
          </div>

          <div v-if="form.jobType === 'Full Time'" class="form-row">
            <q-select
              v-model="form.insurance"
              :options="insuranceOptions"
              label="Insurance"
              emit-value
              map-options
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => (val === true || val === false ? true : 'Insurance Is Required')]"
            />
            <q-input
              v-model="form.workingDays"
              label="Working Days"
              dense
              outlined
              type="number"
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Working Days Is Required']"
            />
          </div>

          <div v-if="form.jobType === 'Part Time'" class="form-row">
            <q-input
              v-model="form.workingHours"
              label="Working Hours"
              dense
              outlined
              type="number"
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Working Hours Is Required']"
            />
            <div class="form-input form-input--spacer" />
          </div>

          <div v-if="form.jobType === 'Freelancer'" class="form-row">
            <q-input
              v-model="form.task"
              label="Task"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Task Is Required']"
              @blur="form.task = titleCaseWords(form.task)"
            />
            <div class="form-input form-input--spacer" />
          </div>

          <div v-if="form.jobType === 'Volunteer'" class="form-row">
            <q-input
              v-model="form.volunteerHours"
              label="Volunteer Hours"
              dense
              outlined
              type="number"
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Volunteer Hours Is Required']"
            />
            <div class="form-input form-input--spacer" />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.description"
              label="Description"
              dense
              outlined
              type="textarea"
              autogrow
              class="form-input spire-form-field large-textarea"
              :rules="[(val) => !!val || 'Description Is Required']"
              @blur="form.description = titleCaseMultiline(form.description)"
            />
          </div>

          <div class="bottom-actions">
            <q-btn no-caps type="button" class="outline-btn ghost" label="Go Back" @click="goBack" />
            <q-btn
              no-caps
              type="submit"
              class="outline-btn spire-form-submit"
              :label="isEdit ? 'Update Job' : 'Publish Job'"
              :loading="loading"
              :disable="isEdit && Boolean(loadJobError)"
            />
          </div>
        </q-form>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import EmployerStickyHeader from 'src/components/EmployerStickyHeader.vue'
import { useAuthStore } from 'src/stores/authStore'
import { createJob, getJobById, updateJob } from 'src/services/jobService'
import { getCompanyByOwner } from 'src/services/companyService'
import { titleCaseWords, titleCaseMultiline } from 'src/utils/textFormat'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const formRef = ref(null)
const loadJobError = ref('')
const editingJobId = ref(null)

const insuranceOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
]

const isEdit = computed(() => Boolean(editingJobId.value))

const form = ref({
  title: '',
  department: '',
  description: '',
  salary: '',
  jobType: null,
  insurance: null,
  workingDays: '',
  workingHours: '',
  task: '',
  volunteerHours: '',
  workMode: null,
})

function emptyForm() {
  form.value = {
    title: '',
    department: '',
    description: '',
    salary: '',
    jobType: null,
    insurance: null,
    workingDays: '',
    workingHours: '',
    task: '',
    volunteerHours: '',
    workMode: null,
  }
}

function mapJobType(type) {
  if (type === 'Part Time') return 'parttime'
  if (type === 'Freelancer') return 'freelancer'
  if (type === 'Volunteer') return 'volunteer'
  return 'fulltime'
}

function mapDbTypeToForm(type) {
  const t = (type || 'fulltime').toLowerCase()
  if (t === 'parttime') return 'Part Time'
  if (t === 'freelancer') return 'Freelancer'
  if (t === 'volunteer') return 'Volunteer'
  return 'Full Time'
}

function normalizeWorkMode(v) {
  if (v === 'Flexible') return 'Flexible hours'
  return v
}

function normalizeFormForSave() {
  form.value.title = titleCaseWords(form.value.title)
  form.value.department = titleCaseWords(form.value.department)
  form.value.salary = titleCaseWords(form.value.salary)
  form.value.description = titleCaseMultiline(form.value.description)
  form.value.task = titleCaseWords(form.value.task)
}

function salaryForDb(val) {
  const s = String(val ?? '').trim()
  const n = Number(s)
  if (s !== '' && !Number.isNaN(n)) return n
  return s
}

function buildPayload() {
  return {
    name: form.value.title,
    title: form.value.title,
    jobTitle: form.value.title,
    description: form.value.description,
    salary: salaryForDb(form.value.salary),
    department: form.value.department,
    type: mapJobType(form.value.jobType),
    status: 'open',
    workingHours: Number(form.value.workingHours || 0),
    workingDays: Number(form.value.workingDays || 0),
    volunteerHours: Number(form.value.volunteerHours || 0),
    task: form.value.task,
    accessibilityFeatures: form.value.workMode || '',
    insurance: form.value.insurance,
  }
}

function applyJobToForm(job) {
  form.value.title = job.jobTitle || job.title || job.name || ''
  form.value.department = job.department || ''
  form.value.description = job.description || ''
  form.value.salary = job.salary != null && job.salary !== '' ? String(job.salary) : ''
  form.value.jobType = mapDbTypeToForm(job.type)
  form.value.workMode = normalizeWorkMode(job.accessibilityFeatures || null)
  form.value.workingHours = job.workingHours != null ? String(job.workingHours) : ''
  form.value.workingDays = job.workingDays != null ? String(job.workingDays) : ''
  form.value.volunteerHours = job.volunteerHours != null ? String(job.volunteerHours) : ''
  form.value.task = job.task || ''
  if (job.insurance === true || job.insurance === false) {
    form.value.insurance = job.insurance
  } else {
    form.value.insurance = null
  }
}

async function resolveEditingId() {
  loadJobError.value = ''
  const id = route.params.jobId
  if (!id) {
    editingJobId.value = null
    emptyForm()
    return
  }

  editingJobId.value = String(id)

  if (!authStore.user?.uid) {
    loadJobError.value = 'You must be signed in to edit a job.'
    return
  }

  try {
    const [company, job] = await Promise.all([
      getCompanyByOwner(authStore.user.uid),
      getJobById(String(id)),
    ])

    if (!job) {
      loadJobError.value = 'Job not found.'
      return
    }
    if (!company?.id || job.companyId !== company.id) {
      loadJobError.value = 'You cannot edit this job.'
      return
    }

    applyJobToForm(job)
  } catch (e) {
    console.error(e)
    loadJobError.value = e?.message || 'Failed to load job.'
  }
}

function goBack() {
  router.push('/employer/post-job')
}

async function publishJob() {
  const valid = await formRef.value?.validate()
  if (!valid) {
    $q.notify({
      type: 'warning',
      message: 'Please complete all required fields.',
      position: 'top',
    })
    return
  }
  if (!authStore.user?.uid) return
  if (editingJobId.value && loadJobError.value) return

  loading.value = true
  try {
    const company = await getCompanyByOwner(authStore.user.uid)
    if (!company?.id) {
      $q.notify({ type: 'warning', message: 'Set up your company profile first.', position: 'top' })
      return
    }

    normalizeFormForSave()

    const payload = buildPayload()

    if (editingJobId.value) {
      await updateJob(editingJobId.value, payload)
    } else {
      await createJob({
        companyId: company.id,
        ...payload,
      })
    }

    $q.notify({
      type: 'positive',
      message: editingJobId.value ? 'Job updated' : 'Job published',
      position: 'top',
    })
    await router.push('/employer/post-job')
  } catch (error) {
    console.error('Failed to save job:', error)
    $q.notify({
      type: 'negative',
      message: error?.message || 'Could not save job',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.jobId,
  () => {
    resolveEditingId()
  },
)

onMounted(() => {
  resolveEditingId()
})
</script>

<style scoped>
.job-seeker-page {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  background-color: #4b1e5a;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.page-inner {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  flex: 1;
}

.banner-error {
  background: rgba(255, 200, 200, 0.95);
  color: #7a1e1e;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 13px;
  margin-bottom: 12px;
}

.top-section {
  text-align: left;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}

.form-section {
  flex: 1;
  margin-top: 16px;
  margin-bottom: 16px;
  overflow-y: auto;
  padding-right: 4px;
}

.form-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.form-input {
  margin-bottom: 12px;
  width: 100%;
}

.form-input--spacer {
  visibility: hidden;
}

.form-input :deep(.q-field__control) {
  border-radius: 20px;
  background-color: #ffffff;
}

.large-textarea :deep(.q-field__control) {
  min-height: 140px;
  align-items: flex-start;
}

.large-textarea :deep(textarea) {
  min-height: 120px;
}

.form-input :deep(.q-field__control:before),
.form-input :deep(.q-field__control:hover:before) {
  border-color: rgba(75, 30, 90, 0.3);
}

.form-input :deep(.q-field__control:hover) {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.form-input :deep(.q-field__label),
.form-input :deep(.q-field__native) {
  color: #1a1a1a;
}

.form-input :deep(.q-field__label) {
  color: rgba(75, 30, 90, 0.8);
}

.bottom-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;
}

.outline-btn {
  flex: 1;
  border-radius: 25px;
  background-color: #ffffff;
  color: #4b1e5a;
  border: 2px solid #ffffff;
  font-weight: 600;
  height: 44px;
  transition: all 0.2s ease;
}

.outline-btn.ghost {
  background-color: transparent;
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
}

.outline-btn:hover,
.outline-btn:focus {
  background-color: #4b1e5a;
  color: #ffffff;
  border-color: #ffffff;
}

.outline-btn.ghost:hover,
.outline-btn.ghost:focus {
  background-color: rgba(255, 255, 255, 0.12);
  color: #fff;
}
</style>
