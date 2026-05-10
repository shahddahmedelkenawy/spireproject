<template>
  <q-layout :view="layoutView" class="employer-layout">
    <EmployerPremiumNav />

    <q-page-container
      class="employer-container"
      :class="{
        'employer-container--chat': hideFooter,
      }"
    >
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import EmployerPremiumNav from 'src/components/EmployerPremiumNav.vue'

const route = useRoute()
const $q = useQuasar()

/** Mobile keeps a top header row; desktop uses sidebar only (no header strip). */
const layoutView = computed(() =>
  $q.screen.lt.md ? 'lHh Lpr lff' : 'lhh Lpr lff'
)

const hideFooter = computed(
  () => route.meta?.hideFooter === true || route.path.includes('/employer/messages/chat')
)
</script>

<style scoped>
.employer-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.employer-container {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
  /* Tighter than global gutter so dashboard / employer pages use more horizontal space */
  padding-left: clamp(10px, 2vw, 22px);
  padding-right: clamp(10px, 2vw, 22px);
  box-sizing: border-box;
}

.employer-container--chat {
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
