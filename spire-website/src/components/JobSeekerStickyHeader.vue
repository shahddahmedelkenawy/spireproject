<template>
  <header class="jobseeker-sticky-header">
    <div v-if="showBack" class="header-back-wrap">
      <q-btn
        flat
        round
        dense
        class="back-btn"
        icon="arrow_back"
        aria-label="Back"
        @click="onBack"
      />
    </div>
    <div v-else class="header-spacer" />
    <div class="brand-logo-wrap">
      <img :src="logoSrc" alt="SPIRE" class="brand-logo-img" />
    </div>
    <div class="header-menu-wrap">
      <q-btn
        flat
        round
        dense
        class="diamond-btn"
        aria-label="Plans and upgrades"
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
            <q-item clickable v-close-popup @click="router.push('/jobseeker/upgrade')">
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
import SpireDiamondIcon from 'src/components/SpireDiamondIcon.vue'

defineProps({
  showBack: { type: Boolean, default: false },
})

const emit = defineEmits(['back'])

const router = useRouter()
const authStore = useAuthStore()

function onBack() {
  emit('back')
}

function onDiamondClick() {
  router.push('/jobseeker/upgrade')
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
.header-back-wrap {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
}

.header-menu-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  min-width: 72px;
}

.header-spacer {
  justify-content: flex-start;
}

.header-back-wrap {
  justify-content: flex-start;
}

.back-btn {
  color: #1e1e1e !important;
  background: transparent !important;
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

.diamond-btn,
.menu-ellipsis-btn {
  color: #4b1d5a !important;
  background: transparent !important;
}

.diamond-ic {
  font-size: 20px;
  display: block;
}

.diamond-btn :deep(.q-btn__wrapper),
.menu-ellipsis-btn :deep(.q-btn__wrapper) {
  box-shadow: none !important;
}
</style>
