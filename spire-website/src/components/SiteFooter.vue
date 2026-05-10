<template>
  <footer class="site-footer" role="contentinfo">
    <div class="site-footer__inner">
      <div class="site-footer__brand">
        <router-link to="/" class="site-footer__logo-link">
          <img :src="logoWhiteSrc" alt="SPIRE" class="site-footer__logo-img" width="120" height="32" loading="lazy">
        </router-link>
        <p class="site-footer__tagline">
          Accessible hiring that focuses on ability—connecting employers and job seekers with clarity and respect.
        </p>
      </div>

      <nav class="site-footer__col" aria-labelledby="footer-explore-heading">
        <h2 id="footer-explore-heading" class="site-footer__heading">
          Explore
        </h2>
        <ul class="site-footer__list">
          <li><router-link class="site-footer__link" to="/jobs">Jobs</router-link></li>
          <li><router-link class="site-footer__link" to="/companies">Companies</router-link></li>
          <li><router-link class="site-footer__link" to="/jobseeker/browse-jobs">Job seeker hub</router-link></li>
        </ul>
      </nav>

      <nav class="site-footer__col" aria-labelledby="footer-company-heading">
        <h2 id="footer-company-heading" class="site-footer__heading">
          Company
        </h2>
        <ul class="site-footer__list">
          <li><router-link class="site-footer__link" to="/about">About</router-link></li>
          <li><router-link class="site-footer__link" to="/contact">Contact</router-link></li>
        </ul>
      </nav>

      <nav class="site-footer__col" aria-labelledby="footer-legal-heading">
        <h2 id="footer-legal-heading" class="site-footer__heading">
          Legal
        </h2>
        <ul class="site-footer__list">
          <li><router-link class="site-footer__link" to="/legal/privacy">Privacy Policy</router-link></li>
          <li><router-link class="site-footer__link" to="/legal/terms">Terms of Service</router-link></li>
        </ul>
      </nav>
    </div>

    <div class="site-footer__bottom">
      <p class="site-footer__copy">
        © {{ year }} SPIRE. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import logoWhiteSrc from 'src/assets/logo white.png'

const year = computed(() => new Date().getFullYear())
</script>

<style scoped>
.site-footer {
  width: 100%;
  background: #2a0739;
  color: rgba(255, 255, 255, 0.88);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.site-footer__inner {
  width: 100%;
  max-width: min(1200px, 100%);
  margin: 0 auto;
  padding: clamp(32px, 5vw, 48px) var(--spire-layout-gutter);
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 1fr));
  gap: clamp(24px, 4vw, 40px);
  align-items: start;
}

.site-footer__brand {
  min-width: 0;
}

.site-footer__logo-link {
  display: inline-flex;
  line-height: 0;
  text-decoration: none;
}

.site-footer__logo-img {
  height: 28px;
  width: auto;
  max-width: 140px;
  object-fit: contain;
  display: block;
}

.site-footer__tagline {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);
  max-width: 42ch;
}

.site-footer__heading {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.92);
}

.site-footer__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.site-footer__link {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.site-footer__link:hover,
.site-footer__link:focus-visible {
  color: #ffffff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.site-footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px var(--spire-layout-gutter) 20px;
}

.site-footer__copy {
  margin: 0;
  max-width: min(1200px, 100%);
  margin-inline: auto;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

@media (max-width: 900px) {
  .site-footer__inner {
    grid-template-columns: 1fr 1fr;
  }

  .site-footer__brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 520px) {
  .site-footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
