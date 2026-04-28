<template>
  <q-layout view="hHh lpR fFf" class="mobile-layout">
    <WebTopNav v-if="isWeb" :nav-items="webNavItems" />

    <!-- Page content -->
    <q-page-container
      class="mobile-page-container"
      :class="{
        'mobile-page-container--chat': hideFooter,
        'mobile-page-container--web': isWeb,
      }"
    >
      <router-view />
    </q-page-container>

    <!-- Bottom navigation -->
    <q-footer v-if="!hideFooter && !isWeb" class="mobile-footer" elevated>
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

const isWeb = computed(() => $q.screen.gt.sm)
const webNavItems = [
  { label: 'Home', to: '/home' },
  { label: 'My Circle', to: '/circle' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Messages', to: '/messages' },
  { label: 'Profile', to: '/profile' },
]

const hideFooter = computed(
  () => route.meta?.hideFooter === true || route.path.includes('/messages/chat')
)

const activeTab = computed(() => {
  const path = route.path
  if (path.startsWith('/peer/')) return 'circle'
  const name = path.replace(/^\//, '').split('/')[0] || 'home'
  return ['home', 'circle', 'notifications', 'messages', 'profile'].includes(name) ? name : 'home'
})

</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f5f5f5;
}

.mobile-page-container {
  padding-bottom: 0;
  min-height: calc(100vh - 56px - env(safe-area-inset-bottom));
}

.mobile-page-container--web {
  min-height: calc(100vh - 72px - 104px);
  width: min(1200px, 100%);
  margin: 0 auto;
}

.mobile-page-container--chat {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom);
}

.mobile-footer {
  background: #4B1E5A !important;
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

@media (max-width: 1023px) {
  .mobile-page-container--web {
    width: min(1200px, 100%);
    min-height: calc(100vh - 64px - 124px);
  }
}
</style>
