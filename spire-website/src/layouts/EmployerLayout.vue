<template>
  <q-layout view="hHh lpR fFf" class="employer-layout">
    <WebTopNav v-if="isWeb" :nav-items="webNavItems" />

    <q-page-container
      class="employer-container"
      :class="{
        'employer-container--chat': hideFooter,
        'employer-container--web': isWeb,
      }"
    >
      <router-view />
    </q-page-container>

    <q-footer v-if="!hideFooter && !isWeb" elevated class="employer-footer">
      <q-tabs
        :model-value="activeTab"
        class="employer-tabs"
        active-color="white"
        indicator-color="transparent"
        dense
        no-caps
        align="justify"
      >
        <q-route-tab to="/employer/dashboard" name="dashboard" icon="dashboard" label="Dashboard" />
        <q-route-tab to="/employer/applicants" name="applicants" icon="groups" label="Applicants" />
        <q-route-tab to="/employer/post-job" name="post-job" icon="add_circle_outline" label="Post Job" />
        <q-route-tab to="/employer/messages" name="messages" icon="chat_bubble_outline" label="Messages" />
        <q-route-tab to="/employer/profile" name="profile" icon="person_outline" label="Profile" />
      </q-tabs>
    </q-footer>

    <WebFooter v-if="isWeb" />
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import WebTopNav from 'src/components/WebTopNav.vue'
import WebFooter from 'src/components/WebFooter.vue'

const route = useRoute()
const $q = useQuasar()

const hideFooter = computed(
  () => route.meta?.hideFooter === true || route.path.includes('/employer/messages/chat')
)
const isWeb = computed(() => $q.screen.gt.sm)
const webNavItems = [
  { label: 'Dashboard', to: '/employer/dashboard' },
  { label: 'Applicants', to: '/employer/applicants' },
  { label: 'Post Job', to: '/employer/post-job' },
  { label: 'Messages', to: '/employer/messages' },
  { label: 'Profile', to: '/employer/profile' },
]

const activeTab = computed(() => {
  if (route.path.includes('/employer/applicants')) return 'applicants'
  if (route.path.includes('/employer/post-job')) return 'post-job'
  if (route.path.includes('/employer/messages')) return 'messages'
  if (route.path.includes('/employer/profile')) return 'profile'
  return 'dashboard'
})
</script>

<style scoped>
.employer-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f6f7;
}

.employer-container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: calc(56px + env(safe-area-inset-bottom));
}

.employer-container--web {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding-top: 0;
  padding-bottom: 0;
  min-height: calc(100vh - 72px - 104px);
}

.employer-container--chat {
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 100vh;
  min-height: 100dvh;
}

.employer-footer {
  background: #4b1d5a;
  padding-bottom: env(safe-area-inset-bottom);
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  overflow: hidden;
}

.employer-tabs {
  height: 56px;
  color: #d8d8d8;
}

.employer-tabs :deep(.q-tab) {
  min-width: 0;
}

.employer-tabs :deep(.q-tab__label) {
  font-size: 9px;
  line-height: 1.15;
  text-align: center;
  white-space: normal;
  max-width: 100%;
}

@media (max-width: 1023px) {
  .employer-container--web {
    min-height: calc(100vh - 64px - 124px);
  }
}
</style>
