<template>
  <q-page class="iq-result-page">
    <div class="result-inner">
      <div class="badge-wrapper">
        <q-avatar size="72px" class="badge-avatar">
          <q-icon name="check_circle" size="40px" />
        </q-avatar>
      </div>

      <h1 class="title">Test Complete</h1>
      <p class="subtitle">
        Thank you, {{ displayName }}
      </p>

      <div class="score-block">
        <div class="score-main">
          {{ iqScore }}/{{ iqTotal }}
        </div>
        <div class="score-percent">
          {{ iqPercentage }}%
        </div>
        <div class="score-status" :class="{ pass: iqPassed, fail: !iqPassed }">
          <span v-if="iqPassed">You're Fully Qualified</span>
          <span v-else>Unfortunately you did not pass</span>
        </div>
      </div>

      <div class="actions">
        <q-btn
          no-caps
          class="primary-btn"
          label="Take Test Again"
          @click="takeAgain"
        />
        <q-btn
          no-caps
          class="primary-btn"
          label="Get Started"
          :disable="!iqPassed"
          :class="{ disabled: !iqPassed }"
          @click="goHome"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const hasResult = computed(() => userStore.hasIqResult)
const iqScore = computed(() => userStore.iqScore)
const iqTotal = computed(() => userStore.iqTotal || 8)
const iqPercentage = computed(() => userStore.iqPercentage || Math.round((userStore.iqScore / (userStore.iqTotal || 8)) * 100) || 0)
const iqPassed = computed(() => userStore.iqPassed)
const displayName = computed(() => userStore.name || 'Spire User')

onMounted(() => {
  if (!hasResult.value) {
    router.replace('/job-seeker/iq-test/1')
  }
})

function takeAgain() {
  userStore.clearIqResult()
  router.push({
    path: '/job-seeker/iq-test/1',
    query: { variant: '2' },
  })
}

function goHome() {
  if (!iqPassed.value) return
  router.push('/home')
}
</script>

<style scoped>
.iq-result-page {
  min-height: 100vh;
  min-height: 100dvh;
  background-color: #4B1E5A;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-inner {
  width: 100%;
  max-width: 420px;
  padding: 32px 20px 24px;
  text-align: center;
}

.badge-wrapper {
  margin-bottom: 16px;
}

.badge-avatar {
  background-color: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 8px 0 4px;
}

.subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 24px;
}

.score-block {
  margin-bottom: 32px;
}

.score-main {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.score-percent {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.95;
  margin-bottom: 8px;
}

.score-status {
  font-size: 15px;
}

.score-status.pass {
  color: #c8ffdd;
}

.score-status.fail {
  color: #ffd0d0;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-btn {
  border-radius: 999px;
  background-color: #ffffff;
  color: #4B1E5A;
  border: none;
  font-weight: 600;
  height: 46px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.primary-btn:hover,
.primary-btn:focus {
  background-color: #4B1E5A;
  color: #ffffff;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.35);
}

.primary-btn.disabled,
.primary-btn:disabled {
  opacity: 0.45;
  box-shadow: none;
  background-color: rgba(255, 255, 255, 0.65);
  color: rgba(75, 30, 90, 0.7);
}
</style>

