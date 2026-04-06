<template>
  <q-layout view="hHh lpR fFf" class="employer-layout">
    <q-page-container class="employer-container" :class="{ 'employer-container--chat': hideFooter }">
      <router-view />
    </q-page-container>

    <q-footer v-if="!hideFooter" elevated class="employer-footer">
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
        <q-route-tab to="/employer/applicants" name="applicants" icon="groups" label="My Applicants" />
        <q-route-tab to="/employer/post-job" name="post-job" icon="add_circle_outline" label="Post Job" />
        <q-route-tab to="/employer/messages" name="messages" icon="chat_bubble_outline" label="Messages" />
        <q-route-tab to="/employer/notifications" name="notifications" icon="notifications" label="Alerts" />
        <q-route-tab to="/employer/profile" name="profile" icon="person_outline" label="Profile" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const hideFooter = computed(
  () => route.meta?.hideFooter === true || route.path.includes('/employer/messages/chat')
)

const activeTab = computed(() => {
  if (route.path.includes('/employer/applicants')) return 'applicants'
  if (route.path.includes('/employer/post-job')) return 'post-job'
  if (route.path.includes('/employer/messages')) return 'messages'
  if (route.path.includes('/employer/notifications')) return 'notifications'
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
</style>
