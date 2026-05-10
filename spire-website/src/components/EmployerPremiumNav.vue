<template>
  <q-drawer
    v-model="drawerOpen"
    show-if-above
    :breakpoint="1024"
    bordered
    class="employer-drawer"
    :width="drawerWidth"
  >
    <div class="employer-drawer__scroll">
      <router-link to="/employer/dashboard" class="employer-drawer__brand">
        <img :src="logoDarkSrc" alt="SPIRE" class="employer-drawer__logo-img">
      </router-link>

      <div class="employer-drawer__search-wrap">
        <q-input
          :model-value="dashboardApplicantSearch"
          dense
          outlined
          rounded
          hide-bottom-space
          class="employer-nav-search"
          placeholder="Search applicants by name, role, job, or location"
          @update:model-value="employerUi.setDashboardApplicantSearch"
          @focus="onSidebarSearchFocus"
        >
          <template #prepend>
            <q-icon name="search" size="22px" class="employer-nav-search__ic" />
          </template>
          <template v-if="dashboardApplicantSearch" #append>
            <q-btn
              round
              dense
              flat
              icon="close"
              class="employer-nav-search__clear"
              tabindex="-1"
              @click.stop="employerUi.setDashboardApplicantSearch('')"
            />
          </template>
        </q-input>
      </div>

      <nav class="employer-drawer__nav" aria-label="Employer primary">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="employer-drawer__link"
          active-class="employer-drawer__link--active"
          @click="onNavClick"
        >
          <q-icon :name="item.icon" size="22px" class="employer-drawer__link-ic" />
          <span class="employer-drawer__link-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="employer-drawer__footer">
        <q-btn
          unelevated
          no-caps
          class="employer-drawer__upgrade"
          icon="workspace_premium"
          label="Upgrade"
          aria-label="Upgrade subscription"
          @click="goUpgrade"
        />
        <button
          type="button"
          class="employer-drawer__footer-row"
          @click="goSettings"
        >
          <q-icon name="settings" size="20px" />
          <span>Settings</span>
        </button>
        <button type="button" class="employer-drawer__footer-row employer-drawer__footer-row--danger" @click="handleLogout">
          <q-icon name="logout" size="20px" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  </q-drawer>

  <q-header v-if="compact" class="jsk-nav jsk-nav--employer-mobile" elevated>
    <div class="jsk-nav__inner">
      <div class="jsk-nav__row jsk-nav__row--mobile-top">
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
          <q-btn
            flat
            round
            dense
            icon="workspace_premium"
            class="jsk-nav__icon-btn"
            aria-label="Upgrade subscription"
            @click="goUpgrade"
          />

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

      <div class="jsk-nav__row jsk-nav__row--search">
        <q-input
          :model-value="dashboardApplicantSearch"
          dense
          outlined
          rounded
          hide-bottom-space
          class="employer-nav-search employer-nav-search--full"
          placeholder="Search applicants by name, role, job, or location"
          @update:model-value="employerUi.setDashboardApplicantSearch"
          @focus="onSidebarSearchFocus"
        >
          <template #prepend>
            <q-icon name="search" size="22px" class="employer-nav-search__ic" />
          </template>
          <template v-if="dashboardApplicantSearch" #append>
            <q-btn
              round
              dense
              flat
              icon="close"
              class="employer-nav-search__clear"
              tabindex="-1"
              @click.stop="employerUi.setDashboardApplicantSearch('')"
            />
          </template>
        </q-input>
      </div>
    </div>
  </q-header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import logoWhiteSrc from 'src/assets/logo white.png'
import logoDarkSrc from 'src/assets/logo.png'
import { useUserStore } from 'src/stores/userStore'
import { useAuthStore } from 'src/stores/authStore'
import { useEmployerUiStore } from 'src/stores/employerUiStore'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const userStore = useUserStore()
const authStore = useAuthStore()
const employerUi = useEmployerUiStore()
const { dashboardApplicantSearch } = storeToRefs(employerUi)

const drawerOpen = ref(false)

const compact = computed(() => $q.screen.lt.md)

/** Wide rail: scales with viewport so the sidebar and its inner content feel full-width on large screens. */
const drawerWidth = computed(() => {
  const w = $q.screen.width
  if (!w) return 360
  return Math.min(440, Math.max(300, Math.round(w * 0.28)))
})

const navItems = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: 'dashboard' },
  { label: 'Applicants', to: '/employer/applicants', icon: 'groups' },
  { label: 'Post Job', to: '/employer/post-job', icon: 'add_circle_outline' },
  { label: 'Messages', to: '/employer/messages', icon: 'chat_bubble_outline' },
  { label: 'Profile', to: '/employer/profile', icon: 'person_outline' },
]

