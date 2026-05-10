<template>
  <q-page class="checkout-page">
    <q-btn
      flat
      round
      class="back-fab"
      icon="arrow_back"
      aria-label="Back"
      @click="goBack"
    />
    <div class="checkout-wrap">
      <Transition name="card-pop" mode="out-in">
        <div
          v-if="!paymentSuccess"
          key="form"
          class="checkout-card"
        >
          <header class="checkout-head">
            <h1 class="checkout-title">{{ pageTitle }}</h1>
            <p v-if="priceSubtitle" class="checkout-sub">{{ priceSubtitle }}</p>
          </header>

          <q-form class="pay-form" @submit.prevent="submit">
            <div class="field-group">
              <label class="field-label">Name on card</label>
              <q-input
                v-model="form.nameOnCard"
                outlined
                dense
                hide-bottom-space
                class="pay-input"
                :class="{ 'pay-input--ok': nameOk, 'pay-input--err': nameErr }"
                placeholder="Full name as on card"
                autocomplete="cc-name"
                @blur="touched.name = true"
              >
                <template #prepend>
                  <q-icon name="person_outline" class="input-pre-ic" size="20px" />
                </template>
              </q-input>
              <Transition name="err-fade">
                <p v-if="nameErrMsg" class="field-hint field-hint--err">{{ nameErrMsg }}</p>
                <p v-else-if="touched.name && nameOk" class="field-hint field-hint--ok">Looks good</p>
              </Transition>
            </div>

            <div class="field-group">
              <label class="field-label">Card number</label>
              <q-input
                v-model="displayCard"
                outlined
                dense
                hide-bottom-space
                class="pay-input"
                :class="{ 'pay-input--ok': cardOk, 'pay-input--err': cardErr }"
                placeholder="1234 5678 9012 3456"
                inputmode="numeric"
                autocomplete="cc-number"
                maxlength="19"
                @blur="touched.card = true"
                @update:model-value="onCardInput"
              >
                <template #prepend>
                  <q-icon name="credit_card" class="input-pre-ic" size="20px" />
                </template>
              </q-input>
              <Transition name="err-fade">
                <p v-if="cardErrMsg" class="field-hint field-hint--err">{{ cardErrMsg }}</p>
                <p v-else-if="touched.card && cardOk" class="field-hint field-hint--ok">Valid number</p>
              </Transition>
            </div>

            <div class="row-2">
              <div class="field-group field-group--half">
                <label class="field-label">Expiry date</label>
                <q-input
                  v-model="form.expiry"
                  outlined
                  dense
                  hide-bottom-space
                  class="pay-input"
                  :class="{ 'pay-input--ok': expiryOk, 'pay-input--err': expiryErr }"
                  placeholder="MM/YY"
                  inputmode="numeric"
                  autocomplete="cc-exp"
                  maxlength="5"
                  @blur="touched.expiry = true"
                  @update:model-value="onExpiryInput"
                >
                  <template #prepend>
                    <q-icon name="event" class="input-pre-ic" size="20px" />
                  </template>
                </q-input>
                <Transition name="err-fade">
                  <p v-if="expiryErrMsg" class="field-hint field-hint--err">{{ expiryErrMsg }}</p>
                </Transition>
              </div>
              <div class="field-group field-group--half">
                <label class="field-label">CVV</label>
                <q-input
                  v-model="form.cvv"
                  outlined
                  dense
                  hide-bottom-space
                  class="pay-input"
                  :class="{ 'pay-input--ok': cvvOk, 'pay-input--err': cvvErr }"
                  type="password"
                  placeholder="123"
                  inputmode="numeric"
                  autocomplete="cc-csc"
                  maxlength="4"
                  @blur="touched.cvv = true"
                >
                  <template #prepend>
                    <q-icon name="lock_outline" class="input-pre-ic" size="20px" />
                  </template>
                </q-input>
                <Transition name="err-fade">
                  <p v-if="cvvErrMsg" class="field-hint field-hint--err">{{ cvvErrMsg }}</p>
                </Transition>
              </div>
            </div>

            <p class="cc-note">Credit card only. No other payment methods on this page.</p>

            <q-btn
              no-caps
              unelevated
              type="submit"
              class="submit-pay"
              :class="{ 'submit-pay--pulse': canSubmit && !loading }"
              :loading="loading"
              :disable="loading"
            >
              <span v-if="!loading" class="submit-pay__label">Complete payment</span>
            </q-btn>
          </q-form>
        </div>

        <div
          v-else
          key="success"
          class="success-card"
        >
          <div class="success-icon-wrap">
            <q-icon name="check_circle" class="success-icon" size="56px" />
          </div>
          <h2 class="success-title">Payment received</h2>
          <p class="success-text">You’re all set. Redirecting…</p>
        </div>
      </Transition>
    </div>
  </q-page>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { createPaymentRecord } from 'src/services/paymentService'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

const loading = ref(false)
const paymentSuccess = ref(false)
const submitAttempted = ref(false)

const form = ref({
  nameOnCard: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
})

const displayCard = ref('')

const touched = reactive({
  name: false,
  card: false,
  expiry: false,
  cvv: false,
})

