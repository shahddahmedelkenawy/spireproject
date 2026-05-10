<template>
  <q-layout view="hhh lpR fFf" class="employer-layout">
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
import EmployerPremiumNav from 'src/components/EmployerPremiumNav.vue'

const route = useRoute()

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
  max-width: var(--spire-content-max);
  margin: 0 auto;
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: var(--spire-layout-gutter);
  padding-right: var(--spire-layout-gutter);
  box-sizing: border-box;
}

.employer-container--chat {
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
