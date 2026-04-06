<template>
  <q-page class="emp-page">
    <div v-if="loading" class="emp-inner emp-loading">
      <q-spinner color="primary" size="40px" />
      <p class="loading-text">Loading profile…</p>
    </div>

    <!-- View mode -->
    <div v-else-if="!editMode" class="emp-inner">
      <q-banner v-if="!company" rounded class="emp-setup-banner">
        <template #avatar><q-icon name="info" color="primary" /></template>
        Add your company profile to unlock company fields.
        <template #action>
          <q-btn
            no-caps
            dense
            flat
            color="primary"
            label="Set up company"
            @click="router.push('/employer/company-profile')"
          />
        </template>
      </q-banner>

      <div class="profile-card profile-card--hero">
        <div class="hero-center">
          <div class="hero-avatar-wrap">
            <q-avatar size="96px" class="hero-avatar company-hero-avatar">
              <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="" class="hero-avatar-img">
              <span v-else>{{ companyInitials }}</span>
            </q-avatar>
            <q-btn
              v-if="companyId"
              round
              dense
              unelevated
              icon="add"
              size="sm"
              class="avatar-edit-fab"
              aria-label="Change company logo"
              @click="openLogoDialog"
            />
          </div>
          <h1 class="hero-name">{{ companyDisplayName }}</h1>
          <div class="hero-meta-row">
            <q-icon name="email" size="18px" class="meta-icon" />
            <span class="meta-email">{{ companyEmailLine }}</span>
          </div>
          <div class="hero-meta-row">
            <q-icon name="place" size="18px" class="meta-icon" />
            <span>{{ addressLine }}</span>
          </div>
          <div class="hero-meta-row">
            <q-icon name="work" size="18px" class="meta-icon" />
            <span>{{ industryLine }}</span>
          </div>
          <div class="hero-meta-row">
            <q-icon name="domain" size="18px" class="meta-icon" />
            <span>{{ companyTypeLabel }}</span>
          </div>
          <div class="hero-meta-row">
            <q-icon name="phone" size="18px" class="meta-icon" />
            <span>{{ phoneLine }}</span>
          </div>
          <div class="hero-meta-row">
            <q-icon name="receipt_long" size="18px" class="meta-icon" />
            <span>{{ taxesLine }}</span>
          </div>
          <p class="connections-line">{{ employeesLabel }}</p>
          <q-btn no-caps unelevated class="edit-profile-pill" @click="enterEditMode">
            <q-icon name="edit" size="20px" class="q-mr-sm" />
            Edit Profile
          </q-btn>
        </div>
      </div>

      <div class="profile-card employer-row-card">
        <div class="employer-row">
          <q-avatar size="56px" class="employer-avatar">
            <img v-if="employerPhotoUrl" :src="employerPhotoUrl" alt="" class="hero-avatar-img">
            <span v-else>{{ employerInitials }}</span>
          </q-avatar>
          <div class="employer-row-text">
            <div class="employer-name">{{ employerDisplayName }}</div>
            <div class="employer-sub">Employer</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="edit"
            class="card-head-btn employer-row-edit-btn"
            aria-label="Edit employer profile"
            @click="openEmployerDialog"
          />
        </div>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Description</h2>
          <q-btn
            flat
            round
            dense
            icon="edit"
            class="card-head-btn"
            aria-label="Edit description"
            @click="openDescriptionDialog"
          />
        </div>
        <p class="about-text">{{ descriptionParagraph }}</p>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Rules</h2>
          <div class="card-head-actions">
            <q-btn
              flat
              round
              dense
              icon="edit"
              class="card-head-btn"
              aria-label="Edit rules"
              @click="openRulesDialog"
            />
            <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openRulesAddDialog" />
          </div>
        </div>
        <ul v-if="rulesList.length" class="skills-list">
          <li v-for="(line, idx) in rulesList" :key="'r' + idx" class="skill-item">
            <span class="skill-dot" />
            <span>{{ line }}</span>
          </li>
        </ul>
        <p v-else class="empty-hint">No rules added yet.</p>
      </div>

      <div class="profile-card">
        <div class="card-head">
          <h2 class="card-title">Accessibility Features</h2>
          <div class="card-head-actions">
            <q-btn
              flat
              round
              dense
              icon="edit"
              class="card-head-btn"
              aria-label="Edit accessibility features"
              @click="openAccessibilityDialog"
            />
            <q-btn flat no-caps dense class="add-link" label="+ Add" @click="openAccessibilityAddDialog" />
          </div>
        </div>
        <ul v-if="accessibilityList.length" class="skills-list">
          <li v-for="(line, idx) in accessibilityList" :key="'a' + idx" class="skill-item">
            <span class="skill-dot" />
            <span>{{ line }}</span>
          </li>
        </ul>
        <p v-else class="empty-hint">No accessibility features listed yet.</p>
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

    <!-- Edit mode -->
    <div v-else class="emp-inner emp-inner--edit">
      <q-banner v-if="!companyId" rounded class="emp-setup-banner">
        <template #avatar><q-icon name="info" color="primary" /></template>
        Company document not found. You can still update your employer name and photo. Add a company via Set up company.
        <template #action>
          <q-btn
            no-caps
            dense
            flat
            color="primary"
            label="Set up company"
            @click="router.push('/employer/company-profile')"
          />
        </template>
      </q-banner>

      <div class="profile-card profile-card--hero">
        <div class="hero-center hero-center--edit">
          <div class="hero-avatar-wrap">
            <q-avatar size="96px" class="hero-avatar company-hero-avatar">
              <img v-if="editCompanyLogoSrc" :src="editCompanyLogoSrc" alt="" class="hero-avatar-img">
              <span v-else>{{ editCompanyInitials }}</span>
            </q-avatar>
            <q-btn
              v-if="companyId"
              round
              dense
              unelevated
              icon="add"
              size="sm"
              class="avatar-edit-fab"
              aria-label="Change company logo"
              @click="pickCompanyLogo"
            />
            <input
              ref="companyLogoInput"
              type="file"
              class="emp-native-file"
              accept="image/*"
              @change="onPendingCompanyLogo"
            >
          </div>
          <template v-if="companyId">
            <q-input v-model="editForm.companyName" outlined dense label="Company name" class="edit-field" />
            <q-input v-model="editForm.email" outlined dense label="Email" type="email" class="edit-field" />
            <q-input v-model="editForm.address" outlined dense label="Address" class="edit-field" />
            <q-input v-model="editForm.country" outlined dense label="Country" class="edit-field" />
            <q-input v-model="editForm.industry" outlined dense label="Industry" class="edit-field" />
            <q-select
              v-model="editForm.companyTypeLabel"
              :options="['Governmental Org', 'Private Org']"
              outlined
              dense
              label="Company type"
              class="edit-field"
            />
            <q-input v-model="editForm.telephone" outlined dense label="Phone number" class="edit-field" />
            <q-input v-model="editForm.taxesId" outlined dense label="Taxes ID" maxlength="9" class="edit-field" />
            <q-input
              v-model.number="editForm.employeeCount"
              outlined
              dense
              type="number"
              min="0"
              label="Number of employees"
              class="edit-field"
            />
          </template>
        </div>
      </div>

      <div class="profile-card employer-row-card">
        <div class="employer-row employer-row--edit">
          <div class="employer-avatar-wrap">
            <q-avatar size="56px" class="employer-avatar">
              <img v-if="editEmployerPhotoSrc" :src="editEmployerPhotoSrc" alt="" class="hero-avatar-img">
              <span v-else>{{ editEmployerInitials }}</span>
            </q-avatar>
            <q-btn
              round
              dense
              unelevated
              icon="add"
              size="sm"
              class="employer-avatar-fab"
              aria-label="Change employer photo"
              @click="pickEmployerPhoto"
            />
            <input
              ref="employerPhotoInput"
              type="file"
              class="emp-native-file"
              accept="image/*"
              @change="onPendingEmployerPhoto"
            >
          </div>
          <q-input
            v-model="editForm.employerName"
            outlined
            dense
            label="Employer name"
            class="employer-name-input"
          />
        </div>
      </div>

      <div class="profile-card">
        <h2 class="card-title card-title--solo">Description</h2>
        <q-input
          v-model="editForm.description"
          outlined
          type="textarea"
          autogrow
          :input-style="{ minHeight: '100px' }"
          label="Company description"
          :disable="!companyId"
        />
      </div>

      <div class="profile-card">
        <h2 class="card-title card-title--solo">Rules</h2>
        <p class="field-hint">One rule per line.</p>
        <q-input
          v-model="editForm.rules"
          outlined
          type="textarea"
          autogrow
          :input-style="{ minHeight: '120px' }"
          label="Rules"
          :disable="!companyId"
        />
      </div>

      <div class="profile-card">
        <h2 class="card-title card-title--solo">Accessibility Features</h2>
        <p class="field-hint">One feature per line.</p>
        <q-input
          v-model="editForm.accessibilityFeatures"
          outlined
          type="textarea"
          autogrow
          :input-style="{ minHeight: '120px' }"
          label="Accessibility features"
          :disable="!companyId"
        />
      </div>

      <div class="edit-actions">
        <q-btn outline no-caps class="edit-footer-btn" label="Cancel" :disable="saving" @click="cancelEdit" />
        <q-btn
          no-caps
          unelevated
          class="edit-footer-btn dialog-save"
          label="Save changes"
          :loading="saving"
          @click="saveAll"
        />
      </div>
    </div>

    <!-- Card dialogs (view mode): edit one section only -->
    <q-dialog v-model="logoDialogOpen" @hide="onLogoDialogHide">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Company logo</q-card-section>
        <q-card-section class="q-pt-none dialog-logo-body">
          <div class="dialog-logo-preview">
            <q-avatar size="96px" class="hero-avatar company-hero-avatar">
              <img v-if="logoDialogPreviewSrc" :src="logoDialogPreviewSrc" alt="" class="hero-avatar-img">
              <span v-else>{{ companyInitials }}</span>
            </q-avatar>
          </div>
          <q-btn
            no-caps
            outline
            color="primary"
            class="full-width q-mt-md"
            label="Choose image"
            @click="pickDialogCompanyLogo"
          />
          <input
            ref="dialogCompanyLogoInput"
            type="file"
            class="emp-native-file"
            accept="image/*"
            @change="onDialogCompanyLogo"
          >
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="logoDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Save"
            :loading="saving"
            :disable="!pendingCompanyLogoFile"
            @click="saveLogoDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="employerDialogOpen" @hide="onEmployerDialogHide">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Employer</q-card-section>
        <q-card-section class="q-pt-none q-gutter-md">
          <div class="dialog-employer-preview">
            <div class="employer-avatar-wrap">
              <q-avatar size="72px" class="employer-avatar">
                <img v-if="employerDialogPhotoSrc" :src="employerDialogPhotoSrc" alt="" class="hero-avatar-img">
                <span v-else>{{ employerInitials }}</span>
              </q-avatar>
              <q-btn
                round
                dense
                unelevated
                icon="add"
                size="sm"
                class="employer-avatar-fab"
                aria-label="Change photo"
                @click="pickDialogEmployerPhoto"
              />
              <input
                ref="dialogEmployerPhotoInput"
                type="file"
                class="emp-native-file"
                accept="image/*"
                @change="onDialogEmployerPhoto"
              >
            </div>
          </div>
          <q-input v-model="employerDialogName" outlined dense label="Employer name" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="employerDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Save"
            :loading="saving"
            @click="saveEmployerDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="descriptionDialogOpen">
      <q-card class="dialog-card dialog-card--wide">
        <q-card-section class="dialog-title">Description</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="descriptionDraft"
            outlined
            type="textarea"
            autogrow
            :input-style="{ minHeight: '140px' }"
            label="Company description"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="descriptionDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Save"
            :loading="saving"
            @click="saveDescriptionDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="rulesDialogOpen">
      <q-card class="dialog-card dialog-card--wide">
        <q-card-section class="dialog-title">Rules</q-card-section>
        <q-card-section class="q-pt-none">
          <p class="field-hint q-mb-sm">One rule per line.</p>
          <q-input
            v-model="rulesDraft"
            outlined
            type="textarea"
            autogrow
            :input-style="{ minHeight: '160px' }"
            label="Rules"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="rulesDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Save"
            :loading="saving"
            @click="saveRulesDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="rulesAddDialogOpen">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Add rule</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="newRuleLine" outlined dense label="New rule" @keyup.enter="saveRulesAddDialog" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="rulesAddDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Add"
            :loading="saving"
            :disable="!String(newRuleLine || '').trim()"
            @click="saveRulesAddDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="accessibilityDialogOpen">
      <q-card class="dialog-card dialog-card--wide">
        <q-card-section class="dialog-title">Accessibility features</q-card-section>
        <q-card-section class="q-pt-none">
          <p class="field-hint q-mb-sm">One feature per line.</p>
          <q-input
            v-model="accessibilityDraft"
            outlined
            type="textarea"
            autogrow
            :input-style="{ minHeight: '160px' }"
            label="Accessibility features"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="accessibilityDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Save"
            :loading="saving"
            @click="saveAccessibilityDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="accessibilityAddDialogOpen">
      <q-card class="dialog-card">
        <q-card-section class="dialog-title">Add accessibility feature</q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="newAccessibilityLine"
            outlined
            dense
            label="New feature"
            @keyup.enter="saveAccessibilityAddDialog"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat no-caps label="Cancel" @click="accessibilityAddDialogOpen = false" />
          <q-btn
            no-caps
            unelevated
            class="dialog-save"
            label="Add"
            :loading="saving"
            :disable="!String(newAccessibilityLine || '').trim()"
            @click="saveAccessibilityAddDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onActivated, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import { getCompanyByOwner, updateCompany, uploadCompanyLogo } from 'src/services/companyService'
