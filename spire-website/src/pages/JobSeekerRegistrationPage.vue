<template>
  <q-page class="job-seeker-page spire-form-page">
    <div class="page-inner spire-form-shell">
      <div class="top-section">
        <h1 class="title capitalize-prose">Welcome to Spire!</h1>
        <p class="subtitle capitalize-prose">
          To help us match you with the right opportunities, please share your details
          and upload your medical report and disability card.
        </p>
      </div>

      <div class="form-section">
        <q-form ref="formRef" @submit.prevent="goToIqIntro">
          <div class="form-row">
            <q-input
              v-model="fullName"
              label="Full Name"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Full Name Is Required']"
              @blur="fullName = titleCaseWords(fullName)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="phoneNumber"
              label="Phone Number"
              type="tel"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Phone Number Is Required']"
            />
            <q-select
              v-model="gender"
              :options="genderOptions"
              label="Gender"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Gender Is Required']"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="dateOfBirth"
              label="Date Of Birth"
              type="date"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Date Of Birth Is Required']"
            />
            <q-input
              v-model="age"
              label="Age"
              dense
              outlined
              class="form-input spire-form-field"
              readonly
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="address"
              label="Address"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Address Is Required']"
              @blur="address = titleCaseWords(address)"
            />
          </div>

          <div class="form-row">
            <q-select
              v-model="city"
              :options="cityOptions"
              label="City"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'City Is Required']"
            />
            <q-input
              v-model="institutionName"
              label="Institution Name"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Institution Name Is Required']"
              @blur="institutionName = titleCaseWords(institutionName)"
            />
          </div>

          <div class="form-row">
            <q-select
              v-model="educationType"
              :options="educationTypeOptions"
              label="Education Type"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Education Type Is Required']"
            />
            <q-select
              v-model="degree"
              :options="degreeOptions"
              label="Degree"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Degree Is Required']"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="field"
              label="Field"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Field Is Required']"
              @blur="field = titleCaseWords(field)"
            />
            <q-input
              v-model="speciality"
              label="Speciality"
              dense
              outlined
              class="form-input spire-form-field"
              :rules="[(val) => !!val || 'Speciality Is Required']"
              @blur="speciality = titleCaseWords(speciality)"
            />
          </div>

          <div class="form-row">
            <q-input
              v-model="skills"
              type="textarea"
              autogrow
              label="Skills"
              dense
              outlined
              class="form-input spire-form-field skills-textarea"
              :rules="[(val) => !!val || 'Skills Are Required']"
              @blur="skills = titleCaseCommaSeparated(skills)"
            />
          </div>

          <div class="form-row">
            <div class="file-input-group">
              <label class="file-label">Upload CV</label>
              <input type="file" class="file-input" @change="onCvFileChange" />
            </div>
          </div>

          <div class="form-row">
            <div class="file-input-group">
              <label class="file-label">Upload Medical File</label>
              <input type="file" class="file-input" @change="onMedicalFileChange" />
            </div>
          </div>

          <div class="form-row">
            <div class="file-input-group">
              <label class="file-label">Upload Disability Card</label>
              <input type="file" class="file-input" @change="onDisabilityFileChange" />
            </div>
          </div>

          <div v-if="fileError" class="file-error">{{ fileError }}</div>
          <div v-if="submitError" class="file-error">{{ submitError }}</div>
        </q-form>
      </div>

      <div class="bottom-actions">
        <q-btn
          no-caps
          class="outline-btn"
          label="Go Back"
          @click="goBack"
        />
        <q-btn
          no-caps
          class="outline-btn spire-form-submit"
          label="Continue"
          :loading="submitting"
          :disable="submitting"
          @click="goToIqIntro"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { deleteField } from 'firebase/firestore'
import { useUserStore } from 'src/stores/userStore'
import { useAuthStore } from 'src/stores/authStore'
import { uploadUserCV, updateUserProfile } from 'src/services/userService'
import {
  createMedicalProfile,
  uploadDisabilityCard,
  uploadMedicalReport,
} from 'src/services/iqTestService'
import { titleCaseWords, titleCaseCommaSeparated } from 'src/utils/textFormat'

