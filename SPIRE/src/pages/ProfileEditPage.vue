<template>
  <q-page class="page spire-form-page">
    <div class="inner spire-form-shell">
      <h1>Edit Profile</h1>
      <q-card class="card">
        <q-form ref="formRef" @submit.prevent="save">
          <q-input
            v-model="form.name"
            label="Name"
            outlined
            class="field spire-form-field"
            :rules="[(val) => !!val || 'Name is required']"
            @blur="form.name = titleCaseWords(form.name)"
          />
          <q-input
            v-model="form.telephone"
            label="Telephone"
            type="tel"
            outlined
            class="field spire-form-field"
            :rules="[(val) => !!val || 'Telephone is required']"
          />
          <q-input
            v-model="form.speciality"
            label="Speciality"
            outlined
            class="field spire-form-field"
            :rules="[(val) => !!val || 'Speciality is required']"
            @blur="form.speciality = titleCaseWords(form.speciality)"
          />
          <q-input
            v-model="form.skills"
            label="Skills (comma separated)"
            outlined
            class="field spire-form-field"
            :rules="[(val) => !!val || 'Skills are required']"
            @blur="form.skills = titleCaseCommaSeparated(form.skills)"
          />
          <q-btn no-caps class="btn spire-form-submit" label="Save" :loading="loading" type="submit" />
        </q-form>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { deleteField } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/authStore'
import { useUserStore } from 'src/stores/userStore'
import { updateUserProfile } from 'src/services/userService'
import { titleCaseWords, titleCaseCommaSeparated } from 'src/utils/textFormat'

const authStore = useAuthStore()
const userStore = useUserStore()
const q = useQuasar()
const loading = ref(false)
const formRef = ref(null)
const form = ref({
  name: '',
  telephone: '',
  speciality: '',
  skills: '',
})

onMounted(async () => {
  if (!authStore.user?.uid) return
  const profile = await userStore.fetchProfile(authStore.user.uid)
  if (!profile) return
  form.value = {
    name: profile.name || '',
    telephone: profile.telephone || '',
    speciality: profile.speciality || profile.fieldDescription || '',
    skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
  }
})

async function save() {
  const valid = await formRef.value?.validate()
  if (!valid) return
  if (!authStore.user?.uid) return
  loading.value = true
  try {
    const skills = titleCaseCommaSeparated(form.value.skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    await updateUserProfile(authStore.user.uid, {
      name: titleCaseWords(form.value.name),
      telephone: form.value.telephone.trim(),
      speciality: titleCaseWords(form.value.speciality),
      skills,
      email: authStore.user?.email || userStore.email || '',
      fieldDescription: deleteField(),
    })
    await userStore.fetchProfile(authStore.user.uid)
    q.notify({ type: 'positive', message: 'Profile saved', position: 'top' })
  } catch (e) {
    console.error(e)
    q.notify({ type: 'negative', message: e?.message || 'Could not save', position: 'top' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.page{background:#f6f6f7;min-height:100vh}
.inner{max-width:460px;margin:0 auto;padding:14px}
h1{font-size:20px;font-weight:600;margin:0 0 10px}
.card{border-radius:16px;padding:12px;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.field{margin-bottom:10px}
.btn{width:100%;border-radius:999px;background:#4B1D5A;color:#fff}
</style>