import { updateUserProfile, uploadProfilePhoto } from 'src/services/userService'
import { capitalizeProseWords } from 'src/utils/textFormat'

const router = useRouter()
const q = useQuasar()
const authStore = useAuthStore()
const userStore = useUserStore()

const loading = ref(true)
const editMode = ref(false)
const saving = ref(false)
const company = ref(null)
const loggingOut = ref(false)

const companyLogoInput = ref(null)
const employerPhotoInput = ref(null)
const dialogCompanyLogoInput = ref(null)
const dialogEmployerPhotoInput = ref(null)

const logoDialogOpen = ref(false)
const employerDialogOpen = ref(false)
const employerDialogName = ref('')
const descriptionDialogOpen = ref(false)
const descriptionDraft = ref('')
const rulesDialogOpen = ref(false)
const rulesDraft = ref('')
const rulesAddDialogOpen = ref(false)
const newRuleLine = ref('')
const accessibilityDialogOpen = ref(false)
const accessibilityDraft = ref('')
const accessibilityAddDialogOpen = ref(false)
const newAccessibilityLine = ref('')

const editForm = ref({
  companyName: '',
  email: '',
  address: '',
  country: '',
  industry: '',
  companyTypeLabel: 'Private Org',
  telephone: '',
  taxesId: '',
  employeeCount: null,
  employerName: '',
  description: '',
  rules: '',
  accessibilityFeatures: '',
})

