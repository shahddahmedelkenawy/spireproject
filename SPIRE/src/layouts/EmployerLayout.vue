<template>
  <q-layout view="hHh lpR fFf" class="employer-layout">
    <q-page-container
      class="employer-container"
      :class="{
        'employer-container--chat': hideFooter,
        'employer-container--mobile-tabs': !hideFooter,
      }"
    >
      <router-view />
    </q-page-container>

    <q-footer v-if="!hideFooter" class="employer-footer" elevated>
      <q-tabs
        :model-value="activeTab"
        class="employer-tabs"
        active-color="white"
        indicator-color="transparent"
        dense
        no-caps
        align="justify"
      >
        <q-route-tab
          to="/employer/dashboard"
          name="dashboard"
          icon="dashboard"
          label="Dashboard"
        />
        <q-route-tab
          to="/employer/applicants"
          name="applicants"
          icon="groups"
          label="Applicants"
        />
        <q-route-tab
          to="/employer/post-job"
          name="post-job"
          icon="add_circle_outline"
          label="Post Job"
        />
        <q-route-tab
          to="/employer/messages"
          name="messages"
          icon="chat_bubble_outline"
          label="Messages"
        />
        <q-route-tab
          to="/employer/profile"
          name="profile"
          icon="person_outline"
          label="Profile"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const hideFooter = computed(
  () => route.meta?.hideFooter === true || route.path.includes('/employer/messages/chat'),
)

const activeTab = computed(() => {
  const p = route.path
  if (p.includes('/employer/applicants') || p.includes('/employer/applicant/')) {
    return 'applicants'
  }
  if (p.includes('/employer/user/')) return 'applicants'
  if (p.includes('/employer/post-job')) return 'post-job'
  if (p.includes('/employer/messages')) return 'messages'
  if (p.includes('/employer/profile')) return 'profile'
  return 'dashboard'
})
</script>

<style scoped>
.employer-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.employer-container {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: var(--spire-layout-gutter);
  padding-right: var(--spire-layout-gutter);
  box-sizing: border-box;
}

.employer-container--mobile-tabs {
  min-height: calc(100vh - 56px - env(safe-area-inset-bottom));
  padding-bottom: calc(56px + env(safe-area-inset-bottom));
}

.employer-container--chat {
  padding-bottom: env(safe-area-inset-bottom);
  min-height: 100vh;
  min-height: 100dvh;
}

.employer-footer {
  background: #4b1e5a !important;
  padding-bottom: env(safe-area-inset-bottom);
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  overflow: hidden;
}

.employer-tabs {
  height: 56px;
  color: rgba(255, 255, 255, 0.7);
}

.employer-tabs :deep(.q-tab) {
  min-width: 0;
  padding: 8px 4px;
}

.employer-tabs :deep(.q-tab__icon) {
  font-size: 22px;
}

.employer-tabs :deep(.q-tab__label) {
  font-size: 9px;
  line-height: 1.15;
  text-align: center;
  white-space: normal;
  max-width: 100%;
}

.employer-tabs :deep(.q-tab--active) {
  color: #ffffff;
}
</style>
