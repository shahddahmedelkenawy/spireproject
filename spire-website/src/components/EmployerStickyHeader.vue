<template>
  <header class="employer-sticky-header">
    <router-link to="/employer/dashboard" class="brand-logo-wrap">
      <img :src="logoWhiteSrc" alt="SPIRE" class="brand-logo-img">
    </router-link>
    <q-space />
    <div class="header-menu-wrap">
      <q-btn
        flat
        round
        dense
        class="diamond-btn"
        aria-label="Subscription payment"
        @click="onDiamondClick"
      >
        <SpireDiamondIcon class="diamond-ic" />
      </q-btn>
      <q-btn
        flat
        round
        dense
        class="menu-ellipsis-btn"
        icon="more_vert"
      >
        <q-menu anchor="bottom right" self="top right">
          <q-list dense style="min-width: 180px">
            <q-item
              clickable
              v-close-popup
              @click="router.push({ path: '/payment/checkout', query: { type: 'employer' } })"
            >
              <q-item-section>Subscription</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="router.push('/employer/profile')">
              <q-item-section>Settings</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="router.push('/employer/messages')">
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
import logoWhiteSrc from 'src/assets/logo white.png'
import { useAuthStore } from 'src/stores/authStore'
import SpireDiamondIcon from 'src/components/SpireDiamondIcon.vue'

defineProps({
  /** Kept for API compatibility (`surface="dark"` on some forms); styling is unified. */
  surface: {
    type: String,
    default: 'light',
    validator: (v) => ['light', 'dark'].includes(v),
  },
})

const router = useRouter()
const authStore = useAuthStore()

function onDiamondClick() {
  router.push({ path: '/payment/checkout', query: { type: 'employer' } })
}

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
.employer-sticky-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 12px var(--spire-layout-gutter, 16px);
  margin: 0 0 8px;
  min-height: calc(var(--jsk-nav-height, 70px) - 8px);
  background: #3d0b52;
  box-shadow: 0 4px 16px rgba(28, 6, 38, 0.28);
}

.brand-logo-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 0;
  text-decoration: none;
}

.brand-logo-img {
  height: 28px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  display: block;
}

.header-menu-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  min-width: 72px;
}

.diamond-btn,
.menu-ellipsis-btn {
  color: #ffffff !important;
  background: transparent !important;
}

.diamond-ic {
  font-size: 20px;
  display: block;
  color: #ffffff;
}

.diamond-btn :deep(.q-btn__wrapper),
.menu-ellipsis-btn :deep(.q-btn__wrapper) {
  box-shadow: none !important;
}
</style>
