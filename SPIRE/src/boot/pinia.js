import { defineBoot } from '#q-app/wrappers'
import { createPinia } from 'pinia'
import { useAuthStore } from 'src/stores/authStore'

export default defineBoot(({ app }) => {
  const pinia = createPinia()
  app.use(pinia)
  const authStore = useAuthStore(pinia)
  authStore.initAuth()
})

