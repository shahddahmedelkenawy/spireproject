<template>
  <q-layout class="blank-layout" :class="{ 'blank-layout--light': blankLight }" view="hhh lpR fFf">
    <PublicBrandNav v-if="!hidePublicChrome" />

    <q-page-container class="blank-page-container">
      <router-view />
    </q-page-container>

    <q-footer v-if="!hideSiteFooter" class="blank-layout__footer" bordered>
      <SiteFooter />
    </q-footer>

    <AuthDialogsOverlay />
  </q-layout>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import PublicBrandNav from 'src/components/PublicBrandNav.vue'
import SiteFooter from 'src/components/SiteFooter.vue'
import AuthDialogsOverlay from 'src/components/auth/AuthDialogsOverlay.vue'
import { usePublicAuthDialogStore } from 'src/stores/publicAuthDialogStore'

const route = useRoute()
const blankLight = computed(() => route.meta.blankLight === true)
const hidePublicChrome = computed(() => route.meta.hidePublicChrome === true)
const hideSiteFooter = computed(
  () => hidePublicChrome.value || route.meta.hideSiteFooter === true,
)

const authDialog = usePublicAuthDialogStore()
watch(
  () => route.fullPath,
  () => authDialog.close(),
)
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.blank-layout--light {
  background: #ffffff;
}

.blank-page-container {
  flex: 1 1 auto;
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

.blank-layout__footer {
  padding: 0;
  background: transparent;
}

.blank-page-container :deep(.q-page) {
  min-height: min-content;
}
</style>
