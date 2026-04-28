<template>
  <q-page class="pay-page">
    <div class="pay-page__center">
      <div class="pay-inner">
        <header class="pay-head">
          <h1 class="pay-logo">SPIRE</h1>
          <p class="pay-line pay-line--sub">Start posting jobs today.</p>
          <p class="pay-pricing">
            Endless posts just for
            <span class="pay-pricing__num">500 EGP/month</span>.
          </p>
          <p class="pay-note">
            Cancel at anytime, effective at the end of the payment period.
          </p>
        </header>

        <div class="method-bar">
          <div class="method-bar__left" aria-hidden="true">
            <span class="visa-chip">VISA</span>
          </div>
          <span class="method-bar__title">Credit Card</span>
        </div>
        <div class="method-divider" role="presentation" />

        <div class="pay-form">
          <q-input
            v-model="cardForm.name"
            placeholder="Shahd Ahmed"
            label="Name on card"
            outlined
            dense
            hide-bottom-space
            class="field pay-field"
          />
          <q-input
            v-model="cardForm.number"
            placeholder="1234 1234 1234 1234"
            label="Card number"
            outlined
            dense
            hide-bottom-space
            class="field pay-field"
            inputmode="numeric"
          >
            <template #append>
              <div class="pay-card-brands">
                <span class="pay-card-brands__visa" title="Visa" aria-hidden="true">
                  <svg viewBox="0 0 48 16" width="32" height="12" focusable="false">
                    <text
                      x="0"
                      y="12.5"
                      font-family="Arial Black, Arial, sans-serif"
                      font-size="15"
                      font-weight="800"
                      fill="#1434CB"
                    >VISA</text>
                  </svg>
                </span>
                <span class="pay-card-brands__mc" title="Mastercard" aria-hidden="true">
                  <svg viewBox="0 0 40 24" width="30" height="20" focusable="false">
                    <circle cx="16" cy="12" r="9" fill="#EB001B" />
                    <circle cx="24" cy="12" r="9" fill="#F79E1B" fill-opacity="0.95" />
                  </svg>
                </span>
              </div>
            </template>
          </q-input>
          <div class="row-fields">
            <q-input
              v-model="cardForm.exp"
              placeholder="MM/YY"
              label="Expire date"
              outlined
              dense
              hide-bottom-space
              class="field pay-field"
            />
            <q-input
              v-model="cardForm.cvv"
              placeholder="346"
              label="CVV"
              outlined
              dense
              hide-bottom-space
              class="field pay-field"
              inputmode="numeric"
              maxlength="4"
            />
          </div>

          <div class="pay-btn-wrap">
            <q-btn
              no-caps
              unelevated
              class="pay-btn"
              label="Pay"
              @click="goDetails('card')"
            />
          </div>
        </div>

        <footer class="pay-legal" aria-label="Subscription terms">
          <p>
            By clicking Agree and Subscribe, you confirm that your Spire subscription
            starts immediately. You may withdraw from the subscription and request a
            refund within the first 14 days.
          </p>
          <p>
            Subscription fees will be charged monthly to your selected payment method
            and will renew automatically unless canceled. You can cancel your
            subscription at any time, and the cancellation will take effect at the end
            of the current billing period.
          </p>
          <p>
            Spire is committed to transparency, fairness, and accessibility for all
            users.
          </p>
        </footer>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const cardForm = ref({
  name: '',
  number: '',
  exp: '',
  cvv: '',
})

