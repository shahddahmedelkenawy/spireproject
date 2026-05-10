<template>
  <q-header class="jsk-nav" elevated>
    <div class="jsk-nav__inner">
      <!-- Desktop / tablet wide -->
      <div v-if="!compact" class="jsk-nav__row jsk-nav__row--desktop">
        <div class="jsk-nav__segment jsk-nav__segment--left">
          <q-btn
            v-if="showBack"
            flat
            round
            dense
            icon="arrow_back"
            class="jsk-nav__icon-btn"
            aria-label="Back"
            @click="goBack"
          />

          <router-link to="/home" class="jsk-nav__logo-link">
            <img :src="logoWhiteSrc" alt="SPIRE" class="jsk-nav__logo-img">
          </router-link>

          <div class="jsk-nav__search-wrap">
            <q-input
              :model-value="jobSearch"
              dense
              outlined
              rounded
              hide-bottom-space
              class="jsk-nav__search"
              placeholder="Search For Roles, Companies Or Locations"
              @update:model-value="jobStore.setSearch"
              @focus="onNavSearchFocus"
            >
              <template #prepend>
                <q-icon name="search" size="20px" class="jsk-nav__search-ic" />
              </template>
              <template v-if="jobSearch" #append>
                <q-btn
                  round
                  dense
                  flat
                  icon="close"
                  class="jsk-nav__search-clear"
                  tabindex="-1"
                  @click.stop="jobStore.setSearch('')"
                />
              </template>
            </q-input>
          </div>
        </div>

        <nav class="jsk-nav__segment jsk-nav__segment--center" aria-label="Primary">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="jsk-nav__nav-item"
            :class="{ 'jsk-nav__nav-item--active': navActive(item.to) }"
          >
            <q-icon :name="item.icon" size="22px" class="jsk-nav__nav-ic" />
            <span class="jsk-nav__nav-label">{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="jsk-nav__segment jsk-nav__segment--right">
          <router-link to="/profile" class="jsk-nav__profile-link">
            <q-avatar size="36px" class="jsk-nav__avatar">
              <img v-if="photoUrl" :src="photoUrl" alt="">
              <span v-else>{{ userInitial }}</span>
            </q-avatar>
            <span class="jsk-nav__user-name">{{ displayName }}</span>
          </router-link>

          <q-btn flat round dense icon="more_vert" class="jsk-nav__icon-btn" aria-label="Menu">
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
                  <q-item-section class="text-negative">
                    Logout
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <!-- Mobile narrow -->
      <div v-else class="jsk-nav__row jsk-nav__row--mobile-top">
        <div class="jsk-nav__mobile-left">
          <q-btn
            flat
            round
            dense
            icon="menu"
            class="jsk-nav__icon-btn"
            aria-label="Open menu"
            @click="drawerOpen = true"
          />

          <q-btn
            v-if="showBack"
            flat
            round
            dense
            icon="arrow_back"
            class="jsk-nav__icon-btn"
            aria-label="Back"
            @click="goBack"
          />

          <router-link to="/home" class="jsk-nav__logo-link">
            <img :src="logoWhiteSrc" alt="SPIRE" class="jsk-nav__logo-img">
          </router-link>
        </div>

        <div class="jsk-nav__segment jsk-nav__segment--right">
          <router-link to="/profile" class="jsk-nav__profile-link">
            <q-avatar size="34px" class="jsk-nav__avatar">
              <img v-if="photoUrl" :src="photoUrl" alt="">
              <span v-else>{{ userInitial }}</span>
            </q-avatar>
            <span class="jsk-nav__user-name jsk-nav__user-name--mobile">{{ displayName }}</span>
          </router-link>

          <q-btn flat round dense icon="more_vert" class="jsk-nav__icon-btn" aria-label="Menu">
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
                  <q-item-section class="text-negative">
                    Logout
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <!-- Mobile search row -->
      <div v-if="compact" class="jsk-nav__row jsk-nav__row--search">
        <q-input
          :model-value="jobSearch"
          dense
          outlined
          rounded
          hide-bottom-space
          class="jsk-nav__search jsk-nav__search--full"
          placeholder="Search For Roles, Companies Or Locations"
          @update:model-value="jobStore.setSearch"
          @focus="onNavSearchFocus"
        >
          <template #prepend>
            <q-icon name="search" size="20px" class="jsk-nav__search-ic" />
          </template>
          <template v-if="jobSearch" #append>
            <q-btn
              round
              dense
              flat
              icon="close"
              class="jsk-nav__search-clear"
              tabindex="-1"
              @click.stop="jobStore.setSearch('')"
            />
          </template>
        </q-input>
      </div>
    </div>

    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      bordered
      class="jsk-drawer"
      :width="280"
    >
      <q-list padding class="jsk-drawer-list">
        <q-item-label header class="text-grey-8">
          Menu
        </q-item-label>
        <q-item
          v-for="item in navItems"
          :key="'d-' + item.to"
          clickable
          v-ripple
          :active="navActive(item.to)"
          active-class="jsk-drawer-item--active"
          @click="goNav(item.to)"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-header>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import logoWhiteSrc from 'src/assets/logo white.png'
import { useJobStore } from 'src/stores/jobStore'
import { useUserStore } from 'src/stores/userStore'
import { useAuthStore } from 'src/stores/authStore'
import { useJobSeekerUiStore } from 'src/stores/jobSeekerUiStore'
import { capitalizeProseWords } from 'src/utils/textFormat'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const jobStore = useJobStore()
const { search: jobSearch } = storeToRefs(jobStore)

const userStore = useUserStore()
const authStore = useAuthStore()
const jobSeekerUi = useJobSeekerUiStore()

const drawerOpen = ref(false)

const compact = computed(() => $q.screen.lt.md)

const navItems = [
  { label: 'Home', to: '/home', icon: 'home' },
  { label: 'My Circle', to: '/circle', icon: 'groups' },
  { label: 'Notifications', to: '/notifications', icon: 'notifications' },
  { label: 'Messages', to: '/messages', icon: 'chat_bubble_outline' },
  { label: 'Upgrade', to: '/jobseeker/upgrade', icon: 'workspace_premium' },
]

const displayName = computed(() => capitalizeProseWords(userStore.name || 'Spire User'))

const photoUrl = computed(() => userStore.profile?.profilePhotoUrl || '')

const userInitial = computed(() => {
  const n = (userStore.name || 'S').trim()
  return (n.charAt(0) || 'S').toUpperCase()
})

const showBack = computed(() => route.meta?.jobSeekerNavBack === true)

function navActive(to) {
  const p = route.path
  if (to === '/home') {
    return (
      p === '/home' ||
      p.startsWith('/home/') ||
      p === '/jobseeker/dashboard'
    )
  }
  if (to === '/jobseeker/upgrade') {
    return p.startsWith('/jobseeker/upgrade')
  }
  return p === to || p.startsWith(`${to}/`)
}

function onNavSearchFocus() {
  const p = route.path
  if (
    p === '/home' ||
    p.startsWith('/home/') ||
    p === '/jobseeker/dashboard'
  ) {
    jobSeekerUi.requestOpenHomeFilters()
  }
}

function goNav(to) {
  drawerOpen.value = false
  router.push(to)
}

function goBack() {
  const fallback = typeof route.meta?.jobSeekerBackFallback === 'string'
    ? route.meta.jobSeekerBackFallback
    : '/home'
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push(fallback)
  }
}

