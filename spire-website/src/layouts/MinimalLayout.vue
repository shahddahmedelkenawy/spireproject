<template>
  <q-layout view="hhh Hrp" class="minimal-shell">
    <q-page-container class="minimal-shell__container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Standalone shell: no marketing nav/footer (used for checkout).
</script>

<style scoped>
.minimal-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--spire-baby-purple);
}

.minimal-shell__container {
  padding: 0;
}
</style>