const editSnapshot = ref(null)
const pendingCompanyLogoFile = ref(null)
const pendingEmployerPhotoFile = ref(null)
const logoPreviewUrl = ref('')
const employerPhotoPreviewUrl = ref('')

const companyId = computed(() => company.value?.id || '')

const companyDisplayName = computed(() => {
  const n = (company.value?.name || userStore.profile?.companyName || '').trim()
  return n || 'Your company'
})

const companyLogoUrl = computed(() => company.value?.logo || '')

const companyInitials = computed(() => initialsFromName(companyDisplayName.value))

const companyEmailLine = computed(
  () => company.value?.email || userStore.profile?.email || authStore.user?.email || '—',
)

const addressLine = computed(() => {
  const a = company.value?.address || ''
  const c = company.value?.country || ''
  const parts = [a, c].filter((x) => x && String(x).trim())
  return parts.length ? parts.join(', ') : '—'
})

const industryLine = computed(() => company.value?.industry || '—')

const companyTypeLabel = computed(() => {
  const t = (company.value?.type || 'private').toLowerCase()
  return t === 'government' ? 'Governmental Org' : 'Private Org'
})

const phoneLine = computed(() => company.value?.telephone || '—')

const taxesLine = computed(() => company.value?.taxesId || '—')

const employeesLabel = computed(() => {
  const n = company.value?.employeeCount
  if (n == null || n === '' || Number.isNaN(Number(n))) return '— Employees'
  return `${Number(n)} Employees`
})

