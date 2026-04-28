<template>
  <q-layout class="blank-layout" view="hHh lpR fFf">
    <q-page-container class="blank-page-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.blank-layout {
  min-height: 100vh;
  min-height: 100dvh;
}

.blank-page-container {
  min-height: 100vh;
  min-height: 100dvh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  overflow-x: hidden;
  overflow-y: auto;
}

/* Ensure page content (q-page or div) fills and is visible */
.blank-page-container :deep(> *) {
  min-height: 100%;
}
</style>
