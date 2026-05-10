<template>
  <q-layout
    view="hhh lpR fFf"
    class="jobseeker-shell-layout"
    :class="{
      'jobseeker-shell-layout--baby-purple': isUpgradePage,
      'jobseeker-shell-layout--no-main-nav': hideMainNav,
    }"
  >
    <JobSeekerNavBar v-if="!hideMainNav" />

    <q-page-container class="jobseeker-shell-layout__container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import JobSeekerNavBar from 'src/components/JobSeekerNavBar.vue'

const route = useRoute()
const isUpgradePage = computed(() => route.path === '/jobseeker/upgrade' || route.path.startsWith('/jobseeker/upgrade/'))
const hideMainNav = computed(() => route.meta?.hideJobSeekerMainNav === true)
</script>

<style scoped>
.jobseeker-shell-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.jobseeker-shell-layout--baby-purple {
  background: var(--spire-baby-purple);
}

.jobseeker-shell-layout__container {
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
  max-width: var(--spire-content-max);
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
}

.jobseeker-shell-layout__container :deep(.q-page) {
  min-height: calc(100vh - var(--jsk-nav-height, 70px));
  min-height: calc(100dvh - var(--jsk-nav-height, 70px));
}

.jobseeker-shell-layout--no-main-nav .jobseeker-shell-layout__container :deep(.q-page) {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
