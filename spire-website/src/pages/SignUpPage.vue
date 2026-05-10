<template>
  <div class="auth-page">
    <header class="auth-topbar">
      <q-btn flat round dense icon="arrow_back" class="back-btn" aria-label="Back" @click="$router.back()" />
      <div class="topbar-spacer" />
    </header>

    <main class="auth-main">
      <SignUpAuthForm />
    </main>
  </div>
</template>

<script setup>
import SignUpAuthForm from 'src/components/auth/SignUpAuthForm.vue'
</script>

<style scoped>
.auth-page {
  --auth-purple: #4b1e5a;
  --auth-purple-soft: #6b4d7a;
  --auth-border: #e3d8ef;
  --auth-text: #2c2c2c;
  --auth-muted: #8a8a8a;
  --auth-placeholder: #b0b0b0;

  min-height: 100vh;
  min-height: 100dvh;
  background: #ffffff;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  position: relative;
  display: flex;
  flex-direction: column;
}

.auth-topbar {
  display: flex;
  align-items: center;
  padding: 8px 8px 0;
  flex-shrink: 0;
}

.back-btn {
  color: var(--auth-text);
}

.topbar-spacer {
  width: 40px;
}

.auth-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px 24px 24px;
  width: 100%;
}
</style>
