<template>
  <q-header class="public-brand-nav" elevated>
    <q-toolbar class="public-brand-nav__toolbar">
      <q-btn
        v-if="compact"
        flat
        round
        dense
        icon="menu"
        class="public-brand-nav__menu-btn"
        aria-label="Open menu"
      >
        <q-menu
          anchor="bottom left"
          self="top left"
          class="public-brand-nav__menu"
        >
          <q-list dense style="min-width: 240px">
            <q-item
              v-for="item in navItems"
              :key="item.to"
              clickable
              v-close-popup
              v-ripple
              :active="isActive(item)"
              active-class="public-brand-nav__menu-item--active"
              @click="router.push(item.to)"
            >
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup v-ripple @click="router.push('/login')">
              <q-item-section>Login</q-item-section>
            </q-item>
            <q-item clickable v-close-popup v-ripple @click="router.push('/signup')">
              <q-item-section class="text-weight-bold">Sign up</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <router-link to="/" class="public-brand-nav__logo-link">
        <img :src="logoWhiteSrc" alt="SPIRE" class="public-brand-nav__logo-img" width="140" height="32">
      </router-link>

      <nav v-if="!compact" class="public-brand-nav__links" aria-label="Primary">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="public-brand-nav__link"
          :class="{ 'public-brand-nav__link--active': isActive(item) }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <q-space />

      <div v-if="!compact" class="public-brand-nav__actions">
        <q-btn
          no-caps
          flat
          class="public-brand-nav__ghost-btn"
          label="Login"
          :to="{ path: '/login' }"
        />
        <q-btn
          no-caps
          unelevated
          class="public-brand-nav__cta-btn"
          label="Sign up"
          :to="{ path: '/signup' }"
        />
      </div>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import logoWhiteSrc from 'src/assets/logo white.png'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const compact = computed(() => $q.screen.lt.lg)

const navItems = [
  { label: 'Home', to: '/', match: 'exact' },
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

function isActive(item) {
  if (item.match === 'exact') {
    return route.path === item.to || route.path === `${item.to}/`
  }
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}
</script>

<style scoped>
.public-brand-nav {
  background: #3d0b52 !important;
  box-shadow: 0 4px 18px rgba(28, 6, 38, 0.35);
}

.public-brand-nav__toolbar {
  width: 100%;
  max-width: min(1200px, 100%);
  margin: 0 auto;
  min-height: var(--jsk-nav-height, 70px);
  padding: 0 var(--spire-layout-gutter);
  box-sizing: border-box;
  gap: 12px;
}

.public-brand-nav__menu-btn {
  color: rgba(255, 255, 255, 0.92);
}

.public-brand-nav__logo-link {
  display: inline-flex;
  align-items: center;
  line-height: 0;
  text-decoration: none;
}

.public-brand-nav__logo-img {
  height: 30px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  display: block;
}

.public-brand-nav__links {
  display: none;
  align-items: center;
  gap: clamp(12px, 2vw, 28px);
  margin-left: clamp(8px, 2vw, 20px);
  flex: 1 1 auto;
  min-width: 0;
  justify-content: center;
}

@media (min-width: 1024px) {
  .public-brand-nav__links {
    display: flex;
  }
}

.public-brand-nav__link {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  white-space: nowrap;
}

.public-brand-nav__link:hover,
.public-brand-nav__link:focus-visible {
  color: #ffffff;
}

.public-brand-nav__link--active {
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.public-brand-nav__actions {
  display: none;
  align-items: center;
  gap: 8px;
}

@media (min-width: 1024px) {
  .public-brand-nav__actions {
    display: flex;
  }
}

.public-brand-nav__ghost-btn {
  color: rgba(255, 255, 255, 0.92) !important;
}

.public-brand-nav__cta-btn {
  min-width: 104px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.public-brand-nav__cta-btn:hover {
  background: rgba(255, 255, 255, 0.22) !important;
}

.public-brand-nav__menu-item--active {
  color: var(--q-primary);
  font-weight: 700;
}
</style>
