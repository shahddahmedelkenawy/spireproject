<template>
  <q-layout view="hhh Hrp" class="splash-only-layout">
    <q-page-container class="splash-only-layout__container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.splash-only-layout {
  min-height: 100vh;
  min-height: 100dvh;
}

.splash-only-layout__container {
  padding: 0;
}
</style>
