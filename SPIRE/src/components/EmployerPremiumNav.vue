<template>
  <q-header class="jsk-nav jsk-nav--employer" elevated>
    <div class="jsk-nav__inner">
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

          <router-link to="/employer/dashboard" class="jsk-nav__logo-link">
            <img :src="logoWhiteSrc" alt="SPIRE" class="jsk-nav__logo-img">
          </router-link>

          <!-- Visual spacer keeps alignment with job seeker nav (no global employer search API) -->
          <div class="jsk-nav__search-spacer" aria-hidden="true" />
        </div>

        <nav class="jsk-nav__segment jsk-nav__segment--center" aria-label="Employer primary">
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
          <router-link to="/employer/profile" class="jsk-nav__profile-link">
            <q-avatar size="36px" class="jsk-nav__avatar">
              <img v-if="photoUrl" :src="photoUrl" alt="">
              <span v-else>{{ userInitial }}</span>
            </q-avatar>
            <span class="jsk-nav__user-name">{{ displayName }}</span>
          </router-link>

          <q-btn flat round dense icon="more_vert" class="jsk-nav__icon-btn" aria-label="Menu">
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
                  <q-item-section class="text-negative">
                    Logout
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

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

          <router-link to="/employer/dashboard" class="jsk-nav__logo-link">
            <img :src="logoWhiteSrc" alt="SPIRE" class="jsk-nav__logo-img">
          </router-link>
        </div>

        <div class="jsk-nav__segment jsk-nav__segment--right">
          <router-link to="/employer/profile" class="jsk-nav__profile-link">
            <q-avatar size="34px" class="jsk-nav__avatar">
              <img v-if="photoUrl" :src="photoUrl" alt="">
              <span v-else>{{ userInitial }}</span>
            </q-avatar>
            <span class="jsk-nav__user-name jsk-nav__user-name--mobile">{{ displayName }}</span>
          </router-link>

          <q-btn flat round dense icon="more_vert" class="jsk-nav__icon-btn" aria-label="Menu">
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
                  <q-item-section class="text-negative">
                    Logout
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import logoWhiteSrc from 'src/assets/logo white.png'
import { useUserStore } from 'src/stores/userStore'
import { useAuthStore } from 'src/stores/authStore'
import { capitalizeProseWords } from 'src/utils/textFormat'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const userStore = useUserStore()
const authStore = useAuthStore()

const drawerOpen = ref(false)

const compact = computed(() => $q.screen.lt.md)

const navItems = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: 'dashboard' },
  { label: 'Applicants', to: '/employer/applicants', icon: 'groups' },
  { label: 'Post Job', to: '/employer/post-job', icon: 'add_circle_outline' },
  { label: 'Messages', to: '/employer/messages', icon: 'chat_bubble_outline' },
  { label: 'Profile', to: '/employer/profile', icon: 'person_outline' },
]

const displayName = computed(() => capitalizeProseWords(userStore.name || 'Employer'))

const photoUrl = computed(() => userStore.profile?.profilePhotoUrl || '')

const userInitial = computed(() => {
  const n = (userStore.name || 'E').trim()
  return (n.charAt(0) || 'E').toUpperCase()
})

const showBack = computed(
  () => route.meta?.jobSeekerNavBack === true || route.meta?.navShowBack === true
)

function navActive(to) {
  const p = route.path
  if (to === '/employer/dashboard') {
    return p === '/employer' || p === '/employer/dashboard'
  }
  if (to === '/employer/post-job') {
    return p.startsWith('/employer/post-job')
  }
  return p === to || p.startsWith(`${to}/`)
}

function goNav(to) {
  drawerOpen.value = false
  router.push(to)
}

function goBack() {
  const fallback =
    typeof route.meta?.jobSeekerBackFallback === 'string'
      ? route.meta.jobSeekerBackFallback
      : '/employer/dashboard'
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

.jsk-nav__search-spacer {
  flex: 0 1 320px;
  min-width: 120px;
  max-width: 320px;
  height: 38px;
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

.jsk-drawer-item--active {
  color: #3d0b52;
  font-weight: 700;
}
</style>
