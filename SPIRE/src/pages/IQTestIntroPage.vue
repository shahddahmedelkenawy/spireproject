<template>
  <q-page class="iq-intro-page spire-form-page">
    <div class="page-inner spire-form-shell">
      <div class="top-section">
        <h1 class="title">Welcome to IQ Test!</h1>
        <p class="subtitle">
          This short test has 8 questions to check your logical thinking.
          Take your time, there is no strict time limit.
        </p>
      </div>

      <div class="form-section">
        <q-input
          v-model="fullName"
          label="Full Name"
          dense
          outlined
          class="form-input spire-form-field"
        />

        <div class="info-list">
          <div class="info-item">• 8 questions</div>
          <div class="info-item">• Logical thinking</div>
          <div class="info-item">• No strict time limit</div>
        </div>
      </div>

      <div class="bottom-actions">
        <q-btn
          no-caps
          class="outline-btn start-btn spire-form-submit"
          label="Start Test"
          @click="startTest"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from 'src/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const fullName = ref(userStore.name || '')

function startTest() {
  userStore.setName(fullName.value || userStore.name)
  router.push({
    path: '/job-seeker/iq-test/1',
  })
}
</script>

<style scoped>
.iq-intro-page {
  min-height: 100vh !important;
  min-height: 100dvh !important;
  background-color: #4B1E5A;
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.page-inner {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 16px 24px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
  flex: 1;
}

.top-section {
  text-align: left;
  margin-bottom: 16px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  opacity: 0.9;
}

.form-section {
  flex: 1;
  margin-top: 24px;
}

.form-input :deep(.q-field__control) {
  border-radius: 20px;
  background-color: #ffffff;
}

.form-input :deep(.q-field__control:before) {
  border-color: rgba(75, 30, 90, 0.3);
}

.form-input :deep(.q-field__label),
.form-input :deep(.q-field__native) {
  color: #1a1a1a;
}

.form-input :deep(.q-field__label) {
  color: rgba(75, 30, 90, 0.8);
}

.form-input {
  margin-bottom: 16px;
}

.info-list {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.95;
}

.info-item {
  margin-bottom: 4px;
}

.bottom-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.outline-btn {
  border-radius: 25px;
  background-color: #ffffff;
  color: #4B1E5A;
  border: 2px solid #ffffff;
  font-weight: 600;
  height: 46px;
  padding: 0 40px;
  transition: all 0.2s ease;
}

.outline-btn:hover,
.outline-btn:focus {
  background-color: #4B1E5A;
  color: #ffffff;
  border-color: #ffffff;
}
</style>

