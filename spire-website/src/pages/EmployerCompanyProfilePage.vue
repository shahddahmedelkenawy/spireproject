<template>
  <q-page class="job-seeker-page spire-form-page">
    <div class="page-inner spire-form-shell">
      <div class="top-section">
        <h1 class="title capitalize-prose">Welcome to Spire!</h1>
        <p class="subtitle capitalize-prose">
          Complete your company profile to continue.
        </p>
      </div>

      <div class="form-section">
        <q-form ref="formRef" @submit.prevent="save">
          <div class="form-row">
            <q-input
              v-model="form.companyName"
              label="Company Name"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Company Name Is Required']"
              @blur="form.companyName = titleCaseWords(form.companyName)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.employerName"
              label="Employer Name"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Employer Name Is Required']"
              @blur="form.employerName = titleCaseWords(form.employerName)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.address"
              label="Address"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Address Is Required']"
              @blur="form.address = titleCaseWords(form.address)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.telephone"
              label="Phone Number"
              type="tel"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Phone Number Is Required']"
            />
            <q-input
              v-model="form.taxesId"
              label="Taxes ID"
              dense
              outlined
              class="form-input spire-form-field"
              maxlength="9"
              inputmode="numeric"
              mask="#########"
              :rules="taxesIdRules"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.industry"
              label="Industry"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Industry Is Required']"
              @blur="form.industry = titleCaseWords(form.industry)"
            />
            <q-select
              v-model="form.companyType"
              :options="['Governmental Org', 'Private Org']"
              label="Company Type"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Company Type Is Required']"
            />
          </div>

          <div v-if="form.companyType === 'Governmental Org'" class="form-row">
            <q-input
              v-model="form.workingDays"
              label="Working Days"
              dense
              outlined
              class="form-input spire-form-field"
              type="number"
              :rules="[(val) => !!val || 'Working Days Is Required']"
            />
            <q-input
              v-model="form.workingHours"
              label="Working Hours"
              dense
              outlined
              class="form-input spire-form-field"
              type="number"
              :rules="[(val) => !!val || 'Working Hours Is Required']"
            />
          </div>

          <div v-if="form.companyType === 'Private Org'" class="form-row">
            <q-select
              v-model="form.country"
              :options="countryFilterOptions"
              use-input
              input-debounce="0"
              label="Country"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Country Is Required']"
              @filter="filterCountries"
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

          <div class="form-row">
            <q-input
              v-model="form.rules"
              label="Rules"
              dense
              outlined
              type="textarea"
              autogrow
              class="form-input spire-form-field large-textarea"
              :rules="[(val) => !!val || 'Rules Are Required']"
              @blur="form.rules = titleCaseMultiline(form.rules)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="form.accessibilityFeatures"
              label="Accessibility Features"
              dense
              outlined
              type="textarea"
              autogrow
              class="form-input spire-form-field large-textarea"
              :rules="[(val) => !!val || 'Accessibility Features Are Required']"
              @blur="form.accessibilityFeatures = titleCaseMultiline(form.accessibilityFeatures)"
            />
          </div>
        </q-form>
      </div>

      <div class="bottom-actions">
        <q-btn no-caps class="outline-btn" label="Go Back" @click="goBack" />
        <q-btn
          no-caps
          class="outline-btn spire-form-submit"
          label="Continue"
          :loading="loading"
          @click="save"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { createCompany } from 'src/services/companyService'
import { useUserStore } from 'src/stores/userStore'
import { titleCaseWords, titleCaseMultiline } from 'src/utils/textFormat'
import { countryNames } from 'src/data/countryNames'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const form = ref({
  companyName: '',
  employerName: '',
  address: '',
  telephone: '',
  companyType: null,
  workingDays: '',
  workingHours: '',
  country: 'Egypt',
  taxesId: '',
  industry: '',
  description: '',
  rules: '',
  accessibilityFeatures: '',
})

const countryFilterOptions = ref([...countryNames])

function filterCountries(val, update) {
  update(() => {
    const needle = (val || '').toLowerCase()
    countryFilterOptions.value = needle
      ? countryNames.filter((c) => c.toLowerCase().includes(needle))
      : [...countryNames]
  })
}

const taxesIdRules = [
  (val) => !!val || 'Taxes ID Is Required',
  (val) => /^\d{9}$/.test(String(val || '').trim()) || 'Taxes ID Must Be Nine Digits',
]

function goBack() {
  router.back()
}

function normalizeFormForSave() {
  form.value.companyName = titleCaseWords(form.value.companyName)
  form.value.employerName = titleCaseWords(form.value.employerName)
  form.value.address = titleCaseWords(form.value.address)
  form.value.industry = titleCaseWords(form.value.industry)
  form.value.description = titleCaseMultiline(form.value.description)
  form.value.rules = titleCaseMultiline(form.value.rules)
  form.value.accessibilityFeatures = titleCaseMultiline(form.value.accessibilityFeatures)
}

async function save() {
  const valid = await formRef.value?.validate()
  if (!valid || !authStore.user?.uid) return

  loading.value = true
  try {
    normalizeFormForSave()
    const taxesDigits = String(form.value.taxesId || '').trim()

    await userStore.saveProfile(authStore.user.uid, {
      name: form.value.employerName,
      role: 'employer',
      telephone: form.value.telephone.trim(),
      email: authStore.user?.email || userStore.email || '',
      companyName: form.value.companyName.trim(),
    })

    await createCompany({
      ownerId: authStore.user.uid,
      name: form.value.companyName,
      email: userStore.email || authStore.user?.email || '',
      telephone: form.value.telephone.trim(),
      description: form.value.description,
      taxesId: taxesDigits,
      industry: form.value.industry,
      accessibilityFeatures: form.value.accessibilityFeatures,
      rules: form.value.rules,
      address: form.value.address,
      paymentFeeType: 'monthly',
      type: form.value.companyType === 'Governmental Org' ? 'government' : 'private',
      workingDays: Number(form.value.workingDays || 0),
      workingHours: Number(form.value.workingHours || 0),
      country: form.value.companyType === 'Private Org' ? form.value.country : 'Egypt',
    })

    await userStore.fetchProfile(authStore.user.uid)
    $q.notify({ type: 'positive', message: 'Company profile saved', position: 'top' })
    router.push('/employer/dashboard')
  } catch (error) {
    console.error('Failed to save company profile:', error)
    $q.notify({
      type: 'negative',
      message: error?.message || 'Could not save company profile',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
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

.capitalize-prose {
  text-transform: capitalize;
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

.outline-btn:hover,
.outline-btn:focus {
  background-color: #4b1e5a;
  color: #ffffff;
  border-color: #ffffff;
}
</style>
