<template>
  <footer class="web-footer">
    <div class="web-footer__container">
      <div class="web-footer__brand">
        <SpireDiamondIcon class="web-footer__logo" />
        <div>
          <h2 class="web-footer__title">SPIRE</h2>
          <p class="web-footer__subtitle">Inclusive hiring platform for everyone.</p>
        </div>
      </div>

      <nav class="web-footer__links" aria-label="Footer links">
        <router-link to="/home" class="web-footer__link">About</router-link>
        <router-link to="/messages" class="web-footer__link">Contact</router-link>
        <router-link to="/login" class="web-footer__link">Privacy Policy</router-link>
        <router-link to="/signup" class="web-footer__link">Terms</router-link>
      </nav>
    </div>
  </footer>
</template>

<script setup>
import SpireDiamondIcon from 'src/components/SpireDiamondIcon.vue'
</script>

<style scoped>
.web-footer {
  border-top: 1px solid #ece9f0;
  background: #fbf9fd;
  padding: 28px 20px;
  margin-top: 24px;
}

.web-footer__container {
  width: min(1200px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.web-footer__brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.web-footer__logo {
  font-size: 26px;
}

.web-footer__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: #4b1e5a;
}

.web-footer__subtitle {
  margin: 2px 0 0;
  color: #676777;
  font-size: 13px;
}

.web-footer__links {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 18px;
}

.web-footer__link {
  color: #4f4f5a;
  text-decoration: none;
  font-weight: 500;
}

.web-footer__link:hover {
  color: #4b1e5a;
  text-decoration: underline;
}
</style>
