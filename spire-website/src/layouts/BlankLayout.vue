<template>
  <q-layout class="blank-layout" view="hhh lpR fFf">
    <PublicBrandNav />

    <q-page-container class="blank-page-container">
      <router-view />
    </q-page-container>

    <q-footer class="blank-layout__footer" bordered>
      <SiteFooter />
    </q-footer>
  </q-layout>
</template>

<script setup>
import PublicBrandNav from 'src/components/PublicBrandNav.vue'
import SiteFooter from 'src/components/SiteFooter.vue'
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
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