const showBack = computed(
  () => route.meta?.jobSeekerNavBack === true || route.meta?.navShowBack === true
)

watch(compact, (isCompact) => {
  if (!isCompact) drawerOpen.value = true
})

function onNavClick() {
  if ($q.screen.lt.md) {
    drawerOpen.value = false
  }
}

function goUpgrade() {
  if ($q.screen.lt.md) drawerOpen.value = false
  router.push({ path: '/payment/checkout', query: { type: 'employer' } })
}

function goSettings() {
  if ($q.screen.lt.md) drawerOpen.value = false
  router.push('/employer/profile')
}

function onSidebarSearchFocus() {
  const p = route.path
  if (p === '/employer/dashboard' || p === '/employer' || p === '/employer/') {
    employerUi.requestOpenDashboardFilters()
  }
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
  if (!$q.screen.lt.md) {
    drawerOpen.value = true
  }
})
</script>

<style scoped>
.employer-drawer {
  background: #eef1f5 !important;
  width: 100%;
  max-width: none;
}

.employer-drawer__scroll {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  max-width: none;
  padding: 20px 14px 24px;
  box-sizing: border-box;
}

@media (min-width: 1024px) {
  .employer-drawer__scroll {
    padding-left: 20px;
    padding-right: 20px;
  }
}

.employer-drawer__brand {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  text-decoration: none;
  line-height: 0;
}

.employer-drawer__logo-img {
  height: 36px;
  width: auto;
  max-width: 148px;
  object-fit: contain;
}

.employer-drawer__search-wrap {
  margin-bottom: 18px;
}

/* Match JobSeekerNavBar pill search (white field, gray outline) */
.employer-nav-search {
  width: 100%;
}

.employer-nav-search :deep(.q-field) {
  width: 100%;
  border-radius: 9999px;
  overflow: hidden;
}

.employer-nav-search :deep(.q-field__control) {
  background: #ffffff;
  border-radius: 9999px !important;
  min-height: 46px;
  height: 46px;
  box-shadow: 0 1px 4px rgba(15, 15, 30, 0.07);
}

.employer-nav-search :deep(.q-field__native) {
  font-size: 15px;
  color: #1a1a1a;
  padding-top: 0;
  padding-bottom: 0;
  line-height: 1.35;
}

.employer-nav-search :deep(.q-field__outline) {
  border-radius: 9999px !important;
  color: rgba(61, 11, 82, 0.14);
}

.employer-nav-search :deep(.q-field__marginal) {
  height: 46px;
}

.employer-nav-search :deep(.q-placeholder),
.employer-nav-search :deep(input::placeholder) {
  color: #9ca3af;
}

.employer-nav-search--full {
  width: 100%;
}

.employer-nav-search__ic {
  color: #6b7280;
}

.employer-nav-search__clear {
  color: #6b7280 !important;
}

.employer-drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1 1 auto;
}

.employer-drawer__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  text-decoration: none;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.employer-drawer__link:hover {
  background: rgba(61, 11, 82, 0.06);
  color: #3d0b52;
}

.employer-drawer__link--active {
  background: #3d0b52;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(61, 11, 82, 0.28);
}

.employer-drawer__link--active .employer-drawer__link-ic {
  color: #ffffff;
}

.employer-drawer__footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(61, 11, 82, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.employer-drawer__upgrade {
  width: 100%;
  background: #3d0b52 !important;
  color: #ffffff !important;
  border-radius: 12px;
  font-weight: 600;
  min-height: 42px;
  padding: 10px 14px;
  box-shadow: 0 4px 14px rgba(61, 11, 82, 0.25);
}

.employer-drawer__upgrade :deep(.q-icon) {
  color: #ffffff;
}

.employer-drawer__footer-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
}

.employer-drawer__footer-row:hover {
  background: rgba(61, 11, 82, 0.06);
}

.employer-drawer__footer-row--danger {
  color: #c62828;
}

.employer-drawer__footer-row--danger:hover {
  background: rgba(198, 40, 40, 0.08);
}

.jsk-nav--employer-mobile {
  background: #3d0b52 !important;
  box-shadow: 0 6px 22px rgba(28, 6, 38, 0.38);
  min-height: auto;
}

.jsk-nav__inner {
  width: 100%;
  max-width: none;
  padding: 0 clamp(12px, 4vw, 24px);
  margin: 0 auto;
  box-sizing: border-box;
}

.jsk-nav__row--mobile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: calc(var(--jsk-nav-height, 70px) - 12px);
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

.jsk-nav__segment--right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.jsk-nav__icon-btn {
  color: #ffffff !important;
}

.jsk-nav__row--search {
  padding-bottom: 14px;
}
</style>
