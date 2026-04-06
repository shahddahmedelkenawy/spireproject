import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getUserProfile, updateUserProfile, uploadUserCV } from 'src/services/userService'

export const useUserStore = defineStore('user', () => {
  const name = ref('Spire User')
  const field = ref('UI/UX Designer')
  const email = ref('')
  const role = ref('jobseeker')
  const profile = ref(null)

  const connectionsCount = ref(0)

  const iqScore = ref(0)
  const iqTotal = ref(0)
  const iqPercentage = ref(0)
  const iqPassed = ref(false)
  const iqAnswers = ref({})

  function setName(newName) {
    if (newName && newName.trim().length > 0) {
      name.value = newName.trim()
    }
  }

  function incrementConnections(by = 1) {
    connectionsCount.value += by
  }

  function setConnectionsCount(count) {
    const n = Number(count)
    if (!Number.isNaN(n) && n >= 0) {
      connectionsCount.value = n
    }
  }

  function setRole(newRole) {
    role.value = newRole || 'jobseeker'
  }

  function setEmail(newEmail) {
    email.value = newEmail || ''
  }

  async function fetchProfile(userId) {
    if (!userId) {
      profile.value = null
      return null
    }
    const data = await getUserProfile(userId)
    if (!data) {
      profile.value = null
      return null
    }
    // Keep document id on the object (snap.data() may omit `id`)
    profile.value = { id: userId, ...data }
    name.value = data.name || name.value
    field.value = data.speciality || data.fieldDescription || field.value
    email.value = data.email || data.userEmail || email.value
    role.value = data.role || role.value
    return profile.value
  }

  async function saveProfile(userId, updates) {
    await updateUserProfile(userId, updates)
    profile.value = { ...(profile.value || {}), ...updates }
    if (updates.name) name.value = updates.name
    if (updates.speciality) field.value = updates.speciality
    if (updates.email) email.value = updates.email
    if (updates.role) role.value = updates.role
  }

  async function uploadCvFile(userId, file) {
    const url = await uploadUserCV(userId, file)
    await saveProfile(userId, { cvFile: url })
    return url
  }

  function setIqResult({ score, total, percentage, passed, answers }) {
    iqScore.value = score
    iqTotal.value = total
    iqPercentage.value = percentage
    iqPassed.value = passed
    iqAnswers.value = answers || {}
  }

  function clearIqResult() {
    iqScore.value = 0
    iqTotal.value = 0
    iqPercentage.value = 0
    iqPassed.value = false
    iqAnswers.value = {}
  }

  const hasIqResult = computed(() => iqTotal.value > 0)

  return {
    name,
    field,
    email,
    role,
    profile,
    connectionsCount,
    iqScore,
    iqTotal,
    iqPercentage,
    iqPassed,
    iqAnswers,
    hasIqResult,
    setName,
    setRole,
    setEmail,
    incrementConnections,
    setConnectionsCount,
    setIqResult,
    clearIqResult,
    fetchProfile,
    saveProfile,
    uploadCvFile,
  }
})
