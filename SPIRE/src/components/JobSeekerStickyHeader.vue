<template>
  <header class="jobseeker-sticky-header">
    <div class="header-spacer" />
    <div class="brand-logo-wrap">
      <img :src="logoSrc" alt="SPIRE" class="brand-logo-img" />
    </div>
    <div class="header-menu-wrap">
      <q-btn
        flat
        round
        dense
        class="menu-ellipsis-btn"
        icon="more_vert"
      >
        <q-menu anchor="bottom right" self="top right">
          <q-list dense style="min-width: 180px">
            <q-item clickable v-close-popup @click="router.push('/upgrade')">
              <q-item-section>Upgrade</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="router.push('/shared/profile-edit')">
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="router.push('/messages')">
              <q-item-section>Help</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleLogout">
              <q-item-section class="text-negative">Logout</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import logoSrc from 'src/assets/logo.png'
import { useAuthStore } from 'src/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  try {
    await authStore.logout()
    await router.replace('/login')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.jobseeker-sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0 10px;
  margin: 0 -16px 4px;
  padding-left: 16px;
  padding-right: 16px;
  background: rgba(245, 245, 245, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.header-spacer,
.header-menu-wrap {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.header-spacer {
  justify-content: flex-start;
}

.brand-logo-wrap {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36px;
}

.brand-logo-img {
  height: 28px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  display: block;
}

.menu-ellipsis-btn {
  color: #4b1d5a !important;
  background: transparent !important;
}

.menu-ellipsis-btn :deep(.q-btn__wrapper) {
  box-shadow: none !important;
}
</style>