const payType = computed(() => (route.query.type || 'premium').toString().toLowerCase())

const planMeta = computed(() => {
  const t = payType.value
  if (t === 'employer') {
    return { title: 'Subscription Plan', price: 500, priceLabel: '500 LE', role: 'employer' }
  }
  if (t === 'golden') {
    return { title: 'Golden Plan', price: 250, priceLabel: '250 LE', role: 'jobseeker' }
  }
  return { title: 'Premium Plan', price: 180, priceLabel: '180 LE', role: 'jobseeker' }
})

const pageTitle = computed(() => {
  if (payType.value === 'employer') return 'Subscription Plan'
  return `${planMeta.value.title} – ${planMeta.value.priceLabel}`
})

const priceSubtitle = computed(() => {
  if (payType.value === 'employer') return '500 LE'
  return ''
})

const cardDigits = computed(() => String(form.value.cardNumber || '').replace(/\D/g, ''))

const nameErrMsg = computed(() => {
  if (!touched.name && !submitAttempted.value) return ''
  const v = form.value.nameOnCard.trim()
  if (!v) return 'Name on card is required'
  if (v.length < 2) return 'Use your name as on the card'
  return ''
})

const cardErrMsg = computed(() => {
  if (!touched.card && !submitAttempted.value) return ''
  const d = cardDigits.value
  if (!d) return 'Card number is required'
  if (d.length < 13 || d.length > 19) return 'Enter a valid card number'
  return ''
})

const expiryErrMsg = computed(() => {
  if (!touched.expiry && !submitAttempted.value) return ''
  const e = (form.value.expiry || '').trim()
  if (!e) return 'Required'
  const m = e.match(/^(\d{1,2})\/(\d{2})$/)
  if (!m) return 'Use MM/YY'
  const month = parseInt(m[1], 10)
  if (month < 1 || month > 12) return 'Invalid month'
  return ''
})

const cvvErrMsg = computed(() => {
  if (!touched.cvv && !submitAttempted.value) return ''
  const c = String(form.value.cvv || '').replace(/\D/g, '')
  if (!c) return 'Required'
  if (c.length < 3 || c.length > 4) return '3 or 4 digits'
  return ''
})

const nameOk = computed(
  () => form.value.nameOnCard.trim().length >= 2
)
const cardOk = computed(() => {
  const d = cardDigits.value
  return d.length >= 13 && d.length <= 19
})
const cvvOk = computed(() => {
  const c = String(form.value.cvv || '').replace(/\D/g, '')
  return c.length === 3 || c.length === 4
})

const nameErr = computed(() => !!nameErrMsg.value)
const cardErr = computed(() => !!cardErrMsg.value)
const expiryErr = computed(() => !!expiryErrMsg.value)
const cvvErr = computed(() => !!cvvErrMsg.value)

const canSubmit = computed(
  () => nameOk.value && cardOk.value && !expiryErrMsg.value && !cvvErrMsg.value
)

function onCardInput() {
  const raw = String(displayCard.value || '').replace(/\D/g, '')
  form.value.cardNumber = raw
  const groups = raw.match(/.{1,4}/g) || []
  displayCard.value = groups.join(' ').trim()
}

function onExpiryInput() {
  let v = String(form.value.expiry || '').replace(/\D/g, '')
  if (v.length >= 2) {
    v = v.slice(0, 2) + '/' + v.slice(2, 4)
  }
  form.value.expiry = v
}

watch(
  () => form.value.cvv,
  (v) => {
    if (v != null) form.value.cvv = String(v).replace(/\D/g, '').slice(0, 4)
  }
)

function goBack() {
  if (window.history.length > 1) router.back()
  else if (planMeta.value.role === 'employer') {
    router.replace('/employer/dashboard')
  } else {
    router.replace('/jobseeker/upgrade')
  }
}

function redirectAfterSuccess() {
  if (planMeta.value.role === 'employer') {
    router.push('/employer/dashboard')
  } else {
    router.push('/home')
  }
}

