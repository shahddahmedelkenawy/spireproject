<template>
  <q-header elevated class="web-top-nav">
    <q-toolbar class="web-top-nav__toolbar">
      <router-link to="/" class="web-top-nav__brand">
        <SpireDiamondIcon class="web-top-nav__logo" />
        <span class="web-top-nav__brand-text">SPIRE</span>
      </router-link>

      <q-space />

      <nav class="web-top-nav__links" aria-label="Primary navigation">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="web-top-nav__link"
          :class="{ 'web-top-nav__link--active': isActive(item.to) }"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useRoute } from 'vue-router'
import SpireDiamondIcon from 'src/components/SpireDiamondIcon.vue'

defineProps({
  navItems: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()

const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<style scoped>
.web-top-nav {
  background: #fff;
  color: #2e2e2e;
  border-bottom: 1px solid #ece9f0;
}

.web-top-nav__toolbar {
  width: min(1200px, 100%);
  margin: 0 auto;
  min-height: 72px;
  padding: 0 24px;
}

.web-top-nav__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
}

.web-top-nav__logo {
  font-size: 28px;
}

.web-top-nav__brand-text {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #4b1e5a;
}

.web-top-nav__links {
  display: inline-flex;
  gap: 16px;
  align-items: center;
}

.web-top-nav__link {
  color: #4f4f5a;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.web-top-nav__link:hover {
  background: #f4f0f7;
  color: #4b1e5a;
}

.web-top-nav__link--active {
  background: #ede4f3;
  color: #4b1e5a;
}
</style>