const router = useRouter()
const $q = useQuasar()
const userStore = useUserStore()
const authStore = useAuthStore()

const formRef = ref(null)
const fileError = ref('')
const submitError = ref('')
const submitting = ref(false)
const fullName = ref('')
const phoneNumber = ref('')
const gender = ref(null)
const dateOfBirth = ref('')
const age = ref('')
const address = ref('')
const city = ref(null)
const institutionName = ref('')
const educationType = ref(null)
const degree = ref(null)
const field = ref('')
const speciality = ref('')
const skills = ref('')
const cvFile = ref(null)
const medicalFile = ref(null)
const disabilityFile = ref(null)

const genderOptions = ['Male', 'Female']

const cityOptions = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Port Said',
  'Suez',
  'Dakahlia',
  'Damietta',
  'Sharqia',
  'Qalyubia',
  'Kafr El Sheikh',
  'Gharbia',
  'Monufia',
  'Beheira',
  'Ismailia',
  'Beni Suef',
  'Faiyum',
  'Minya',
  'Asyut',
  'Sohag',
  'Qena',
  'Aswan',
  'Luxor',
  'Red Sea',
  'New Valley',
  'Matrouh',
  'North Sinai',
  'South Sinai',
]

const educationTypeOptions = [
  'National',
  'IGCSE',
  'American',
  'Other',
]

const degreeOptions = [
  'High School',
  'Bachelor',
  'Master',
  'Diploma',
  'PhD',
]

watch(dateOfBirth, (newDate) => {
  if (!newDate) {
    age.value = ''
    return
  }
  const birthDate = new Date(newDate)
  const today = new Date()
  let years = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    years--
  }
  age.value = years >= 0 ? String(years) : ''
})

function onCvFileChange(event) {
  cvFile.value = event.target.files?.[0] || null
}

function onMedicalFileChange(event) {
  medicalFile.value = event.target.files?.[0] || null
}

function onDisabilityFileChange(event) {
  disabilityFile.value = event.target.files?.[0] || null
}

function goBack() {
  router.back()
}

function normalizeFormForSave() {
  fullName.value = titleCaseWords(fullName.value)
  address.value = titleCaseWords(address.value)
  institutionName.value = titleCaseWords(institutionName.value)
  field.value = titleCaseWords(field.value)
  speciality.value = titleCaseWords(speciality.value)
  skills.value = titleCaseCommaSeparated(skills.value)
}

