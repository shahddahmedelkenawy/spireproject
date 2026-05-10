<template>
  <div class="auth-inner">
    <div class="auth-brand">
      <img :src="logoSrc" alt="SPIRE" class="auth-logo">
      <h1 class="auth-headline">
        Welcome to Spire
      </h1>
      <p class="auth-subtitle">
        Create your account to get started
      </p>
    </div>

    <q-form class="auth-form" @submit="onSubmit">
      <q-input
        v-model="email"
        type="email"
        placeholder="Email"
        outlined
        dense
        class="auth-input"
        :rules="emailRules"
        lazy-rules
      />

      <q-input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Password"
        outlined
        dense
        class="auth-input"
        :rules="passwordRules"
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

      <q-input
        v-model="confirmPassword"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Confirm Password"
        outlined
        dense
        class="auth-input"
        :rules="confirmPasswordRules"
        lazy-rules
      />

      <q-checkbox
        v-model="agreeToTerms"
        dense
        class="terms-checkbox auth-checkbox"
        :label="termsLabel"
      />

      <div class="auth-submit-wrap">
        <q-btn
          no-caps
          unelevated
          type="submit"
          class="auth-primary-btn"
          label="Sign Up"
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
      <q-btn round unelevated class="social-btn" aria-label="Google" @click="onSocialClick('google')">
        <svg class="social-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      </q-btn>
      <q-btn round unelevated class="social-btn" aria-label="Facebook" @click="onSocialClick('facebook')">
        <svg class="social-svg social-svg--fb" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </q-btn>
      <q-btn round unelevated class="social-btn" aria-label="Apple" @click="onSocialClick('apple')">
        <svg class="social-svg" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </q-btn>
    </div>

    <p class="auth-footer-text">
      Already have an account?
      <button v-if="dialogMode" type="button" class="auth-link-inline auth-link-btn" @click="$emit('switch-login')">
        Login
      </button>
      <router-link v-else :to="{ path: '/login', query: footerLoginQuery }" class="auth-link-inline">
        Login
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { firebaseErrorMessage } from 'src/utils/firebaseErrorMessages'
import logoSrc from 'src/assets/logo.png'

const props = defineProps({
  dialogMode: {
    type: Boolean,
    default: false,
  },
  /** When set (e.g. from landing dialog), overrides URL query role */
  roleOverride: {
    type: String,
    default: null,
    validator: (v) => v == null || v === 'seeker' || v === 'employer',
  },
})

const emit = defineEmits(['switch-login', 'done'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const agreeToTerms = ref(false)
const loading = ref(false)

const termsLabel = 'By signing up you agree to Terms & Privacy Policy'

const emailRules = [
  (val) => !!val || 'Email is required',
  (val) => /.+@.+\..+/.test(val) || 'Invalid email',
]

const passwordRules = [
  (val) => !!val || 'Password is required',
  (val) => val.length >= 6 || 'At least 6 characters',
]

const confirmPasswordRules = [
  (val) => !!val || 'Confirm Password is required',
  (val) => val === password.value || 'Passwords must match',
]

const role = computed(() => {
  if (props.roleOverride === 'employer') return 'employer'
  if (props.roleOverride === 'seeker') return 'seeker'
  return route.query.role || 'seeker'
})

const mappedRole = computed(() => (role.value === 'employer' ? 'employer' : 'jobseeker'))

const footerLoginQuery = computed(() => {
  const r = route.query.role
  return r ? { role: r } : {}
})

async function onSubmit() {
  if (!agreeToTerms.value) {
    return
  }

  loading.value = true
  try {
    await authStore.register({
      email: email.value,
      password: password.value,
      role: mappedRole.value,
      name: email.value.split('@')[0],
    })

    if (mappedRole.value === 'employer') {
      await router.push('/employer/company-profile')
    } else {
      await router.push('/job-seeker/register')
    }
    emit('done')
  } catch (error) {
    console.error('Sign up failed:', error)
    $q.notify({
      type: 'negative',
      message: firebaseErrorMessage(error),
      position: 'top',
    })
  } finally {
    loading.value = false
  }
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
  color: var(--auth-text, #2c2c2c);
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.auth-subtitle {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--auth-muted, #8a8a8a);
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
  color: var(--auth-placeholder, #b0b0b0);
  opacity: 1;
}

.auth-input :deep(.q-field--outlined .q-field__control:before) {
  border-color: var(--auth-border, #e3d8ef);
}

.auth-input :deep(.q-field--focused .q-field__control:before) {
  border-color: var(--auth-purple-soft, #6b4d7a);
  border-width: 2px;
}

.auth-input :deep(.q-field__label) {
  display: none;
}

.input-eye {
  color: #9e9e9e;
}

.terms-checkbox {
  margin-top: 0;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--auth-muted, #8a8a8a);
  align-items: flex-start;
}

.terms-checkbox :deep(.q-checkbox__label) {
  color: var(--auth-muted, #8a8a8a);
  line-height: 1.35;
}

.auth-checkbox :deep(.q-checkbox__inner) {
  color: var(--auth-purple, #4b1e5a);
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
  background: var(--auth-purple, #4b1e5a) !important;
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
  color: var(--auth-muted, #8a8a8a);
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
  background: var(--auth-purple, #4b1e5a) !important;
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
  color: var(--auth-muted, #8a8a8a);
}

.auth-link-inline {
  color: var(--auth-purple, #4b1e5a);
  font-weight: 600;
  text-decoration: none;
}

.auth-link-inline:hover {
  text-decoration: underline;
}

.auth-link-btn {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
</style>