async function submit() {
  submitAttempted.value = true
  Object.keys(touched).forEach((k) => {
    touched[k] = true
  })
  if (!nameOk.value || !cardOk.value || expiryErrMsg.value || cvvErrMsg.value) {
    $q.notify({ type: 'negative', message: 'Please fix the fields above', position: 'top' })
    return
  }
  loading.value = true
  try {
    const last4 = cardDigits.value.slice(-4)
    await createPaymentRecord({
      userId: authStore.user?.uid || null,
      role: planMeta.value.role,
      channel: 'checkout',
      plan: payType.value,
      amountLE: planMeta.value.price,
      status: 'completed',
      nameOnCard: form.value.nameOnCard.trim(),
      cardNumberLast4: last4 || '0000',
      expirationDate: form.value.expiry,
    })
    paymentSuccess.value = true
    setTimeout(() => {
      redirectAfterSuccess()
    }, 900)
  } catch (e) {
    console.error(e)
    $q.notify({
      type: 'negative',
      message: e?.message || 'Could not complete',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  width: 100%;
  box-sizing: border-box;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--spire-baby-purple);
  position: relative;
}

.back-fab {
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: max(12px, env(safe-area-inset-left));
  z-index: 10;
  width: 44px;
  height: 44px;
  color: #ffffff !important;
  background: #4b1e5a !important;
  box-shadow: 0 4px 16px rgba(75, 30, 90, 0.35);
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.back-fab:hover {
  background: #5c2470 !important;
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(75, 30, 90, 0.42);
}

/* Match ProfilePage content column: `.jsp-inner` uses `max-width: var(--spire-content-max)` + gutters */
.checkout-wrap {
  width: 100%;
  max-width: var(--spire-content-max);
  margin: 0 auto;
  padding: max(72px, env(safe-area-inset-top) + 52px) var(--spire-layout-gutter) max(40px, env(safe-area-inset-bottom));
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.checkout-card {
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  padding: clamp(20px, 3vw, 26px) clamp(16px, 3vw, 22px) clamp(20px, 3vw, 24px);
  box-shadow: 0 4px 6px rgba(40, 20, 60, 0.04), 0 16px 40px rgba(75, 30, 90, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.9);
  animation: card-in 0.45s ease-out;
  box-sizing: border-box;
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.card-pop-enter-active,
.card-pop-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.card-pop-enter-from {
  opacity: 0;
  transform: scale(0.97);
}
.card-pop-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

.checkout-head {
  text-align: center;
  margin-bottom: 26px;
}

.checkout-title {
  margin: 0 0 6px;
  font-size: clamp(1.1rem, 3.2vw, 1.3rem);
  font-weight: 800;
  color: #1a1520;
  letter-spacing: -0.03em;
  line-height: 1.3;
}

.checkout-sub {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #4b1e5a;
}

.field-group {
  margin-bottom: 4px;
}

.field-group--half {
  min-width: 0;
}

.field-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6b5b78;
  margin: 0 0 6px 4px;
}

.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 0;
}

.pay-input :deep(.q-field__control) {
  min-height: 48px;
  border-radius: 14px;
  background: #faf8fc;
  border: 1px solid rgba(75, 30, 90, 0.12);
  transition: border-color 0.2s ease, box-shadow 0.25s ease, background 0.2s ease;
}

.pay-input :deep(.q-field--focused .q-field__control) {
  background: #fff;
  border-color: rgba(75, 30, 90, 0.45);
  box-shadow: 0 0 0 3px rgba(75, 30, 90, 0.12);
}

.pay-input--ok :deep(.q-field__control) {
  border-color: rgba(75, 30, 90, 0.28);
  background: #faf9fc;
}
.pay-input--ok :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(99, 45, 130, 0.14);
}

.pay-input--err :deep(.q-field__control) {
  border-color: rgba(180, 60, 90, 0.45);
  background: #fff8fa;
}
.pay-input--err :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(200, 80, 100, 0.12);
}

.input-pre-ic {
  color: #8a6d9a;
  opacity: 0.9;
}

.field-hint {
  font-size: 11px;
  min-height: 16px;
  margin: 4px 0 10px 4px;
  line-height: 1.3;
  transition: opacity 0.2s ease;
}
.field-hint--err {
  color: #b44d62;
  font-weight: 600;
}
.field-hint--ok {
  color: #5a3d6e;
  font-weight: 600;
}

.err-fade-enter-active,
.err-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.err-fade-enter-from,
.err-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}

.cc-note {
  font-size: 12px;
  line-height: 1.45;
  color: #6b5b78;
  margin: 6px 0 18px;
  padding: 0 2px;
}

.submit-pay {
  width: 100%;
  min-height: 52px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #4b1e5a 0%, #6b2d7a 45%, #5a2470 100%) !important;
  color: #fff !important;
  box-shadow: 0 6px 20px rgba(75, 30, 90, 0.35);
  transition: transform 0.2s ease, box-shadow 0.25s ease, filter 0.2s ease;
}
.submit-pay:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 10px 28px rgba(75, 30, 90, 0.42);
  transform: translateY(-1px);
}
.submit-pay:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
}
.submit-pay:disabled {
  opacity: 0.85;
}
.submit-pay--pulse {
  animation: btn-soft-pulse 2.5s ease-in-out infinite;
}
@keyframes btn-soft-pulse {
  0%,
  100% {
    box-shadow: 0 6px 20px rgba(75, 30, 90, 0.35);
  }
  50% {
    box-shadow: 0 8px 26px rgba(99, 45, 130, 0.45);
  }
}

.success-card {
  width: 100%;
  max-width: 100%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  padding: clamp(28px, 4vw, 40px) clamp(18px, 3vw, 24px);
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(75, 30, 90, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.9);
  animation: success-in 0.5s ease;
  box-sizing: border-box;
}
@keyframes success-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.success-icon-wrap {
  margin-bottom: 16px;
}
.success-icon {
  color: #4b1e5a;
  filter: drop-shadow(0 4px 14px rgba(75, 30, 90, 0.28));
}
.success-title {
  margin: 0 0 8px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #1a1520;
}
.success-text {
  margin: 0;
  font-size: 0.9rem;
  color: #5c5670;
}
</style>