async function goToIqIntro() {
  if (submitting.value) return
  submitError.value = ''
  const valid = await formRef.value?.validate()
  if (!valid) return

  if (!cvFile.value || !medicalFile.value || !disabilityFile.value) {
    fileError.value = 'Upload CV, Medical File, And Disability Card To Continue.'
    return
  }

  fileError.value = ''
  normalizeFormForSave()

  submitting.value = true
  try {
    const uid = authStore.user?.uid
    if (!uid) {
      submitError.value = 'You must be signed in to continue.'
      $q.notify({ type: 'negative', message: submitError.value, position: 'top' })
      return
    }

    userStore.setName(fullName.value || 'Spire User')

    const skillsArr = skills.value.split(',').map((s) => s.trim()).filter(Boolean)
    const degreeLabel = [degree.value, educationType.value].filter(Boolean).join(' — ')

    /** Storage may 404 if the bucket is missing or Storage API is disabled; still save profile. */
    let cvFileUrl = ''
    try {
      cvFileUrl = await uploadUserCV(uid, cvFile.value)
    } catch (e) {
      console.warn('CV upload failed (continuing without file URL):', e)
    }

    let medicalReportFile = ''
    try {
      medicalReportFile = medicalFile.value
        ? await uploadMedicalReport(uid, medicalFile.value)
        : ''
    } catch (e) {
      console.warn('Medical file upload failed:', e)
    }

    let disabilityCardFile = ''
    try {
      disabilityCardFile = disabilityFile.value
        ? await uploadDisabilityCard(uid, disabilityFile.value)
        : ''
    } catch (e) {
      console.warn('Disability card upload failed:', e)
    }

    const uploadsMissing =
      !cvFileUrl || !medicalReportFile || !disabilityCardFile

    await updateUserProfile(uid, {
      name: fullName.value,
      role: 'jobseeker',
      email: authStore.user?.email || '',
      telephone: phoneNumber.value,
      gender: gender.value,
      dateOfBirth: dateOfBirth.value,
      age: Number(age.value || 0),
      address: `${address.value}, ${city.value || ''}`.trim(),
      city: city.value || '',
      institutionName: institutionName.value || '',
      education: `${educationType.value || ''} ${degree.value || ''}`.trim(),
      educationList: [
        {
          id: `edu-reg-${Date.now()}`,
          degree: titleCaseWords(degreeLabel) || 'Education',
          school: titleCaseWords(institutionName.value || ''),
          years: '—',
        },
      ],
      speciality: speciality.value,
      skills: skillsArr,
      cvFile: cvFileUrl,
      fieldDescription: deleteField(),
      registrationFilesPending: uploadsMissing,
    })

    await userStore.fetchProfile(uid)
    userStore.field = speciality.value || userStore.field

    await createMedicalProfile({
      userId: uid,
      disabilityType: field.value || 'General',
      level: degree.value || 'Unknown',
      description: institutionName.value || '',
      accessibilityNeed: speciality.value || '',
      disabilityCardFile,
      medicalReportFile,
    })

    if (uploadsMissing) {
      $q.notify({
        type: 'warning',
        message:
          'Your profile was saved, but some files could not be uploaded (Firebase Storage). Enable Storage in Firebase Console → Storage, or add documents later from your profile.',
        position: 'top',
        timeout: 12000,
        multiLine: true,
      })
    } else {
      $q.notify({ type: 'positive', message: 'Your details were saved', position: 'top' })
    }
    router.push({ path: '/job-seeker/iq-intro' })
  } catch (error) {
    console.error('Failed to submit job seeker registration:', error)
    const code = String(error?.code || '')
    let msg = error?.message || 'Could not save your details. Please try again.'
    if (code.includes('storage') || /404/i.test(msg)) {
      msg =
        'Saving failed. If Firestore is OK, check Firebase Console → Storage (enable it) and that `storageBucket` in `src/boot/firebase.js` matches Project settings.'
    }
    submitError.value = msg
    $q.notify({ type: 'negative', message: msg, position: 'top', timeout: 8000 })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.job-seeker-page {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  background-color: #4B1E5A;
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

.form-input :deep(.q-field__control) {
  border-radius: 20px;
  background-color: #ffffff;
}

.skills-textarea :deep(.q-field__control) {
  min-height: 140px;
  align-items: flex-start;
}

.skills-textarea :deep(textarea) {
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

.form-input {
  margin-bottom: 12px;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.file-input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-bottom: 12px;
  width: 100%;
}

.file-label {
  font-size: 13px;
  margin-bottom: 4px;
}

.file-input {
  border-radius: 20px;
  border: none;
  padding: 10px 12px;
  font-size: 13px;
  background-color: #ffffff;
  color: #4B1E5A;
}

.file-input::file-selector-button {
  border: none;
  border-radius: 16px;
  padding: 6px 12px;
  margin-right: 8px;
  background-color: #4B1E5A;
  color: #ffffff;
  cursor: pointer;
}

.file-error {
  color: #ffd1d1;
  font-size: 12px;
  margin-top: 2px;
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
  color: #4B1E5A;
  border: 2px solid #ffffff;
  font-weight: 600;
  height: 44px;
  transition: all 0.2s ease;
}

.outline-btn:hover,
.outline-btn:focus {
  background-color: #4B1E5A;
  color: #ffffff;
  border-color: #ffffff;
}
</style>