function goDetails(method) {
  router.push({ path: '/employer/payment-details', query: { method } })
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #f4f0fa;
  background: linear-gradient(160deg, #0f0518 0%, #1a0d2e 40%, #241238 100%);
}

.pay-page__center {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 48px;
  width: 100%;
  box-sizing: border-box;
}

.pay-inner {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0 auto;
}

.pay-head {
  text-align: center;
  margin-bottom: 32px;
}

.pay-logo {
  margin: 0 0 16px;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: 0.22em;
  line-height: 1.1;
  text-transform: uppercase;
  color: #ffffff;
}

.pay-line--sub {
  margin: 0 0 18px;
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.4;
  color: rgba(244, 240, 250, 0.95);
  letter-spacing: 0.01em;
}

.pay-pricing {
  margin: 0 0 12px;
  font-size: 1.05rem;
  line-height: 1.5;
  color: rgba(244, 240, 250, 0.9);
  font-weight: 400;
}

.pay-pricing__num {
  font-weight: 700;
  font-size: 1.2em;
  color: #ffffff;
}

.pay-note {
  margin: 0;
  max-width: 32rem;
  margin-left: auto;
  margin-right: auto;
  font-size: 0.8rem;
  line-height: 1.5;
  color: rgba(200, 190, 220, 0.85);
  font-weight: 400;
}

.method-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.visa-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 5px 8px 4px;
  border-radius: 4px;
  background: #ffffff;
  color: #1a1f71;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1;
}

.method-bar__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: 0.02em;
}

.method-divider {
  height: 1px;
  width: 100%;
  margin-bottom: 24px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.pay-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.field {
  margin-bottom: 16px;
}

.field:last-of-type {
  margin-bottom: 0;
}

/* Light gray fill, soft radius, no harsh border */
.field.pay-field :deep(.q-field__control) {
  min-height: 48px;
  border-radius: 12px;
  background: #eceff3;
  box-shadow: none;
}

.field.pay-field :deep(.q-field__control::before) {
  border: 1px solid rgba(0, 0, 0, 0.04);
}
.field.pay-field :deep(.q-field__control::after) {
  border: 0;
}

.field.pay-field :deep(.q-field--focused .q-field__control::before) {
  border-color: rgba(255, 255, 255, 0.35);
  border-width: 1px;
}
.field.pay-field :deep(.q-field--outlined .q-field__control:hover::before) {
  border-color: rgba(0, 0, 0, 0.08);
}

.field.pay-field :deep(input::placeholder) {
  color: #9aa0a6;
  opacity: 1;
}
.field.pay-field :deep(input) {
  color: #1a1a1f;
  padding-top: 2px;
  padding-bottom: 2px;
}

.field.pay-field :deep(.q-field__label) {
  color: rgba(26, 26, 31, 0.7);
  font-size: 0.85rem;
  font-weight: 500;
}

.field.pay-field :deep(.q-field__inner) {
  padding-left: 2px;
  padding-right: 2px;
}

.field.pay-field :deep(.q-field__control-container) {
  padding-top: 0;
}

.field.pay-field :deep(.q-field__append) {
  padding-right: 4px;
}

.row-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 0;
  margin-top: 0;
}

.row-fields .field {
  min-width: 0;
  margin-bottom: 16px;
}

.pay-card-brands {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-left: 4px;
  pointer-events: none;
}

.pay-card-brands__visa,
.pay-card-brands__mc {
  display: flex;
  align-items: center;
  opacity: 0.9;
}

.pay-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 8px;
  margin-bottom: 0;
  width: 100%;
}

.pay-btn {
  min-width: 200px;
  max-width: 100%;
  height: 48px;
  padding: 0 40px;
  border-radius: 999px;
  background: #f8f8fa;
  color: #1c0d28;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition:
    background 0.2s ease,
    opacity 0.2s ease,
    box-shadow 0.2s ease;
}

.pay-btn:hover {
  background: #ffffff;
  opacity: 0.98;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.pay-btn:deep(.q-btn__content) {
  font-weight: 600;
}

.pay-legal {
  margin-top: 36px;
  padding-top: 8px;
  text-align: left;
  font-size: 0.68rem;
  line-height: 1.6;
  color: rgba(180, 170, 200, 0.8);
  font-weight: 400;
  letter-spacing: 0.01em;
}
.pay-legal p {
  margin: 0 0 12px;
}
.pay-legal p:last-child {
  margin-bottom: 0;
}
</style>