const employerDisplayName = computed(() =>
  capitalizeProseWords(userStore.profile?.name || userStore.name || 'Employer'),
)

const employerPhotoUrl = computed(() => userStore.profile?.profilePhotoUrl || '')

const employerInitials = computed(() => initialsFromName(userStore.profile?.name || userStore.name || 'E'))

function initialsFromName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'EM'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
}

function splitToLines(text) {
  if (!text || !String(text).trim()) return []
  const s = String(text).trim()
  if (s.includes('\n')) return s.split('\n').map((x) => x.trim()).filter(Boolean)
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

const rulesList = computed(() => splitToLines(company.value?.rules))

const accessibilityList = computed(() => splitToLines(company.value?.accessibilityFeatures))

const descriptionParagraph = computed(() => {
  const d = company.value?.description
  if (d && String(d).trim()) return String(d).trim()
  return 'Add a short description of your company.'
})

const editCompanyLogoSrc = computed(() => logoPreviewUrl.value || company.value?.logo || '')
const editEmployerPhotoSrc = computed(() => employerPhotoPreviewUrl.value || userStore.profile?.profilePhotoUrl || '')

const editCompanyInitials = computed(() => initialsFromName(editForm.value.companyName || 'CO'))
const editEmployerInitials = computed(() => initialsFromName(editForm.value.employerName || 'E'))

const logoDialogPreviewSrc = computed(() => logoPreviewUrl.value || companyLogoUrl.value)

const employerDialogPhotoSrc = computed(
  () => employerPhotoPreviewUrl.value || userStore.profile?.profilePhotoUrl || '',
)

function appendLineToField(fieldStr, newLine) {
  const line = String(newLine || '').trim()
  if (!line) return fieldStr || ''
  const lines = splitToLines(fieldStr || '')
  lines.push(line)
  return lines.join('\n')
}

function openLogoDialog() {
  if (!companyId.value) {
    q.notify({ type: 'warning', message: 'Add a company profile first', position: 'top' })
    return
  }
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = ''
  }
  pendingCompanyLogoFile.value = null
  logoDialogOpen.value = true
}

