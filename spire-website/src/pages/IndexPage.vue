<template>
  <q-layout class="landing-layout" view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header class="landing-header">
      <q-toolbar class="landing-toolbar">
        <div class="landing-toolbar__logo">
          <img :src="logoImage" alt="SPIRE" class="landing-logo__img" />
        </div>

        <nav class="landing-nav" aria-label="Main navigation">
          <a href="#" class="landing-nav__link">Our Featured Companies</a>
          <a href="#" class="landing-nav__link">Our Featured Jobs</a>
          <a href="#" class="landing-nav__link">About Us</a>
          <a href="#" class="landing-nav__link">Contact Us</a>
        </nav>

        <div class="landing-actions">
          <q-btn
            no-caps
            unelevated
            class="landing-btn landing-btn--outline"
            label="Sign up"
            @click="goSignUp"
          />
          <q-btn
            no-caps
            unelevated
            class="landing-btn landing-btn--filled"
            label="Login"
            @click="goLogin"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- PAGE -->
    <q-page-container class="landing-page-container">

      <!-- HERO SECTION -->
      <main class="hero">
        <div class="hero__illustration">
          <img :src="heroIllustration" alt="Woman holding phone" class="hero__illustration-img" />
        </div>

        <div class="hero__content">
          <div class="hero__headline-wrap">
            <img :src="headlineImage" alt="SEE ABILITY NOT DISABILITY" class="hero__headline-img" />
          </div>

          <div class="hero__cta">
            <q-btn
              no-caps
              unelevated
              class="hero__cta-btn"
              label="Join as a Job Seeker →"
              @click="goSignUpAs('seeker')"
            />
            <q-btn
              no-caps
              unelevated
              class="hero__cta-btn"
              label="Join as an Employer →"
              @click="goSignUpAs('employer')"
            />
          </div>
        </div>
      </main>

      <!-- STATS SECTION -->
      <section class="stats-section">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-number">3 +</div>
            <div class="stat-label">Years</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">50,000+</div>
            <div class="stat-label">Users</div>
          </div>

          <div class="stat-card">
            <div class="stat-number">10,000+</div>
            <div class="stat-label">Companies</div>
          </div>
        </div>
      </section>

    </q-page-container>

  </q-layout>
</template>

<script setup>
import logoImage from 'src/assets/logo.png'
import heroIllustration from 'src/assets/Group.png'
import headlineImage from 'src/assets/see ability.png'
import { useRouter } from 'vue-router'

const router = useRouter()

function goSignUp() {
  router.push('/signup')
}

function goLogin() {
  router.push('/login')
}

function goSignUpAs(role) {
  router.push({ path: '/signup', query: { role } })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.landing-layout {
  min-height: 100vh;
  background: #ffffff;
  overflow-x: hidden;
}

.landing-header {
  position: relative !important;
  background: #ffffff;
  box-shadow: none;
  border-bottom: none;
}

.landing-toolbar {
  max-width: 1440px;
  margin: 0 auto;
  padding: 28px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  gap: 24px;
}

.landing-toolbar__logo {
  flex-shrink: 0;
}

.landing-logo__img {
  display: block;
  height: 32px;
  width: auto;
  max-width: 120px;
  object-fit: contain;
  object-position: left center;
}

.landing-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex: 1;
  margin: 0 24px;
}

.landing-nav__link {
  font-size: 15px;
  font-weight: 700;
  color: #2a2a2a;
  text-decoration: none;
  position: relative;
  white-space: nowrap;
}

.landing-nav__link:hover {
  color: #4b1f4f;
}

.landing-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.landing-btn {
  min-width: 96px;
  height: 42px;
  padding: 0 24px;
  border-radius: 21px;
}

.landing-btn--outline,
.landing-btn--filled {
  background: #4b1f4f !important;
  color: #ffffff;
  border: 1.5px solid #4b1f4f;
}

.landing-page-container {
  padding: 0;
}

/* HERO */
.hero {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 48px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56px;
  min-height: 100vh; 
  box-sizing: border-box;
}

.hero__illustration {
  flex: 0 0 45%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: 68px;
}

.hero__illustration-img {
  height: 100%;
  max-height: 520px;
  width: auto;
  object-fit: contain;
  margin-top: -72px;
}

.hero__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero__headline-wrap {
  max-width: 620px;
  margin-top: -40px;
}

.hero__headline-img {
  width: 100%;
}

.hero__cta {
  display: flex;
  gap: 20px;
  margin-top: 28px;
}

.hero__cta-btn {
  min-width: 240px;
  height: 56px;
  border-radius: 28px;
  background: #4b1f4f !important;
  color: #ffffff;
}

/* STATS SECTION */
.stats-section {
  background-color: #3b154f;
  padding: 80px 60px;

}

.stats-container {
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.stat-card {
  flex: 1;
  height: 320px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.stat-number {
  font-size: 48px;
  color: rgba(255, 255, 255, 0.35);
}

.stat-label {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.35);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .hero {
    flex-direction: column;
  }

  .stats-container {
    flex-direction: column;
  }
}
</style>
