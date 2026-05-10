import { defineStore } from 'pinia'
import { ref } from 'vue'

/** Login / Sign up dialogs opened from the marketing landing nav & hero (no route change). */
export const usePublicAuthDialogStore = defineStore('publicAuthDialog', () => {
  const dialog = ref(null) // null | 'login' | 'signup'
  const signupRole = ref('seeker') // 'seeker' | 'employer'

  function openLogin() {
    dialog.value = 'login'
  }

  function openSignup(role = 'seeker') {
    signupRole.value = role === 'employer' ? 'employer' : 'seeker'
    dialog.value = 'signup'
  }

  function close() {
    dialog.value = null
  }

  function switchToSignup() {
    signupRole.value = 'seeker'
    dialog.value = 'signup'
  }

  function switchToLogin() {
    dialog.value = 'login'
  }

  return {
    dialog,
    signupRole,
    openLogin,
    openSignup,
    close,
    switchToSignup,
    switchToLogin,
  }
})