function onLogoDialogHide() {
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = ''
  }
  pendingCompanyLogoFile.value = null
}

function pickDialogCompanyLogo() {
  dialogCompanyLogoInput.value?.click?.()
}

function onDialogCompanyLogo(evt) {
  const file = evt.target?.files?.[0]
  evt.target.value = ''
  if (!file) return
  if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
  pendingCompanyLogoFile.value = file
  logoPreviewUrl.value = URL.createObjectURL(file)
}

async function saveLogoDialog() {
  const uid = authStore.user?.uid
  const cid = companyId.value
  if (!uid || !cid || !pendingCompanyLogoFile.value) return
  saving.value = true
  try {
    const url = await uploadCompanyLogo(uid, pendingCompanyLogoFile.value)
    await updateCompany(cid, { logo: url })
    if (logoPreviewUrl.value) {
      URL.revokeObjectURL(logoPreviewUrl.value)
      logoPreviewUrl.value = ''
    }
    pendingCompanyLogoFile.value = null
    company.value = await getCompanyByOwner(uid)
    logoDialogOpen.value = false
    q.notify({ type: 'positive', message: 'Logo updated', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function openEmployerDialog() {
  if (employerPhotoPreviewUrl.value) {
    URL.revokeObjectURL(employerPhotoPreviewUrl.value)
    employerPhotoPreviewUrl.value = ''
  }
  pendingEmployerPhotoFile.value = null
  employerDialogName.value = (userStore.profile?.name || userStore.name || '').trim()
  employerDialogOpen.value = true
}

function onEmployerDialogHide() {
  if (employerPhotoPreviewUrl.value) {
    URL.revokeObjectURL(employerPhotoPreviewUrl.value)
    employerPhotoPreviewUrl.value = ''
  }
  pendingEmployerPhotoFile.value = null
}

function pickDialogEmployerPhoto() {
  dialogEmployerPhotoInput.value?.click?.()
}

function onDialogEmployerPhoto(evt) {
  const file = evt.target?.files?.[0]
  evt.target.value = ''
  if (!file) return
  if (employerPhotoPreviewUrl.value) URL.revokeObjectURL(employerPhotoPreviewUrl.value)
  pendingEmployerPhotoFile.value = file
  employerPhotoPreviewUrl.value = URL.createObjectURL(file)
}

async function saveEmployerDialog() {
  const uid = authStore.user?.uid
  if (!uid) return
  saving.value = true
  try {
    if (pendingEmployerPhotoFile.value) {
      await uploadProfilePhoto(uid, pendingEmployerPhotoFile.value)
    }
    const nameRaw = (employerDialogName.value || '').trim()
    const name = capitalizeProseWords(nameRaw) || nameRaw
    const companyName = (company.value?.name || userStore.profile?.companyName || '').trim()
    await updateUserProfile(uid, { name, companyName })
    userStore.setName(name)
    if (employerPhotoPreviewUrl.value) {
      URL.revokeObjectURL(employerPhotoPreviewUrl.value)
      employerPhotoPreviewUrl.value = ''
    }
    pendingEmployerPhotoFile.value = null
    await userStore.fetchProfile(uid)
    employerDialogOpen.value = false
    q.notify({ type: 'positive', message: 'Employer profile updated', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function openDescriptionDialog() {
  if (!companyId.value) {
    q.notify({ type: 'warning', message: 'Add a company profile first', position: 'top' })
    return
  }
  descriptionDraft.value = (company.value?.description || '').trim()
  descriptionDialogOpen.value = true
}

async function saveDescriptionDialog() {
  const cid = companyId.value
  const uid = authStore.user?.uid
  if (!cid || !uid) return
  saving.value = true
  try {
    await updateCompany(cid, { description: (descriptionDraft.value || '').trim() })
    company.value = await getCompanyByOwner(uid)
    descriptionDialogOpen.value = false
    q.notify({ type: 'positive', message: 'Description saved', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function openRulesDialog() {
  if (!companyId.value) {
    q.notify({ type: 'warning', message: 'Add a company profile first', position: 'top' })
    return
  }
  const c = company.value?.rules || ''
  const rulesJoined = splitToLines(c).length ? splitToLines(c).join('\n') : c
  rulesDraft.value = rulesJoined
  rulesDialogOpen.value = true
}

async function saveRulesDialog() {
  const cid = companyId.value
  const uid = authStore.user?.uid
  if (!cid || !uid) return
  saving.value = true
  try {
    await updateCompany(cid, { rules: (rulesDraft.value || '').trim() })
    company.value = await getCompanyByOwner(uid)
    rulesDialogOpen.value = false
    q.notify({ type: 'positive', message: 'Rules saved', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function openRulesAddDialog() {
  if (!companyId.value) {
    q.notify({ type: 'warning', message: 'Add a company profile first', position: 'top' })
    return
  }
  newRuleLine.value = ''
  rulesAddDialogOpen.value = true
}

async function saveRulesAddDialog() {
  const cid = companyId.value
  const uid = authStore.user?.uid
  if (!cid || !uid) return
  const line = (newRuleLine.value || '').trim()
  if (!line) return
  saving.value = true
  try {
    const merged = appendLineToField(company.value?.rules, line)
    await updateCompany(cid, { rules: merged })
    company.value = await getCompanyByOwner(uid)
    rulesAddDialogOpen.value = false
    newRuleLine.value = ''
    q.notify({ type: 'positive', message: 'Rule added', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function openAccessibilityDialog() {
  if (!companyId.value) {
    q.notify({ type: 'warning', message: 'Add a company profile first', position: 'top' })
    return
  }
  const c = company.value?.accessibilityFeatures || ''
  const joined = splitToLines(c).length ? splitToLines(c).join('\n') : c
  accessibilityDraft.value = joined
  accessibilityDialogOpen.value = true
}

async function saveAccessibilityDialog() {
  const cid = companyId.value
  const uid = authStore.user?.uid
  if (!cid || !uid) return
  saving.value = true
  try {
    await updateCompany(cid, { accessibilityFeatures: (accessibilityDraft.value || '').trim() })
    company.value = await getCompanyByOwner(uid)
    accessibilityDialogOpen.value = false
    q.notify({ type: 'positive', message: 'Accessibility features saved', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function openAccessibilityAddDialog() {
  if (!companyId.value) {
    q.notify({ type: 'warning', message: 'Add a company profile first', position: 'top' })
    return
  }
  newAccessibilityLine.value = ''
  accessibilityAddDialogOpen.value = true
}

async function saveAccessibilityAddDialog() {
  const cid = companyId.value
  const uid = authStore.user?.uid
  if (!cid || !uid) return
  const line = (newAccessibilityLine.value || '').trim()
  if (!line) return
  saving.value = true
  try {
    const merged = appendLineToField(company.value?.accessibilityFeatures, line)
    await updateCompany(cid, { accessibilityFeatures: merged })
    company.value = await getCompanyByOwner(uid)
    accessibilityAddDialogOpen.value = false
    newAccessibilityLine.value = ''
    q.notify({ type: 'positive', message: 'Feature added', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

function syncEditFormFromData() {
  const c = company.value
  const p = userStore.profile
  const rulesRaw = c?.rules || ''
  const rulesJoined = splitToLines(rulesRaw).length ? splitToLines(rulesRaw).join('\n') : rulesRaw
  const accRaw = c?.accessibilityFeatures || ''
  const accJoined = splitToLines(accRaw).length ? splitToLines(accRaw).join('\n') : accRaw

  editForm.value = {
    companyName: (c?.name || p?.companyName || '').trim(),
    email: (c?.email || p?.email || authStore.user?.email || '').trim(),
    address: (c?.address || '').trim(),
    country: (c?.country || '').trim(),
    industry: (c?.industry || '').trim(),
    companyTypeLabel: (c?.type || 'private').toLowerCase() === 'government' ? 'Governmental Org' : 'Private Org',
    telephone: (c?.telephone || '').trim(),
    taxesId: (c?.taxesId || '').trim(),
    employeeCount:
      c?.employeeCount != null && c.employeeCount !== '' ? Number(c.employeeCount) : null,
    employerName: (p?.name || userStore.name || '').trim(),
    description: (c?.description || '').trim(),
    rules: rulesJoined,
    accessibilityFeatures: accJoined,
  }
}

function enterEditMode() {
  syncEditFormFromData()
  editSnapshot.value = JSON.parse(JSON.stringify(editForm.value))
  revokePreviews()
  pendingCompanyLogoFile.value = null
  pendingEmployerPhotoFile.value = null
  editMode.value = true
}

function revokePreviews() {
  if (logoPreviewUrl.value) {
    URL.revokeObjectURL(logoPreviewUrl.value)
    logoPreviewUrl.value = ''
  }
  if (employerPhotoPreviewUrl.value) {
    URL.revokeObjectURL(employerPhotoPreviewUrl.value)
    employerPhotoPreviewUrl.value = ''
  }
}

function cancelEdit() {
  revokePreviews()
  pendingCompanyLogoFile.value = null
  pendingEmployerPhotoFile.value = null
  if (editSnapshot.value) {
    editForm.value = JSON.parse(JSON.stringify(editSnapshot.value))
  }
  editSnapshot.value = null
  editMode.value = false
}

onBeforeUnmount(revokePreviews)

function pickCompanyLogo() {
  companyLogoInput.value?.click?.()
}

function pickEmployerPhoto() {
  employerPhotoInput.value?.click?.()
}

function onPendingCompanyLogo(evt) {
  const file = evt.target?.files?.[0]
  evt.target.value = ''
  if (!file) return
  if (logoPreviewUrl.value) URL.revokeObjectURL(logoPreviewUrl.value)
  pendingCompanyLogoFile.value = file
  logoPreviewUrl.value = URL.createObjectURL(file)
}

function onPendingEmployerPhoto(evt) {
  const file = evt.target?.files?.[0]
  evt.target.value = ''
  if (!file) return
  if (employerPhotoPreviewUrl.value) URL.revokeObjectURL(employerPhotoPreviewUrl.value)
  pendingEmployerPhotoFile.value = file
  employerPhotoPreviewUrl.value = URL.createObjectURL(file)
}

async function saveAll() {
  const uid = authStore.user?.uid
  if (!uid) return
  saving.value = true
  try {
    const f = editForm.value

    if (pendingEmployerPhotoFile.value) {
      await uploadProfilePhoto(uid, pendingEmployerPhotoFile.value)
    }

    const cid = companyId.value
    if (cid) {
      if (pendingCompanyLogoFile.value) {
        const url = await uploadCompanyLogo(uid, pendingCompanyLogoFile.value)
        await updateCompany(cid, { logo: url })
      }
      const type = f.companyTypeLabel === 'Governmental Org' ? 'government' : 'private'
      const ec =
        f.employeeCount === '' || f.employeeCount == null ? null : Math.max(0, Number(f.employeeCount))
      await updateCompany(cid, {
        name: (f.companyName || '').trim(),
        email: (f.email || '').trim(),
        address: (f.address || '').trim(),
        country: (f.country || '').trim(),
        industry: (f.industry || '').trim(),
        type,
        telephone: (f.telephone || '').trim(),
        taxesId: String(f.taxesId || '').trim(),
        employeeCount: ec,
        description: (f.description || '').trim(),
        rules: (f.rules || '').trim(),
        accessibilityFeatures: (f.accessibilityFeatures || '').trim(),
      })
    }

    const nameRaw = (f.employerName || '').trim()
    const name = capitalizeProseWords(nameRaw) || nameRaw
    await updateUserProfile(uid, {
      name,
      companyName: (f.companyName || '').trim(),
    })
    userStore.setName(name)

    await userStore.fetchProfile(uid)
    company.value = await getCompanyByOwner(uid)

    revokePreviews()
    pendingCompanyLogoFile.value = null
    pendingEmployerPhotoFile.value = null
    editSnapshot.value = null
    editMode.value = false
    q.notify({ type: 'positive', message: 'Profile saved', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    saving.value = false
  }
}

async function load() {
  // Wait for Firebase auth to finish initializing (same pattern as job-seeker ProfilePage)
  if (!authStore.isReady) {
    return
  }
  const uid = authStore.user?.uid
  if (!uid) {
    loading.value = false
    company.value = null
    return
  }
  loading.value = true
  try {
    await userStore.fetchProfile(uid)
    company.value = await getCompanyByOwner(uid)
  } finally {
    loading.value = false
  }
}

async function handleLogout() {
  loggingOut.value = true
  try {
    await authStore.logout()
    router.push({ path: '/onboarding', query: { slide: 2 } })
  } finally {
    loggingOut.value = false
  }
}

onActivated(load)

watch(
  () => [authStore.isReady, authStore.user?.uid],
  () => {
    load()
  },
  { immediate: true },
)
</script>

<style scoped>
.emp-page {
  background: #f0f0f2;
  padding-bottom: calc(88px + env(safe-area-inset-bottom));
  min-height: 100%;
  padding-top: env(safe-area-inset-top);
}

.emp-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
}

.emp-inner--edit {
  padding-bottom: calc(24px + env(safe-area-inset-bottom));
}

.emp-setup-banner {
  margin-bottom: 12px;
  background: #ede7f6;
  color: #333;
}

.emp-loading {
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

.company-hero-avatar {
  background: linear-gradient(145deg, #f3e8ff, #e8dff5);
  color: #4b1e5a;
}

.hero-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.hero-avatar {
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

.emp-native-file {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
}

.hero-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
  line-height: 1.25;
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

.employer-row-card {
  padding: 16px 18px;
}

.employer-row {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.employer-row-edit-btn {
  margin-left: auto;
  flex-shrink: 0;
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

.card-head-btn {
  color: #4b1e5a !important;
}

.add-link {
  color: #4b1e5a !important;
  font-weight: 600;
  font-size: 0.9rem;
}

.employer-row--edit {
  align-items: flex-start;
}

.employer-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.employer-avatar-fab {
  position: absolute;
  right: -4px;
  bottom: -4px;
  background: #4b1e5a !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.employer-avatar {
  background: linear-gradient(145deg, #f3e8ff, #e8dff5);
  color: #4b1e5a;
  font-weight: 700;
  flex-shrink: 0;
}

.employer-row-text {
  flex: 1;
  min-width: 0;
}

.employer-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a1a;
}

.employer-sub {
  font-size: 0.82rem;
  color: #888;
  margin-top: 2px;
}

.employer-name-input {
  flex: 1;
  min-width: 0;
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

.about-text {
  font-size: 0.875rem;
  color: #5c5c5c;
  line-height: 1.55;
  margin: 0;
  text-align: left;
}

.field-hint {
  font-size: 0.8rem;
  color: #888;
  margin: 0 0 8px;
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

.empty-hint {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
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

.dialog-save {
  background: #4b1e5a !important;
  color: #fff !important;
}

.dialog-card {
  min-width: 300px;
  border-radius: 16px !important;
}

.dialog-card--wide {
  width: min(100vw - 32px, 420px);
}

.dialog-title {
  font-weight: 700;
  font-size: 1.1rem;
  padding-bottom: 0;
}

.dialog-logo-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dialog-logo-preview {
  display: flex;
  justify-content: center;
}

.dialog-employer-preview {
  display: flex;
  justify-content: center;
  padding: 8px 0;
}
</style>
