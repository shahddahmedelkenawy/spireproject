<template>
  <q-page class="details-page spire-form-page">
    <div class="inner spire-form-shell">
      <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />
      <h1 class="title">Payment Details</h1>

      <q-slide-transition>
        <div class="form-card">
          <template v-if="method === 'vodafone'">
            <q-input v-model="form.phone" label="Phone Number" outlined class="field spire-form-field" />
            <q-input v-model="form.reference" label="Transaction Reference" outlined class="field spire-form-field" />
          </template>
          <template v-else-if="method === 'instapay'">
            <q-input v-model="form.username" label="Instapay Username" outlined class="field spire-form-field" />
            <q-input v-model="form.phone" label="Phone Number" outlined class="field spire-form-field" />
          </template>
          <template v-else-if="method === 'fawry'">
            <q-input v-model="form.reference" label="Fawry Reference Number" outlined class="field spire-form-field" />
          </template>
          <template v-else-if="method === 'apple'">
            <q-banner rounded class="apple-banner">Confirm with Apple Pay</q-banner>
          </template>
          <template v-else-if="method === 'telda'">
            <q-input v-model="form.account" label="Telda Account Number" outlined class="field spire-form-field" />
          </template>
          <template v-else>
            <q-input v-model="form.name" label="Name on card" outlined class="field spire-form-field" />
            <q-input v-model="form.number" label="Card Number" outlined class="field spire-form-field" />
            <div class="row-fields">
              <q-input v-model="form.exp" label="Expire Date" outlined class="field spire-form-field" />
              <q-input v-model="form.cvv" label="CVV" outlined class="field spire-form-field" />
            </div>
          </template>
        </div>
      </q-slide-transition>

      <q-btn no-caps class="pay-btn spire-form-submit" :loading="loading" label="Confirm Payment" @click="submitPayment" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { createPaymentRecord } from 'src/services/paymentService'

const route = useRoute()
const router = useRouter()
const q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)

const method = computed(() => route.query.method || 'card')
const form = ref({
  phone: '',
  reference: '',
  username: '',
  account: '',
  name: '',
  number: '',
  exp: '',
  cvv: '',
})

async function submitPayment() {
  loading.value = true
  try {
    await createPaymentRecord({
      userId: authStore.user?.uid || null,
      role: 'employer',
      channel: 'employer-payment',
      method: method.value,
      status: 'completed',
      form: { ...form.value },
    })
    q.notify({ type: 'positive', message: 'Payment details saved', position: 'top' })
    router.push('/employer/dashboard')
  } catch (error) {
    console.error('Employer payment save failed:', error)
    q.notify({
      type: 'negative',
      message: error?.message || 'Could not save payment details',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.details-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #4B1D5A;
  color: #fff;
  font-family: "Inter", sans-serif;
}
.inner { max-width: 460px; margin: 0 auto; padding: 16px; }
.title { font-size: 20px; font-weight: 600; margin: 8px 0 14px; }
.form-card {
  background: #ffffff;
  color: #222;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
.field { margin-bottom: 10px; }
.row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.apple-banner { background: #f2f2f2; color: #333; }
.pay-btn {
  margin-top: 14px;
  width: 100%;
  border-radius: 999px;
  background: #fff;
  color: #4B1D5A;
  font-weight: 600;
}
</style>

