<template>
  <!-- Button (not hash link): keep independent from current route mode -->
  <button type="button" class="spire-skip-link" @click="skipToMainContent">
    Skip to main content
  </button>
  <main id="spire-main-content" tabindex="-1">
    <router-view />
  </main>
  <div
    id="spire-a11y-live"
    class="sr-only"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    {{ liveAnnouncement }}
  </div>
  <AccessibilityPanel />
</template>

<script setup>
import { watch } from 'vue'
import { storeToRefs } from 'pinia'

function skipToMainContent() {
  const el = document.getElementById('spire-main-content')
  if (!el) return
  el.focus({ preventScroll: true })
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
import { useAuthStore } from 'src/stores/authStore'
import { useNotificationStore } from 'src/stores/notificationStore'
import { useAccessibilityStore } from 'src/stores/accessibilityStore'
import AccessibilityPanel from 'src/components/AccessibilityPanel.vue'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const accessibilityStore = useAccessibilityStore()
const { liveAnnouncement } = storeToRefs(accessibilityStore)

watch(
  () => authStore.user?.uid,
  (uid) => {
    accessibilityStore.setUserContext(uid ?? null)
    notificationStore.fetchForUser(uid || '')
  },
  { immediate: true }
)
</script>
