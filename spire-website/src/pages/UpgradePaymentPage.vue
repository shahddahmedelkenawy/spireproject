<template>
  <q-page class="upgrade-page spire-form-page">
    <div class="upgrade-inner spire-form-shell">
      <h1 class="title">Start your Subscription</h1>

      <q-form ref="paymentFormRef" @submit.prevent="submitPayment">
        <q-input
          v-model="form.cardNumber"
          label="Card Number"
          outlined
          class="field spire-form-field"
          :rules="[(val) => !!val || 'Card Number is required']"
        />
        <div class="row-fields">
          <q-input
            v-model="form.expirationDate"
            label="Expiration Date"
            outlined
            class="field spire-form-field"
            :rules="[(val) => !!val || 'Expiration Date is required']"
          />
          <q-input
            v-model="form.securityCode"
            label="Security Code"
            outlined
            class="field spire-form-field"
            :rules="[(val) => !!val || 'Security Code is required']"
          />
        </div>
        <q-input
          v-model="form.fullName"
          label="Full Name"
          outlined
          class="field spire-form-field"
          :rules="[(val) => !!val || 'Full Name is required']"
        />
        <q-input
          v-model="form.country"
          label="Country"
          outlined
          class="field spire-form-field"
          :rules="[(val) => !!val || 'Country is required']"
        />
        <q-input
          v-model="form.addressLine"
          label="Address Line"
          outlined
          class="field spire-form-field"
          :rules="[(val) => !!val || 'Address Line is required']"
        />

        <div class="role-line">
          I am purchasing as {{ roleLabel }}
        </div>

        <q-btn
          no-caps
          class="submit-btn spire-form-submit"
          type="submit"
          label="Upgrade"
          :loading="loading"
        />
      </q-form>
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

const paymentFormRef = ref(null)
const loading = ref(false)

const form = ref({
  cardNumber: '',
  expirationDate: '',
  securityCode: '',
  fullName: '',
  country: 'Egypt',
  addressLine: '',
})

const resolvedRole = computed(() => {
  if (route.query.role === 'employer' || authStore.userRole === 'employer') {
    return 'employer'
  }
  return 'jobseeker'
})

const roleLabel = computed(() =>
  resolvedRole.value === 'employer' ? 'Employer' : 'Job Seeker'
)

async function submitPayment() {
  const valid = await paymentFormRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await createPaymentRecord({
      userId: authStore.user?.uid || null,
      role: resolvedRole.value,
      channel: 'upgrade',
      status: 'completed',
      cardNumberLast4: form.value.cardNumber.slice(-4),
      fullName: form.value.fullName,
      country: form.value.country,
      addressLine: form.value.addressLine,
      expirationDate: form.value.expirationDate,
    })
    q.notify({ type: 'positive', message: 'Subscription details saved', position: 'top' })
    if (resolvedRole.value === 'employer') {
      router.push('/employer/dashboard')
    } else {
      router.push('/home')
    }
  } catch (error) {
    console.error('Payment save failed:', error)
    q.notify({
      type: 'negative',
      message: error?.message || 'Could not save payment',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.upgrade-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f6f7;
}

.upgrade-inner {
  max-width: 460px;
  margin: 0 auto;
  padding: 20px 14px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #4B1D5A;
  margin: 0 0 16px;
}

.field {
  margin-bottom: 10px;
}

.field :deep(.q-field__control) {
  border-radius: 14px;
}

.row-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.role-line {
  margin-top: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6a5c7a;
}

.submit-btn {
  width: 100%;
  border-radius: 999px;
  background: #4B1D5A;
  color: #fff;
  font-weight: 600;
}
</style>

