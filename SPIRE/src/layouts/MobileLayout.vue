<template>
  <q-layout view="hHh lpR fFf" class="mobile-layout">
    <q-page-container
      class="mobile-page-container"
      :class="{
        'mobile-page-container--chat': hideFooter,
      }"
    >
      <router-view />
    </q-page-container>

    <q-footer v-if="!hideFooter" class="mobile-footer" elevated>
      <q-tabs
        :model-value="activeTab"
        active-color="white"
        indicator-color="transparent"
        class="bottom-nav"
        dense
        no-caps
        align="justify"
      >
        <q-route-tab to="/home" name="home" icon="home" label="Home" />
        <q-route-tab to="/circle" name="circle" icon="group" label="My Circle" />
        <q-route-tab to="/notifications" name="notifications" icon="notifications" label="Notifications" />
        <q-route-tab to="/messages" name="messages" icon="chat" label="Messages" />
        <q-route-tab to="/profile" name="profile" icon="person" label="Profile" />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const hideFooter = computed(
  () => route.meta?.hideFooter === true || route.path.includes('/messages/chat'),
)

const activeTab = computed(() => {
  const path = route.path
  if (path.startsWith('/peer/')) return 'circle'
  const name = path.replace(/^\//, '').split('/')[0] || 'home'
  return ['home', 'circle', 'notifications', 'messages', 'profile'].includes(name)
    ? name
    : 'home'
})
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.mobile-page-container {
  padding-bottom: 0;
  min-height: calc(100vh - 56px - env(safe-area-inset-bottom));
  width: 100%;
  max-width: 100%;
}

.mobile-page-container--chat {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-footer {
  background: #4b1e5a !important;
  padding-bottom: env(safe-area-inset-bottom);
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  overflow: hidden;
}

.bottom-nav {
  height: 56px;
  color: rgba(255, 255, 255, 0.7);
}

.bottom-nav :deep(.q-tab) {
  min-width: 0;
  padding: 8px 12px;
}

.bottom-nav :deep(.q-tab__icon) {
  font-size: 24px;
}

.bottom-nav :deep(.q-tab__label) {
  font-size: 11px;
}

.bottom-nav :deep(.q-tab--active) {
  color: #ffffff;
}
</style>
