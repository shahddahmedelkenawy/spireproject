<template>
  <q-page class="landing-page">
    <main class="hero">
      <div class="hero__illustration">
        <img :src="heroIllustration" alt="" class="hero__illustration-img" loading="eager">
      </div>

      <div class="hero__content">
        <div class="hero__headline-wrap">
          <img :src="headlineImage" alt="SEE ABILITY NOT DISABILITY" class="hero__headline-img" loading="eager">
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

    <section class="stats-section" aria-labelledby="spire-stats-heading">
      <h2 id="spire-stats-heading" class="sr-only">
        SPIRE at a glance
      </h2>
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-number">
            3 +
          </div>
          <div class="stat-label">
            Years
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-number">
            50,000+
          </div>
          <div class="stat-label">
            Users
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-number">
            10,000+
          </div>
          <div class="stat-label">
            Companies
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import heroIllustration from 'src/assets/Group.png'
import headlineImage from 'src/assets/see ability.png'
import { useRouter } from 'vue-router'

const router = useRouter()

function goSignUpAs(role) {
  router.push({ path: '/signup', query: { role } })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');

.landing-page {
  background: #ffffff;
  overflow-x: hidden;
}

.hero {
  width: 100%;
  max-width: min(1200px, 100%);
  margin: 0 auto;
  padding: 16px var(--spire-layout-gutter) 24px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56px;
  min-height: calc(100dvh - var(--jsk-nav-height, 70px));
}

.hero__illustration {
  flex: 0 0 45%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding-left: clamp(0px, 4vw, 68px);
}

.hero__illustration-img {
  height: 100%;
  max-height: 520px;
  width: auto;
  object-fit: contain;
  margin-top: clamp(-48px, -6vw, -72px);
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
  margin-top: clamp(-24px, -4vw, -40px);
}

.hero__headline-img {
  width: 100%;
}

.hero__cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-top: 28px;
}

.hero__cta-btn {
  min-width: min(240px, 100%);
  height: 56px;
  border-radius: 28px;
  background: #4b1f4f !important;
  color: #ffffff;
}

.stats-section {
  background-color: #3b154f;
  padding: clamp(48px, 8vw, 80px) var(--spire-layout-gutter);
  box-sizing: border-box;
}

.stats-container {
  width: 100%;
  max-width: min(1200px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 40px;
}

.stat-card {
  flex: 1;
  min-height: 220px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.stat-number {
  font-size: clamp(32px, 5vw, 48px);
  color: rgba(255, 255, 255, 0.35);
}

.stat-label {
  font-size: clamp(20px, 3vw, 28px);
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 1024px) {
  .hero {
    flex-direction: column;
    min-height: min-content;
    padding-bottom: 48px;
  }

  .stats-container {
    flex-direction: column;
  }
}
</style>
