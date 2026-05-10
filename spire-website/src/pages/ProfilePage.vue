<template>
  <q-page class="jsp-page">
    <div v-if="profileLoading" class="jsp-inner jsp-loading">
      <q-spinner color="primary" size="40px" />
      <p class="loading-text">Loading your profile…</p>
    </div>
    <!-- Read-only profile -->
    <div v-else-if="!editMode" class="jsp-inner">
      <div class="profile-card profile-card--hero">
        <div class="hero-center">
          <div class="hero-avatar-wrap">
            <q-avatar size="96px" class="hero-avatar">
              <img v-if="profilePhotoUrl" :src="profilePhotoUrl" alt="" class="hero-avatar-img">
              <span v-else>{{ initials }}</span>
            </q-avatar>
            <q-btn
              round
              dense
              unelevated
              icon="add"
              size="sm"
              class="avatar-edit-fab"
              aria-label="Add or change profile photo"
              @click="pickAvatar"
            />
          </div>
          <h1 class="hero-name">{{ displayName }}</h1>
          <p v-if="jobTitleLine" class="hero-title">{{ jobTitleLine }}</p>
          <div class="hero-meta-row">
            <q-icon name="place" size="18px" class="meta-icon" />
            <span>{{ locationLine }}</span>
          </div>
          <div class="hero-meta-row">
            <q-icon name="email" size="18px" class="meta-icon" />
            <span class="meta-email">{{ emailLine }}</span>
          </div>
          <div v-if="telephoneLine" class="hero-meta-row">
            <q-icon name="phone" size="18px" class="meta-icon" />
            <span>{{ telephoneLine }}</span>
          </div>
          <p class="connections-line">
            {{ connectionsLabel }}
          </p>
          <q-btn
            no-caps
            unelevated
            class="edit-profile-pill"
            @click="enterEditMode"
          >
            <q-icon name="edit" size="20px" class="q-mr-sm" />
            Edit Profile
          </q-btn>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">About</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Edit about" @click="openAboutDialog" />
        </div>
        <p class="about-text">{{ aboutParagraph }}</p>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Experience</h2>
          <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openExpDialog" />
        </div>
        <div v-if="!experienceRows.length" class="empty-hint">No experience added yet.</div>
        <div
          v-for="item in experienceRows"
          :key="item.id || item.title"
          class="exp-row"
        >
          <div class="exp-logo">
            <q-icon name="work" size="22px" color="grey-7" />
          </div>
          <div class="exp-body">
            <div class="exp-title">{{ item.title }}</div>
            <div class="exp-sub">{{ item.company }}</div>
            <div class="exp-duration">{{ item.duration || '—' }}</div>
            <q-badge v-if="item.current" color="positive" text-color="white" class="current-badge">
              Current
            </q-badge>
          </div>
          <q-btn flat round dense icon="edit" size="sm" class="item-edit" @click="editExperienceRow(item)" />
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Education</h2>
          <div class="card-head-actions">
            <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Edit education" @click="openEduEditDialog" />
            <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openEduDialog" />
          </div>
        </div>
        <div v-if="!educationRows.length" class="empty-hint">No education added yet.</div>
        <div
          v-for="item in educationRows"
          :key="item.id || item.degree"
          class="exp-row"
        >
          <div class="exp-logo">
            <q-icon name="school" size="22px" color="grey-7" />
          </div>
          <div class="exp-body">
            <div class="exp-title">{{ item.degree }}</div>
            <div class="exp-sub">{{ item.school }}</div>
            <div class="exp-duration">{{ item.years || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">CV File</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Upload CV" @click="pickCv" />
        </div>
        <div class="file-link-row">
          <a
            v-if="cvUrl"
            :href="cvUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="file-link"
          >Open CV</a>
          <span v-else class="empty-hint">No file uploaded</span>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Medical File</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Upload medical file" @click="pickMedical" />
        </div>
        <div class="file-link-row">
          <a
            v-if="medicalUrl"
            :href="medicalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="file-link"
          >Open medical file</a>
          <span v-else class="empty-hint">No file uploaded</span>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Disability Card</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Upload disability card" @click="pickDisability" />
        </div>
        <div class="file-link-row">
          <a
            v-if="disabilityUrl"
            :href="disabilityUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="file-link"
          >Open disability card</a>
          <span v-else class="empty-hint">No file uploaded</span>
        </div>
      </div>

      <div v-if="hasAccountDetails" class="profile-card">
        <h2 class="card-title card-title--solo">Account details</h2>
        <div v-if="genderLine" class="detail-row">
          <span class="detail-label">Gender</span>
          <span class="detail-value">{{ genderLine }}</span>
        </div>
        <div v-if="dateOfBirthLine" class="detail-row">
          <span class="detail-label">Date of birth</span>
          <span class="detail-value">{{ dateOfBirthLine }}</span>
        </div>
        <div v-if="ageLine != null" class="detail-row">
          <span class="detail-label">Age</span>
          <span class="detail-value">{{ ageLine }}</span>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Skills</h2>
          <div class="card-head-actions">
            <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Edit skills" @click="openSkillsEditDialog" />
            <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openSkillDialog" />
          </div>
        </div>
        <ul v-if="skillsList.length" class="skills-list">
          <li v-for="skill in skillsList" :key="skill" class="skill-item">
            <span class="skill-dot" />
            <span>{{ skill }}</span>
          </li>
        </ul>
        <p v-else class="empty-hint">No skills listed yet.</p>
      </div>

      <div class="profile-card profile-card--logout">
        <q-btn
          no-caps
          unelevated
          class="logout-btn"
          label="Logout"
          :loading="loggingOut"
          @click="handleLogout"
        />
      </div>
    </div>

    <!-- Edit profile: layout aligned with employer profile edit mode -->
    <div v-else class="jsp-inner jsp-edit-inner">
      <div class="profile-card profile-card--hero">
        <div class="hero-center hero-center--edit">
          <div class="hero-avatar-wrap">
            <q-avatar size="96px" class="hero-avatar">
              <img v-if="profilePhotoUrl" :src="profilePhotoUrl" alt="" class="hero-avatar-img">
              <span v-else>{{ editInitials }}</span>
            </q-avatar>
            <q-btn
              round
              dense
              unelevated
              icon="add"
              size="sm"
              class="avatar-edit-fab"
              aria-label="Add or change profile photo"
              @click="pickAvatar"
            />
          </div>
          <q-input v-model="editForm.name" outlined dense label="Name" class="edit-field" />
          <q-input v-model="editForm.speciality" outlined dense label="Speciality" class="edit-field" />
          <q-input v-model="editForm.address" outlined dense label="City / address" class="edit-field" />
          <q-input v-model="editForm.email" outlined dense label="Email" type="email" class="edit-field" />
          <p class="connections-line connections-line--edit">
            {{ connectionsLabel }}
          </p>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">About</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Edit about" @click="openAboutDialog" />
        </div>
        <q-input
          v-model="editForm.bio"
          outlined
          type="textarea"
          autogrow
          :input-style="{ minHeight: '120px' }"
          label="About you"
          class="edit-about-input"
        />
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Experience</h2>
          <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openExpDialog" />
        </div>
        <div v-if="!experienceRows.length" class="empty-hint">No experience added yet.</div>
        <div
          v-for="item in experienceRows"
          :key="item.id || item.title"
          class="exp-row"
        >
          <div class="exp-logo">
            <q-icon name="work" size="22px" color="grey-7" />
          </div>
          <div class="exp-body">
            <div class="exp-title">{{ item.title }}</div>
            <div class="exp-sub">{{ item.company }}</div>
            <div class="exp-duration">{{ item.duration || '—' }}</div>
            <q-badge v-if="item.current" color="positive" text-color="white" class="current-badge">
              Current
            </q-badge>
          </div>
          <q-btn flat round dense icon="edit" size="sm" class="item-edit" @click="editExperienceRow(item)" />
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Education</h2>
          <div class="card-head-actions">
            <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Edit education" @click="openEduEditDialog" />
            <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openEduDialog" />
          </div>
        </div>
        <div v-if="!educationRows.length" class="empty-hint">No education added yet.</div>
        <div
          v-for="item in educationRows"
          :key="item.id || item.degree"
          class="exp-row"
        >
          <div class="exp-logo">
            <q-icon name="school" size="22px" color="grey-7" />
          </div>
          <div class="exp-body">
            <div class="exp-title">{{ item.degree }}</div>
            <div class="exp-sub">{{ item.school }}</div>
            <div class="exp-duration">{{ item.years || '—' }}</div>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">CV File</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Upload CV" @click="pickCv" />
        </div>
        <div class="file-link-row">
          <a
            v-if="cvUrl"
            :href="cvUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="file-link"
          >Open CV</a>
          <span v-else class="empty-hint">No file uploaded</span>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Medical File</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Upload medical file" @click="pickMedical" />
        </div>
        <div class="file-link-row">
          <a
            v-if="medicalUrl"
            :href="medicalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="file-link"
          >Open medical file</a>
          <span v-else class="empty-hint">No file uploaded</span>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Disability Card</h2>
          <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Upload disability card" @click="pickDisability" />
        </div>
        <div class="file-link-row">
          <a
            v-if="disabilityUrl"
            :href="disabilityUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="file-link"
          >Open disability card</a>
          <span v-else class="empty-hint">No file uploaded</span>
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Skills</h2>
          <div class="card-head-actions">
            <q-btn flat round dense icon="edit" class="card-head-btn" aria-label="Edit skills" @click="openSkillsEditDialog" />
            <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openSkillDialog" />
          </div>
        </div>
        <q-input
          v-model="editForm.skillsText"
          outlined
          type="textarea"
          autogrow
          label="Skills (comma separated)"
          class="edit-skills-input"
        />
      </div>

      <div class="edit-actions">
        <q-btn
          outline
          no-caps
          class="edit-footer-btn"
          label="Cancel"
          :disable="savingEdit"
          @click="cancelEditMode"
        />
        <q-btn
          no-caps
          unelevated
          class="edit-footer-btn dialog-save"
          label="Save changes"
          :loading="savingEdit"
          @click="saveProfileEdit"
        />
      </div>
    </div>

    <q-dialog v-model="aboutDialog">
      <q-card class="dialog-card dialog-card--about">
        <q-card-section class="dialog-title">About</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="aboutDraft"
            outlined
            type="textarea"
            label="Tell others about yourself"
            class="about-dialog-input"
            :input-style="{ minHeight: '220px' }"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup @click="closeAboutDialog" />
          <q-btn unelevated class="dialog-save" label="Save changes" @click="saveAboutDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="eduEditDialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Edit education</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="eduEditForm.degree" outlined dense label="Degree" />
          <q-input v-model="eduEditForm.school" outlined dense label="University / school" />
          <q-input v-model="eduEditForm.years" outlined dense label="Years (e.g. 2018 – 2022)" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeEduEditDialog" />
          <q-btn unelevated class="dialog-save" label="Save changes" @click="saveEducationEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="expDialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">{{ expEditingId ? 'Edit experience' : 'Add experience' }}</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="expForm.title" outlined dense label="Job title" />
          <q-input v-model="expForm.company" outlined dense label="Company" />
          <q-input v-model="expForm.duration" outlined dense label="Duration (e.g. 2022 – Present)" />
          <q-checkbox v-model="expForm.current" label="Current role" color="primary" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated class="dialog-save" label="Save" @click="saveExperience" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="eduDialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Add education</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="eduForm.degree" outlined dense label="Degree" />
          <q-input v-model="eduForm.school" outlined dense label="University / school" />
          <q-input v-model="eduForm.years" outlined dense label="Years (e.g. 2018 – 2022)" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated class="dialog-save" label="Save" @click="saveEducation" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="skillDialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Add skill</q-card-section>
        <q-card-section>
          <q-input v-model="skillInput" outlined dense label="Skill name" @keyup.enter="saveSkill" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated class="dialog-save" label="Add" @click="saveSkill" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="skillsEditDialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Edit skills</q-card-section>
        <q-card-section>
          <q-input
            v-model="skillsEditDraft"
            outlined
            type="textarea"
            label="Skills (comma separated)"
            :input-style="{ minHeight: '140px' }"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="closeSkillsEditDialog" />
          <q-btn unelevated class="dialog-save" label="Save changes" @click="saveSkillsEdit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Single set of file inputs — always mounted so pickFiles() works in view and edit mode -->
    <div class="jsp-file-launcher" aria-hidden="true">
      <q-file
        ref="avatarFileRef"
        v-model="avatarFileModel"
        class="jsp-hidden-file"
        accept="*/*"
        max-files="1"
        @update:model-value="onAvatarFile"
      />
      <!-- Native file inputs — .click() from pen buttons opens the device picker reliably -->
      <input
        ref="cvNativeInput"
        type="file"
        class="jsp-native-file"
        @change="onCvFileChange"
      >
      <input
        ref="medicalNativeInput"
        type="file"
        class="jsp-native-file"
        @change="onMedicalFileChange"
      >
      <input
        ref="disabilityNativeInput"
        type="file"
        class="jsp-native-file"
        @change="onDisabilityFileChange"
      >
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onActivated, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/userStore'
import { useAuthStore } from 'src/stores/authStore'
import {
  countAcceptedConnectionsForUser,
  updateUserProfile,
  uploadUserCV,
  uploadProfilePhoto,
} from 'src/services/userService'
import {
  getMedicalProfileByUser,
  attachMedicalFileToProfile,
} from 'src/services/iqTestService'
import { capitalizeProseWords } from 'src/utils/textFormat'
import { firebaseErrorMessage } from 'src/utils/firebaseErrorMessages'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

const loggingOut = ref(false)
const savingEdit = ref(false)
const profileLoading = ref(true)
const editMode = ref(false)
const medical = ref(null)
const avatarFileRef = ref(null)
const avatarFileModel = ref(null)
const cvNativeInput = ref(null)
const medicalNativeInput = ref(null)
const disabilityNativeInput = ref(null)

const aboutDialog = ref(false)
const aboutDraft = ref('')

const eduEditDialog = ref(false)
const eduEditForm = ref({
  degree: '',
  school: '',
  years: '',
})
const eduEditFirstId = ref(null)

const expDialog = ref(false)
const expEditingId = ref(null)
const eduDialog = ref(false)
const skillDialog = ref(false)
const skillsEditDialog = ref(false)
const skillsEditDraft = ref('')
const skillInput = ref('')

const expForm = ref({
  title: '',
  company: '',
  duration: '',
  current: false,
})
const eduForm = ref({
  degree: '',
  school: '',
  years: '',
})

const editForm = ref({
  name: '',
  speciality: '',
  address: '',
  email: '',
  bio: '',
  skillsText: '',
})

const editFormSnapshot = ref(null)

const initials = computed(() => {
  const raw = (userStore.profile?.name || userStore.name || '').trim()
  const parts = raw.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
})

const editInitials = computed(() => {
  const n = (editForm.value.name || userStore.profile?.name || userStore.name || '').trim()
  const parts = n.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
})

const profilePhotoUrl = computed(() => userStore.profile?.profilePhotoUrl || '')

const displayName = computed(() => {
  const n = userStore.profile?.name || userStore.name
  if (n && String(n).trim()) return capitalizeProseWords(String(n).trim())
  return 'Your name'
})

const jobTitleLine = computed(() => {
  const p = userStore.profile
  const raw = p?.speciality || p?.fieldDescription || userStore.field
  if (!raw || !String(raw).trim()) return ''
  return capitalizeProseWords(String(raw).trim())
})

const locationLine = computed(() => {
  const p = userStore.profile
  const a = p?.address || p?.city || ''
  if (a && String(a).trim()) return String(a).trim()
  return 'Add your location'
})

const emailLine = computed(
  () =>
    userStore.profile?.email ||
    authStore.user?.email ||
    userStore.email ||
    '—',
)

const telephoneLine = computed(() => {
  const t = userStore.profile?.telephone || userStore.profile?.phone
  if (t && String(t).trim()) return String(t).trim()
  return ''
})

const connectionsLabel = computed(() => {
  const n = userStore.connectionsCount
  if (n >= 500) return '500+ Connections'
  return `${n} Connections`
})

/** Bio only from Firestore — no synthetic text from speciality/education */
const aboutParagraph = computed(() => {
  const p = userStore.profile
  if (p?.bio && String(p.bio).trim()) return p.bio
  return 'Tell employers about your background and goals — use the pen icon to add a bio.'
})

const skillsList = computed(() => {
  const s = userStore.profile?.skills
  if (Array.isArray(s) && s.length) return s.map((x) => String(x).trim()).filter(Boolean)
  if (typeof s === 'string' && s.trim()) {
    return s
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => capitalizeProseWords(x))
  }
  return []
})

const hasAccountDetails = computed(() => {
  const p = userStore.profile
  if (!p) return false
  return !!(p.gender || p.dateOfBirth || p.age != null)
})

const genderLine = computed(() => {
  const g = userStore.profile?.gender
  return g && String(g).trim() ? String(g).trim() : ''
})

const dateOfBirthLine = computed(() => {
  const d = userStore.profile?.dateOfBirth
  return d && String(d).trim() ? String(d).trim() : ''
})

const ageLine = computed(() => {
  const a = userStore.profile?.age
  if (a == null || a === '') return null
  const n = Number(a)
  return Number.isNaN(n) ? String(a) : n
})

/** Experience: `experienceList` in DB only (no derived row) */
const experienceRows = computed(() => {
  const list = userStore.profile?.experienceList
  if (Array.isArray(list) && list.length) return list
  return []
})

/** Education: `educationList` from DB, or legacy `education` string from registration */
const educationRows = computed(() => {
  const p = userStore.profile
  const list = p?.educationList
  if (Array.isArray(list) && list.length) return list
  const edu = p?.education
  if (edu && String(edu).trim()) {
    return [
      {
        id: 'legacy-education',
        degree: capitalizeProseWords(p?.speciality || 'Education'),
        school: capitalizeProseWords(String(edu).trim()),
        years: '—',
      },
    ]
  }
  return []
})

const cvUrl = computed(() => userStore.profile?.cvFile || '')
const medicalUrl = computed(() => medical.value?.medicalReportFile || '')
const disabilityUrl = computed(() => medical.value?.disabilityCardFile || '')

async function pickAvatar() {
  await nextTick()
  avatarFileRef.value?.pickFiles?.()
}

async function onAvatarFile(file) {
  avatarFileModel.value = null
  const uid = authStore.user?.uid
  const f = Array.isArray(file) ? file[0] : file
  if (!uid || !f) return
  try {
    await uploadProfilePhoto(uid, f)
    await userStore.fetchProfile(uid)
    if (editMode.value) {
      syncEditFormFromProfile()
    }
    $q.notify({ type: 'positive', message: 'Profile photo updated', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: firebaseErrorMessage(e), position: 'top' })
  }
}

function pickCv() {
  cvNativeInput.value?.click()
}

function pickMedical() {
  medicalNativeInput.value?.click()
}

function pickDisability() {
  disabilityNativeInput.value?.click()
}

function onCvFileChange(evt) {
  const input = evt.target
  const file = input.files?.[0]
  input.value = ''
  void onCvFile(file)
}

function onMedicalFileChange(evt) {
  const input = evt.target
  const file = input.files?.[0]
  input.value = ''
  void onMedicalFile(file)
}

function onDisabilityFileChange(evt) {
  const input = evt.target
  const file = input.files?.[0]
  input.value = ''
  void onDisabilityFile(file)
}

function syncEditFormFromProfile() {
  const p = userStore.profile || {}
  const skillsRaw = p.skills
  const skillsText =
    Array.isArray(skillsRaw)
      ? skillsRaw.join(', ')
      : typeof skillsRaw === 'string'
        ? skillsRaw
        : ''
  editForm.value = {
    name: p.name || userStore.name || '',
    speciality: p.speciality || p.fieldDescription || userStore.field || '',
    address: (p.address || p.city || '').trim(),
    email: p.email || authStore.user?.email || userStore.email || '',
    bio: (p.bio || '').trim(),
    skillsText,
  }
}

function enterEditMode() {
  syncEditFormFromProfile()
  editFormSnapshot.value = JSON.parse(JSON.stringify(editForm.value))
  editMode.value = true
}

function cancelEditMode() {
  if (editFormSnapshot.value) {
    editForm.value = JSON.parse(JSON.stringify(editFormSnapshot.value))
  }
  editFormSnapshot.value = null
  editMode.value = false
}

async function saveProfileEdit() {
  const uid = authStore.user?.uid
  if (!uid) return
  savingEdit.value = true
  try {
    const f = editForm.value
    const skills = f.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => capitalizeProseWords(s))
    await updateUserProfile(uid, {
      name: capitalizeProseWords((f.name || '').trim()) || f.name,
      speciality: capitalizeProseWords((f.speciality || '').trim()) || f.speciality,
      address: (f.address || '').trim(),
      email: (f.email || '').trim(),
      bio: (f.bio || '').trim(),
      skills,
    })
    await userStore.fetchProfile(uid)
    medical.value = await getMedicalProfileByUser(uid)
    userStore.setConnectionsCount(await countAcceptedConnectionsForUser(uid))
    editFormSnapshot.value = null
    editMode.value = false
    $q.notify({ type: 'positive', message: 'Profile saved', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    savingEdit.value = false
  }
}

function openAboutDialog() {
  aboutDraft.value = (userStore.profile?.bio || '').trim()
  aboutDialog.value = true
}

function closeAboutDialog() {
  aboutDialog.value = false
}

async function saveAboutDialog() {
  const uid = authStore.user?.uid
  if (!uid) return
  try {
    await updateUserProfile(uid, { bio: aboutDraft.value.trim() })
    await userStore.fetchProfile(uid)
    if (editMode.value) syncEditFormFromProfile()
    aboutDialog.value = false
    $q.notify({ type: 'positive', message: 'About saved', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  }
}

function openEduEditDialog() {
  const list = userStore.profile?.educationList
  const first = Array.isArray(list) && list.length ? list[0] : null
  eduEditFirstId.value = first?.id || null
  eduEditForm.value = {
    degree: first?.degree || '',
    school: first?.school || '',
    years: first?.years || '',
  }
  eduEditDialog.value = true
}

function closeEduEditDialog() {
  eduEditDialog.value = false
}

async function saveEducationEdit() {
  const uid = authStore.user?.uid
  if (!uid) return
  const { degree, school, years } = eduEditForm.value
  if (!degree.trim() || !school.trim()) {
    $q.notify({ type: 'warning', message: 'Enter degree and school', position: 'top' })
    return
  }
  const row = {
    id: eduEditFirstId.value || `edu-${Date.now()}`,
    degree: capitalizeProseWords(degree.trim()),
    school: capitalizeProseWords(school.trim()),
    years: years.trim() || '—',
  }
  const prev = Array.isArray(userStore.profile?.educationList)
    ? [...userStore.profile.educationList]
    : []
  const next = prev.length ? [row, ...prev.slice(1)] : [row]
  try {
    await updateUserProfile(uid, { educationList: next })
    await userStore.fetchProfile(uid)
    eduEditDialog.value = false
    $q.notify({ type: 'positive', message: 'Education saved', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  }
}

function openExpDialog() {
  expEditingId.value = null
  expForm.value = { title: '', company: '', duration: '', current: false }
  expDialog.value = true
}

function editExperienceRow(item) {
  expEditingId.value = item.id || null
  expForm.value = {
    title: item.title || '',
    company: item.company || '',
    duration: item.duration || '',
    current: !!item.current,
  }
  expDialog.value = true
}

function openEduDialog() {
  eduForm.value = { degree: '', school: '', years: '' }
  eduDialog.value = true
}

function openSkillDialog() {
  skillInput.value = ''
  skillDialog.value = true
}

function openSkillsEditDialog() {
  skillsEditDraft.value = Array.isArray(userStore.profile?.skills)
    ? userStore.profile.skills.join(', ')
    : ''
  skillsEditDialog.value = true
}

function closeSkillsEditDialog() {
  skillsEditDialog.value = false
}

async function saveSkillsEdit() {
  const uid = authStore.user?.uid
  if (!uid) return
  const skills = skillsEditDraft.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => capitalizeProseWords(s))
  try {
    await updateUserProfile(uid, { skills })
    await userStore.fetchProfile(uid)
    if (editMode.value) syncEditFormFromProfile()
    skillsEditDialog.value = false
    $q.notify({ type: 'positive', message: 'Skills saved', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  }
}

async function saveExperience() {
  const uid = authStore.user?.uid
  if (!uid) return
  const { title, company, duration, current } = expForm.value
  if (!title.trim()) {
    $q.notify({ type: 'warning', message: 'Enter a job title', position: 'top' })
    return
  }
  const prev = Array.isArray(userStore.profile?.experienceList)
    ? [...userStore.profile.experienceList]
    : []
  const row = {
    id: expEditingId.value || `exp-${Date.now()}`,
    title: capitalizeProseWords(title.trim()),
    company: capitalizeProseWords(company.trim() || ''),
    duration: duration.trim() || '—',
    current: !!current,
  }
  const withoutOld = expEditingId.value ? prev.filter((x) => x.id !== expEditingId.value) : prev
  await updateUserProfile(uid, { experienceList: [...withoutOld, row] })
  await userStore.fetchProfile(uid)
  expDialog.value = false
  expEditingId.value = null
  $q.notify({ type: 'positive', message: 'Experience saved', position: 'top' })
}

async function saveEducation() {
  const uid = authStore.user?.uid
  if (!uid) return
  const { degree, school, years } = eduForm.value
  if (!degree.trim() || !school.trim()) {
    $q.notify({ type: 'warning', message: 'Enter degree and school', position: 'top' })
    return
  }
  const prev = Array.isArray(userStore.profile?.educationList)
    ? [...userStore.profile.educationList]
    : []
  const row = {
    id: `edu-${Date.now()}`,
    degree: capitalizeProseWords(degree.trim()),
    school: capitalizeProseWords(school.trim()),
    years: years.trim() || '—',
  }
  await updateUserProfile(uid, { educationList: [...prev, row] })
  await userStore.fetchProfile(uid)
  eduDialog.value = false
  $q.notify({ type: 'positive', message: 'Education saved', position: 'top' })
}

async function saveSkill() {
  const uid = authStore.user?.uid
  if (!uid) return
  const s = skillInput.value.trim()
  if (!s) return
  const raw = Array.isArray(userStore.profile?.skills) ? [...userStore.profile.skills] : []
  const prev = raw.filter((x) => String(x).toLowerCase() !== s.toLowerCase())
  const next = [...prev, capitalizeProseWords(s)]
  await updateUserProfile(uid, { skills: next })
  await userStore.fetchProfile(uid)
  if (editMode.value) syncEditFormFromProfile()
  skillDialog.value = false
  skillInput.value = ''
  $q.notify({ type: 'positive', message: 'Skill added', position: 'top' })
}

async function onCvFile(file) {
  const uid = authStore.user?.uid
  if (!uid || !file) return
  try {
    await uploadUserCV(uid, file)
    await userStore.fetchProfile(uid)
    $q.notify({ type: 'positive', message: 'CV uploaded', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: firebaseErrorMessage(e), position: 'top' })
  }
}

async function onMedicalFile(file) {
  const uid = authStore.user?.uid
  if (!uid || !file) return
  try {
    await attachMedicalFileToProfile(uid, 'medicalReportFile', file)
    medical.value = await getMedicalProfileByUser(uid)
    await userStore.fetchProfile(uid)
    $q.notify({ type: 'positive', message: 'Medical file uploaded', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: firebaseErrorMessage(e), position: 'top' })
  }
}

async function onDisabilityFile(file) {
  const uid = authStore.user?.uid
  if (!uid || !file) return
  try {
    await attachMedicalFileToProfile(uid, 'disabilityCardFile', file)
    medical.value = await getMedicalProfileByUser(uid)
    $q.notify({ type: 'positive', message: 'Disability card uploaded', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: firebaseErrorMessage(e), position: 'top' })
  }
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await authStore.logout()
    router.push({ path: '/' })
  } finally {
    loggingOut.value = false
  }
}

async function loadProfileData() {
  const uid = authStore.user?.uid
  if (!uid) {
    profileLoading.value = false
    return
  }
  profileLoading.value = true
  try {
    await userStore.fetchProfile(uid)
    medical.value = await getMedicalProfileByUser(uid)
    userStore.setConnectionsCount(await countAcceptedConnectionsForUser(uid))
  } finally {
    profileLoading.value = false
  }
}

onActivated(() => loadProfileData())

watch(
  () => authStore.user?.uid,
  (uid) => {
    if (uid) loadProfileData()
  },
  { immediate: true },
)
</script>

<style scoped>
.jsp-page {
  background: #f0f0f2;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  min-height: 100%;
  padding-top: env(safe-area-inset-top);
}

.jsp-inner {
  width: 100%;
  max-width: var(--spire-content-max);
  margin: 0 auto;
  padding: 16px var(--spire-layout-gutter);
  box-sizing: border-box;
}

.jsp-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 50vh;
  color: #4b1e5a;
}

.loading-text {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.875rem;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #888;
  flex-shrink: 0;
}

.detail-value {
  color: #1a1a1a;
  font-weight: 600;
  text-align: right;
  word-break: break-word;
}

.jsp-edit-inner {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

/* Keep pickers in DOM but invisible — programmatic pickFiles() must reach a mounted QFile */
.jsp-file-launcher {
  position: fixed;
  right: 0;
  bottom: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.jsp-hidden-file {
  min-width: 0;
  min-height: 0;
}

.jsp-native-file {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
}

.profile-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  padding: 18px;
  margin-bottom: 16px;
}

.profile-card--hero {
  padding: 24px 18px;
}

.hero-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-center--edit {
  align-items: stretch;
  text-align: left;
}

.hero-center--edit .hero-avatar-wrap {
  align-self: center;
}

.edit-field {
  width: 100%;
  margin-top: 8px;
}

.edit-about-input {
  width: 100%;
}

.edit-skills-input {
  width: 100%;
}

.connections-line--edit {
  text-align: center;
  margin-top: 12px;
}

.hero-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.hero-avatar {
  background: linear-gradient(145deg, #f3e8ff, #e8dff5);
  color: #4b1e5a;
  font-weight: 700;
  font-size: 32px;
  border: 3px solid #ffffff;
  box-shadow: 0 4px 16px rgba(75, 30, 90, 0.15);
}

.hero-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit-fab {
  position: absolute;
  right: -2px;
  bottom: -2px;
  background: #4b1e5a !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.hero-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px;
  line-height: 1.25;
}

.hero-title {
  font-size: 0.95rem;
  color: #6b6b6b;
  margin: 0 0 12px;
}

.hero-meta-row {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #444;
  margin-bottom: 8px;
  text-align: left;
  max-width: 100%;
}

.meta-icon {
  color: #4b1e5a;
  flex-shrink: 0;
  margin-top: 2px;
}

.meta-email {
  word-break: break-all;
}

.edit-profile-pill {
  margin-top: 8px;
  border-radius: 999px;
  padding: 10px 28px;
  background: #4b1e5a !important;
  color: #ffffff !important;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 14px rgba(75, 30, 90, 0.35);
}

.connections-line {
  margin: 16px 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b1e5a;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-head-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.card-title--solo {
  margin-bottom: 12px;
}

.card-head-btn {
  color: #4b1e5a !important;
}

.add-link {
  color: #4b1e5a !important;
  font-weight: 600;
  font-size: 0.9rem;
}

.about-text {
  font-size: 0.875rem;
  color: #5c5c5c;
  line-height: 1.55;
  margin: 0;
  text-align: left;
}

.file-link-row {
  padding: 4px 0;
}

.file-link {
  color: #4b1e5a;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: underline;
  word-break: break-all;
}

.empty-hint {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.exp-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.exp-row:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.exp-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f5f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.exp-body {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.exp-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a1a;
}

.exp-sub {
  font-size: 0.82rem;
  color: #777;
  margin-top: 2px;
}

.exp-duration {
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

.current-badge {
  margin-top: 6px;
  font-size: 0.7rem;
}

.item-edit {
  color: #9e9e9e !important;
}

.skills-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #333;
}

.skill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4b1e5a;
  flex-shrink: 0;
}

.profile-card--logout {
  padding: 12px;
  box-shadow: none;
  background: transparent;
}

.logout-btn {
  width: 100%;
  border-radius: 999px;
  background: #e53935 !important;
  color: #fff !important;
  font-weight: 600;
  padding: 12px;
}

.edit-actions {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  gap: 10px;
  margin-top: 8px;
  margin-bottom: 16px;
}

.edit-footer-btn {
  flex: 1;
  min-height: 48px;
  border-radius: 999px;
  font-weight: 600;
}

.dialog-card {
  min-width: 300px;
  border-radius: 16px !important;
}

.dialog-card--about {
  width: min(100vw - 32px, 420px);
}

.dialog-title {
  font-weight: 700;
  font-size: 1.1rem;
  padding-bottom: 0;
}

.dialog-save {
  background: #4b1e5a !important;
  color: #fff !important;
}
</style>
