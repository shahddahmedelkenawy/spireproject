<template>
  <div class="auth-dialogs-host">
    <q-dialog
      :model-value="loginOpen"
      transition-show="fade"
      transition-hide="fade"
      @update:model-value="onLoginDialogUpdate"
    >
      <q-card class="auth-dialog-card">
        <q-card-section class="auth-dialog-card__body">
          <LoginAuthForm
            dialog-mode
            @done="onAuthDone"
            @switch-signup="onSwitchToSignup"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      :model-value="signupOpen"
      transition-show="fade"
      transition-hide="fade"
      @update:model-value="onSignupDialogUpdate"
    >
      <q-card class="auth-dialog-card">
        <q-card-section class="auth-dialog-card__body">
          <SignUpAuthForm
            dialog-mode
            :role-override="signupRoleOverride"
            @done="onAuthDone"
            @switch-login="onSwitchToLogin"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import LoginAuthForm from 'src/components/auth/LoginAuthForm.vue'
import SignUpAuthForm from 'src/components/auth/SignUpAuthForm.vue'
import { usePublicAuthDialogStore } from 'src/stores/publicAuthDialogStore'

const store = usePublicAuthDialogStore()

const loginOpen = computed({
  get: () => store.dialog === 'login',
  set: (v) => {
    if (!v) store.close()
  },
})

const signupOpen = computed({
  get: () => store.dialog === 'signup',
  set: (v) => {
    if (!v) store.close()
  },
})

const signupRoleOverride = computed(() => {
  const r = store.signupRole
  return r === 'employer' ? 'employer' : 'seeker'
})

function onLoginDialogUpdate(v) {
  loginOpen.value = v
}

function onSignupDialogUpdate(v) {
  signupOpen.value = v
}

function onAuthDone() {
  store.close()
}

function onSwitchToSignup() {
  store.switchToSignup()
}

function onSwitchToLogin() {
  store.switchToLogin()
}
</script>

<style scoped>
.auth-dialogs-host {
  display: contents;
}

.auth-dialog-card {
  width: min(440px, calc(100vw - 32px));
  max-height: min(92vh, 900px);
  border-radius: 16px;
  overflow: hidden;
}

.auth-dialog-card__body {
  padding: 20px 16px 24px;
  max-height: min(88vh, 880px);
  overflow-y: auto;
}
</style>
