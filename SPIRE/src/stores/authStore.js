import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  registerWithEmail,
  loginWithEmail,
  logout as logoutRequest,
  subscribeAuthState,
  waitForAuthReady,
} from 'src/services/authService'
import { createUserProfile, getUserProfile } from 'src/services/userService'
import { useUserStore } from './userStore'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userRole = ref(null)
  const loading = ref(false)
  const isReady = ref(false)

  let unsubscribeAuth = null

  const isAuthenticated = computed(() => !!user.value)

  async function register({ email, password, role, name }) {
    loading.value = true
    try {
      const authUser = await registerWithEmail(email, password)
      await createUserProfile(authUser.uid, {
        id: authUser.uid,
        name: name || email.split('@')[0],
        email: authUser.email || email,
        role: role || 'jobseeker',
      })
      user.value = authUser
      userRole.value = role || 'jobseeker'

      const userStore = useUserStore()
      userStore.setName(name || email.split('@')[0])
      userStore.setEmail(email)
      userStore.setRole(userRole.value)

      return authUser
    } finally {
      loading.value = false
    }
  }

  async function login({ email, password }) {
    loading.value = true
    try {
      const authUser = await loginWithEmail(email, password)
      user.value = authUser
      const profile = await getUserProfile(authUser.uid)
      userRole.value = profile?.role || null

      const userStore = useUserStore()
      if (profile) {
        userStore.setName(profile.name || 'Spire User')
        userStore.setEmail(profile.email || email)
        userStore.setRole(profile.role || 'jobseeker')
      }

      return { user: authUser, role: userRole.value }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await logoutRequest()
    user.value = null
    userRole.value = null
  }

  async function initAuth() {
    if (unsubscribeAuth) return

    await waitForAuthReady()

    unsubscribeAuth = subscribeAuthState(async (authUser) => {
      user.value = authUser
      if (!authUser) {
        userRole.value = null
        isReady.value = true
        return
      }

      const profile = await getUserProfile(authUser.uid)
      userRole.value = profile?.role || null
      const userStore = useUserStore()
      if (profile) {
        userStore.setName(profile.name || 'Spire User')
        userStore.setEmail(profile.email || '')
        userStore.setRole(profile.role || 'jobseeker')
      }
      isReady.value = true
    })
  }

  function disposeAuthListener() {
    if (unsubscribeAuth) {
      unsubscribeAuth()
      unsubscribeAuth = null
    }
  }

  return {
    user,
    userRole,
    loading,
    isReady,
    isAuthenticated,
    register,
    login,
    logout,
    initAuth,
    disposeAuthListener,
  }
})

