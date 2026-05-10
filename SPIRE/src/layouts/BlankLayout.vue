<template>
  <!-- No top bar on splash, onboarding, and pre-app auth / job-seeker onboarding flows -->
  <q-layout
    class="blank-layout"
    :class="{ 'blank-layout--preapp': !showPublicBrandNav }"
    :view="layoutView"
  >
    <PublicBrandNav v-if="showPublicBrandNav" />

    <q-page-container class="blank-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicBrandNav from 'src/components/PublicBrandNav.vue'

const route = useRoute()

/** Splash, onboarding carousel, login/signup/role, and job-seeker registration / IQ flow */
const showPublicBrandNav = computed(() => {
  const p = route.path
  if (p === '/' || p === '/onboarding') return false
  if (['/login', '/signup', '/role-selection'].includes(p)) return false
  if (p.startsWith('/job-seeker')) return false
  return true
})

const layoutView = computed(() =>
  showPublicBrandNav.value ? 'hhh lpR fFf' : 'lff',
)
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.blank-page-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  max-width: 100%;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: var(--spire-layout-gutter);
  padding-right: var(--spire-layout-gutter);
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
}

.blank-page-container :deep(> *) {
  min-height: 100%;
}

/* Full white shell for splash, onboarding, login/signup/role, job-seeker registration */
.blank-layout--preapp,
.blank-layout--preapp .blank-page-container {
  background: #ffffff !important;
}
</style>
