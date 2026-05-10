<template>
  <q-layout view="hhh lpr fff" class="jobseeker-shell-layout">
    <q-page-container class="jobseeker-shell-layout__container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup></script>

<style scoped>
.jobseeker-shell-layout {
  min-height: 100vh;
  min-height: 100dvh;
  background: #f6f7f9;
}

.jobseeker-shell-layout__container {
  padding-top: 0;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.jobseeker-shell-layout__container :deep(.q-page) {
  min-height: 100vh;
  min-height: 100dvh;
}
</style>
