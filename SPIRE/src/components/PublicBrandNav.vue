<template>
  <q-header class="public-brand-nav" elevated>
    <q-toolbar class="public-brand-nav__toolbar">
      <router-link to="/" class="public-brand-nav__logo-link">
        <img :src="logoWhiteSrc" alt="SPIRE" class="public-brand-nav__logo-img">
      </router-link>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import logoWhiteSrc from 'src/assets/logo white.png'
</script>

<style scoped>
.public-brand-nav {
  background: #3d0b52 !important;
  box-shadow: 0 4px 18px rgba(28, 6, 38, 0.35);
}

.public-brand-nav__toolbar {
  width: 100%;
  max-width: 100%;
  min-height: var(--jsk-nav-height, 70px);
  padding: 0 var(--spire-layout-gutter);
  box-sizing: border-box;
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

@media (min-width: 768px) {
  .public-brand-nav__logo-img {
    height: 32px;
    max-width: 160px;
  }
}
</style>
