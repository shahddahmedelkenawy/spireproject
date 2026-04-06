<template>
  <div class="auth-page">
    <header class="auth-topbar">
      <q-btn flat round dense icon="arrow_back" class="back-btn" aria-label="Back" @click="$router.back()" />
      <div class="topbar-spacer" />
    </header>

    <main class="auth-main">
      <div class="auth-inner">
        <div class="auth-brand">
          <img :src="logoSrc" alt="SPIRE" class="auth-logo" />
          <h1 class="auth-headline">Welcome Back to Spire</h1>
          <p class="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <q-form class="auth-form" @submit="onSubmit">
          <q-input
            v-model="email"
            type="email"
            placeholder="Email"
            outlined
            dense
            class="auth-input"
            :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Invalid email']"
            lazy-rules
          />
          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            outlined
            dense
            class="auth-input"
            :rules="[val => !!val || 'Password is required']"
            lazy-rules
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer input-eye"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="auth-row-options">
            <q-checkbox v-model="rememberMe" dense class="remember-check auth-checkbox" label="Remember me?" />
            <button type="button" class="forgot-link" @click="onForgotPassword">Forgot your password?</button>
          </div>

          <div class="auth-submit-wrap">
            <q-btn
              no-caps
              unelevated
              type="submit"
              class="auth-primary-btn"
              label="Login"
              :loading="loading"
            />
          </div>
        </q-form>

        <div class="auth-divider" aria-hidden="true">
          <span class="auth-divider__line" />
          <span class="auth-divider__text">or continue with</span>
          <span class="auth-divider__line" />
        </div>

        <div class="social-row">
          <q-btn
            round
            unelevated
            class="social-btn"
            aria-label="Google"
            @click="onSocialClick('google')"
          >
            <svg class="social-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </q-btn>
          <q-btn
            round
            unelevated
            class="social-btn"
            aria-label="Facebook"
            @click="onSocialClick('facebook')"
          >
            <svg class="social-svg social-svg--fb" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
          </q-btn>
          <q-btn
            round
            unelevated
            class="social-btn"
            aria-label="Apple"
            @click="onSocialClick('apple')"
          >
            <svg class="social-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
              />
            </svg>
          </q-btn>
        </div>

        <p class="auth-footer-text">
          Don’t have an account?
          <router-link :to="{ path: '/signup', query: { role } }" class="auth-link-inline">
            Sign Up
          </router-link>
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import logoSrc from 'src/assets/logo.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)

const role = computed(() => route.query.role || null)

async function onSubmit() {
  loading.value = true
  try {
    const { role: dbRole } = await authStore.login({
      email: email.value,
      password: password.value,
    })

    const queryRole = route.query.role === 'employer' ? 'employer' : null
    const resolvedRole = queryRole || dbRole

    if (resolvedRole === 'employer') {
      router.push('/employer/dashboard')
      return
    }

    router.push('/home')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}

function onForgotPassword() {
  $q.notify({
    type: 'info',
    message: 'Password recovery will be available soon.',
    position: 'top',
    timeout: 2000,
  })
}

function onSocialClick(provider) {
  $q.notify({
    type: 'info',
    message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in will be enabled soon.`,
    position: 'top',
    timeout: 1800,
  })
}

</script>

<style scoped>
.auth-page {
  --auth-purple: #4b1e5a;
  --auth-purple-soft: #6b4d7a;
  --auth-border: #e3d8ef;
  --auth-text: #2c2c2c;
  --auth-muted: #8a8a8a;
  --auth-placeholder: #b0b0b0;

  min-height: 100vh;
  min-height: 100dvh;
  background: #ffffff;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
  display: flex;
  flex-direction: column;
}

.auth-topbar {
  display: flex;
  align-items: center;
  padding: 8px 8px 0;
  flex-shrink: 0;
}

.back-btn {
  color: var(--auth-text);
}

.topbar-spacer {
  width: 40px;
}

.auth-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 24px 24px;
  width: 100%;
}

.auth-inner {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.auth-brand {
  text-align: center;
  margin-bottom: 16px;
}

.auth-logo {
  display: block;
  margin: 0 auto 12px;
  height: 40px;
  width: auto;
  object-fit: contain;
}

.auth-headline {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--auth-text);
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--auth-muted);
  margin: 0;
  line-height: 1.45;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-input :deep(.q-field) {
  box-shadow: none;
}

.auth-input :deep(.q-field__control) {
  border-radius: 999px;
  min-height: 48px;
  padding-left: 20px;
  padding-right: 16px;
  box-shadow: none !important;
}

.auth-input :deep(.q-field--outlined .q-field__control:before),
.auth-input :deep(.q-field--outlined .q-field__control:after) {
  box-shadow: none !important;
}

.auth-input :deep(.q-field__native::placeholder) {
  color: var(--auth-placeholder);
  opacity: 1;
}

.auth-input :deep(.q-field--outlined .q-field__control:before) {
  border-color: var(--auth-border);
}

.auth-input :deep(.q-field--focused .q-field__control:before) {
  border-color: var(--auth-purple-soft);
  border-width: 2px;
}

.auth-input :deep(.q-field__label) {
  display: none;
}

.input-eye {
  color: #9e9e9e;
}

.auth-row-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 0;
  flex-wrap: wrap;
}

.remember-check {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--auth-muted);
}

.remember-check :deep(.q-checkbox__label) {
  color: var(--auth-muted);
}

.auth-checkbox :deep(.q-checkbox__inner) {
  color: var(--auth-purple);
}

.forgot-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--auth-purple);
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
}

.forgot-link:hover {
  text-decoration: underline;
}

.auth-submit-wrap {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.auth-primary-btn {
  min-width: 200px;
  max-width: 280px;
  padding: 0 40px;
  height: 48px;
  border-radius: 999px;
  background: var(--auth-purple) !important;
  color: #ffffff !important;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: none !important;
}

.auth-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0 14px;
}

.auth-divider__line {
  flex: 1;
  height: 1px;
  background: #e8e8ec;
}

.auth-divider__text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--auth-muted);
  white-space: nowrap;
}

.social-row {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.social-btn {
  width: 52px;
  height: 52px;
  min-width: 52px;
  min-height: 52px;
  background: var(--auth-purple) !important;
  box-shadow: none !important;
}

.social-svg {
  width: 22px;
  height: 22px;
  color: #ffffff;
}

.social-svg--fb {
  width: 20px;
  height: 20px;
}

.auth-footer-text {
  text-align: center;
  margin-top: 16px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--auth-muted);
}

.auth-link-inline {
  color: var(--auth-purple);
  font-weight: 600;
  text-decoration: none;
}

.auth-link-inline:hover {
  text-decoration: underline;
}
</style>