async function handleLogout() {
  try {
    await authStore.logout()
    await router.replace('/login')
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  const uid = authStore.user?.uid
  if (uid && !userStore.profile) {
    await userStore.fetchProfile(uid)
  }
})
</script>

<style scoped>
.jsk-nav {
  background: #3d0b52 !important;
  box-shadow: 0 4px 18px rgba(28, 6, 38, 0.35);
  min-height: var(--jsk-nav-height, 70px);
}

.jsk-nav__inner {
  width: 100%;
  max-width: 100%;
  padding: 0 var(--spire-layout-gutter);
  margin: 0 auto;
  box-sizing: border-box;
}

.jsk-nav__row--desktop {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  min-height: var(--jsk-nav-height, 70px);
  gap: 8px 16px;
}

.jsk-nav__segment--left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  justify-self: start;
}

.jsk-nav__segment--center {
  justify-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.jsk-nav__segment--center::-webkit-scrollbar {
  display: none;
}

@media (max-width: 1280px) {
  .jsk-nav__nav-item {
    padding: 6px 8px;
    min-width: 48px;
  }

  .jsk-nav__nav-label {
    font-size: 10px;
  }
}

.jsk-nav__segment--right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 0;
  justify-self: end;
}

.jsk-nav__row--mobile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: calc(var(--jsk-nav-height, 70px) - 8px);
  gap: 10px;
}

.jsk-nav__mobile-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.jsk-nav__logo-link {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  line-height: 0;
}

.jsk-nav__logo-img {
  height: 28px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
  display: block;
}

@media (min-width: 768px) {
  .jsk-nav__logo-img {
    height: 32px;
    max-width: 140px;
  }
}

.jsk-nav__search-wrap {
  flex: 0 1 320px;
  min-width: 180px;
  max-width: 320px;
}

.jsk-nav__search :deep(.q-field__control) {
  background: #ffffff;
  border-radius: 999px;
  min-height: 38px;
  height: 38px;
  box-shadow: none;
}

.jsk-nav__search :deep(.q-field__native) {
  font-size: 14px;
  color: #1a1a1a;
  padding-top: 0;
  padding-bottom: 0;
}

.jsk-nav__search :deep(.q-placeholder),
.jsk-nav__search :deep(input::placeholder) {
  color: #9ca3af;
}

.jsk-nav__search--full {
  width: 100%;
}

.jsk-nav__search-ic {
  color: #6b7280;
}

.jsk-nav__search-clear {
  color: #6b7280 !important;
}

.jsk-nav__nav-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
  min-width: 56px;
}

.jsk-nav__nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.jsk-nav__nav-item--active {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.jsk-nav__nav-label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
}

.jsk-nav__nav-ic {
  opacity: 0.95;
}

.jsk-nav__profile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  min-width: 0;
  padding: 4px 6px;
  border-radius: 12px;
  transition: background-color 0.2s ease;
}

.jsk-nav__profile-link:hover {
  background: rgba(255, 255, 255, 0.08);
}

.jsk-nav__avatar {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-weight: 700;
  flex-shrink: 0;
}

.jsk-nav__user-name {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

@media (max-width: 1100px) {
  .jsk-nav__user-name {
    max-width: 88px;
  }
}

.jsk-nav__user-name--mobile {
  max-width: 120px;
  font-size: 12px;
}

.jsk-nav__icon-btn {
  color: #ffffff !important;
}

.jsk-nav__row--search {
  padding-bottom: 12px;
}


.jsk-drawer-item--active {
  color: #3d0b52;
  font-weight: 700;
}
</style>
