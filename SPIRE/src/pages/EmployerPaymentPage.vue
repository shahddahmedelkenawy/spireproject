<template>
  <q-page class="pay-page spire-form-page">
    <div class="pay-inner spire-form-shell">
      <div class="top">
        <div class="logo">SPIRE</div>
        <h1 class="title">Start posting jobs today.</h1>
        <p class="subtitle">
          Endless posts just for <b>500 EGP/month</b>.
        </p>
        <p class="note">Cancel at anytime, effective at the end of the payment period.</p>
      </div>

      <q-tabs v-model="tab" indicator-color="white" class="tabs" align="justify">
        <q-tab name="card" label="Credit Card" />
        <q-tab name="other" label="Pay with another way" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated class="panels">
        <q-tab-panel name="card" class="panel">
          <q-input v-model="cardForm.name" placeholder="Shahd Ahmed" label="Name on card" class="field spire-form-field" outlined />
          <q-input v-model="cardForm.number" placeholder="1234 1234 1234 1234" label="Card Number" class="field spire-form-field" outlined>
            <template #append>
              <q-icon name="credit_card" />
            </template>
          </q-input>
          <div class="row-fields">
            <q-input v-model="cardForm.exp" placeholder="MM/YY" label="Expire Date" class="field spire-form-field" outlined />
            <q-input v-model="cardForm.cvv" placeholder="346" label="CVV" class="field spire-form-field" outlined />
          </div>
          <q-btn no-caps class="pay-btn spire-form-submit" label="Pay" @click="goDetails('card')" />
        </q-tab-panel>

        <q-tab-panel name="other" class="panel">
          <q-list class="methods">
            <q-item
              v-for="method in methods"
              :key="method.value"
              clickable
              class="method-item"
              @click="selectedMethod = method.value"
            >
              <q-item-section avatar>
                <q-icon :name="method.icon" />
              </q-item-section>
              <q-item-section>{{ method.label }}</q-item-section>
              <q-item-section side>
                <q-radio v-model="selectedMethod" :val="method.value" />
              </q-item-section>
            </q-item>
          </q-list>
          <q-btn no-caps class="pay-btn spire-form-submit" label="Pay" :disable="!selectedMethod" @click="goDetails(selectedMethod)" />
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tab = ref('card')
const selectedMethod = ref('')
const cardForm = ref({
  name: '',
  number: '',
  exp: '',
  cvv: '',
})

const methods = [
  { label: 'Vodafone Cash', value: 'vodafone', icon: 'account_balance_wallet' },
  { label: 'Instapay', value: 'instapay', icon: 'payments' },
  { label: 'Fawry', value: 'fawry', icon: 'receipt_long' },
  { label: 'Apple Pay', value: 'apple', icon: 'phone_iphone' },
  { label: 'Telda', value: 'telda', icon: 'credit_score' },
]

function goDetails(method) {
  router.push({ path: '/employer/payment-details', query: { method } })
}
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #4B1D5A;
  color: #ffffff;
  font-family: "Inter", sans-serif;
}
.pay-inner { padding: 22px 16px; max-width: 460px; margin: 0 auto; }
.top { text-align: center; margin-bottom: 14px; }
.logo { font-size: 28px; font-weight: 700; margin-bottom: 12px; }
.title { font-size: 20px; font-weight: 600; margin: 0 0 8px; }
.subtitle { margin: 0; font-size: 14px; }
.note { margin-top: 8px; font-size: 12px; opacity: 0.85; }
.tabs { color: #fff; margin-top: 12px; }
.panels { background: transparent; }
.panel { padding: 10px 0 0; }
.field :deep(.q-field__control) { background: #fff; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.field { margin-bottom: 10px; }
.row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pay-btn {
  margin-top: 10px;
  width: 100%;
  border-radius: 999px;
  background: #fff;
  color: #4B1D5A;
  font-weight: 600;
  height: 44px;
}
.methods { display: flex; flex-direction: column; gap: 8px; }
.method-item {
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 14px;
  background: rgba(255,255,255,0.06);
}
</style>

