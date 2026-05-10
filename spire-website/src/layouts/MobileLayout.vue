<template>
  <q-layout
    view="hhh lpR fFf"
    class="mobile-layout"
    :class="{ 'mobile-layout--messages': isMessagesRoute }"
  >
    <JobSeekerNavBar />

    <q-page-container
      class="mobile-page-container"
      :class="{
        'mobile-page-container--chat': hideFooter,
      }"
    >
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import JobSeekerNavBar from 'src/components/JobSeekerNavBar.vue'
import { useJobSeekerUiStore } from 'src/stores/jobSeekerUiStore'

const route = useRoute()
const jobSeekerUi = useJobSeekerUiStore()
const { messagesMobileThreadOpen } = storeToRefs(jobSeekerUi)

const isMessagesRoute = computed(() => route.path.startsWith('/messages'))

const hideFooter = computed(
  () =>
    route.meta?.hideFooter === true ||
    route.path.includes('/messages/chat') ||
    messagesMobileThreadOpen.value
)
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.mobile-layout.mobile-layout--messages {
  background: #4b1d4f;
  display: flex;
  flex-direction: column;
}

.mobile-page-container {
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
  max-width: 100%;
}

.mobile-page-container--chat {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
