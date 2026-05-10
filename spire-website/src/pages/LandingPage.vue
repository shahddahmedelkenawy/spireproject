<template>
  <q-page class="landing-page">
    <!-- 1 — Hero (reference: 1 landing page.jfif) -->
    <section class="lp-hero" aria-labelledby="lp-hero-heading">
      <div class="lp-hero__inner">
        <div class="lp-hero__grid">
          <div class="lp-hero__illustration">
            <img
              :src="heroIllustration"
              alt=""
              class="lp-hero__illustration-img"
              loading="eager"
            >
          </div>

          <div class="lp-hero__content">
            <h1 id="lp-hero-heading" class="sr-only">
              SPIRE — see ability, not disability
            </h1>
            <div class="lp-hero__headline-wrap">
              <img
                :src="headlineImage"
                alt="SEE ABILITY NOT DISABILITY"
                class="lp-hero__headline-img"
                loading="eager"
              >
            </div>

            <div class="lp-hero__cta">
              <q-btn
                no-caps
                unelevated
                class="lp-btn lp-btn--primary"
                label="Join as a Job Seeker →"
                @click="goSignUpAs('seeker')"
              />
              <q-btn
                no-caps
                unelevated
                class="lp-btn lp-btn--primary"
                label="Join as an Employer →"
                @click="goSignUpAs('employer')"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2 — Stats (reference: 2 landing page.jpeg) -->
    <section class="lp-stats" aria-labelledby="lp-stats-heading">
      <h2 id="lp-stats-heading" class="sr-only">
        SPIRE at a glance
      </h2>
      <div class="lp-stats__container">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="lp-stats__card"
        >
          <div class="lp-stats__number">
            {{ stat.number }}
          </div>
          <div class="lp-stats__label">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </section>

    <!-- 3 — Featured companies (reference: 3 landing page.jpeg) -->
    <section class="lp-companies" aria-labelledby="lp-companies-heading">
      <div class="lp-section-inner">
        <h2 id="lp-companies-heading" class="lp-section-title">
          Our Featured Companies
        </h2>
        <div class="lp-companies__row">
          <button
            v-for="company in featuredCompanies"
            :key="company.slug"
            type="button"
            class="lp-companies__item"
            @click="goFeaturedCompany(company)"
          >
            <span
              class="lp-companies__mark"
              :style="{ background: company.color }"
              aria-hidden="true"
            >
              <span class="lp-companies__mark-text">{{ company.mark }}</span>
            </span>
            <span class="lp-companies__name">{{ company.name }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 4 — Featured jobs (reference: 4 landing page.jfif) -->
    <section class="lp-jobs" aria-labelledby="lp-jobs-heading">
      <div class="lp-section-inner lp-section-inner--jobs">
        <h2 id="lp-jobs-heading" class="lp-section-title">
          Our Featured Jobs
        </h2>

        <ul class="lp-jobs__list" role="list">
          <li
            v-for="(job, index) in featuredJobs"
            :key="index"
            class="lp-jobs__row"
          >
            <div class="lp-jobs__logo" :style="{ background: job.logoBg }">
              <span class="lp-jobs__logo-letter">{{ job.logoLetter }}</span>
            </div>
            <div class="lp-jobs__body">
              <div class="lp-jobs__title-row">
                <span class="lp-jobs__title">{{ job.title }}</span>
              </div>
              <div class="lp-jobs__company">
                {{ job.company }}
              </div>
              <div class="lp-jobs__location">
                <q-icon name="place" size="16px" class="lp-jobs__pin" aria-hidden="true" />
                {{ job.location }}
              </div>
              <span class="lp-jobs__promoted">Promoted</span>
            </div>
            <q-btn
              no-caps
              unelevated
              class="lp-btn lp-btn--primary lp-jobs__apply"
              label="Apply Now"
              @click="applyFeatured(job)"
            />
          </li>
        </ul>

        <div class="lp-jobs__footer">
          <q-btn
            no-caps
            unelevated
            class="lp-btn lp-btn--primary lp-btn--wide"
            label="Find Jobs"
            @click="router.push('/jobs')"
          />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup>
import heroIllustration from 'src/assets/page 1.png'
import headlineImage from 'src/assets/see ability.png'
import { useRouter } from 'vue-router'
import { usePublicAuthDialogStore } from 'src/stores/publicAuthDialogStore'

const router = useRouter()
const authDialog = usePublicAuthDialogStore()

const stats = [
  { number: '3 +', label: 'Years' },
  { number: '50,000+', label: 'Users' },
  { number: '10,000+', label: 'Companies' },
]

/** Brands shown on marketing landing (tile colors approximate brand cues). */
const featuredCompanies = [
  { name: 'Nestle', slug: 'nestle', mark: 'N', color: '#0095da' },
  { name: 'Cadbury', slug: 'cadbury', mark: 'C', color: '#4a148c' },
  { name: 'NBE', slug: 'nbe', mark: 'N', color: '#007f4e' },
  { name: 'Breadfast', slug: 'breadfast', mark: 'B', color: '#6a1b9a' },
  { name: 'Google', slug: 'google', mark: 'G', color: '#4285f4' },
  { name: 'Apple', slug: 'apple', mark: 'A', color: '#1a1a1a' },
  { name: 'El-Sewedy', slug: 'elsewedy', mark: 'E', color: '#c62828' },
]

const featuredJobs = [
  {
    title: 'UI/UX Designer',
    company: 'Orange Egypt',
    location: 'Cairo, Egypt (Remotely)',
    logoBg: '#ff7900',
    logoLetter: 'O',
  },
  {
    title: 'Front-End Developer',
    company: 'Blink22',
    location: 'Assuit, Egypt (On-Site)',
    logoBg: '#fdd835',
    logoLetter: 'B',
  },
  {
    title: 'Product Designer',
    company: 'Vodafone Egypt',
    location: 'Cairo, Egypt (Hybrid)',
    logoBg: '#e60000',
    logoLetter: 'V',
  },
  {
    title: 'Software Engineer',
    company: 'Thndr',
    location: 'Cairo, Egypt (Remotely)',
    logoBg: '#fbc02d',
    logoLetter: 'T',
  },
  {
    title: 'Backend Developer',
    company: 'Robusta',
    location: 'Alexandria, Egypt (On-Site)',
    logoBg: '#c62828',
    logoLetter: 'R',
  },
]

function goSignUpAs(role) {
  authDialog.openSignup(role === 'employer' ? 'employer' : 'seeker')
}

function goFeaturedCompany(c) {
  router.push({ path: '/jobs', query: { q: c.name } })
}

function applyFeatured() {
  authDialog.openSignup('seeker')
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* App primary purple — matches quasar.variables.scss $primary */
.landing-page {
  --lp-purple: #3d0b52;
  --lp-purple-soft: rgba(61, 11, 82, 0.12);
  --lp-stats-bg: #3d0b52;
  --lp-stats-card: rgba(255, 255, 255, 0.14);
  font-family: 'Inter', system-ui, sans-serif;
  background: #ffffff;
  overflow-x: hidden;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* --- 1 Hero --- */
.lp-hero {
  background: #ffffff;
  padding: clamp(12px, 3vw, 28px) var(--spire-layout-gutter) clamp(28px, 5vw, 48px);
  box-sizing: border-box;
}

.lp-hero__inner {
  width: 100%;
  max-width: min(1180px, 100%);
  margin: 0 auto;
}

.lp-hero__grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 4vw, 52px);
}

.lp-hero__illustration {
  flex: 0 1 44%;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.lp-hero__illustration-img {
  width: 100%;
  max-width: min(440px, 100%);
  height: auto;
  max-height: min(560px, 62vh);
  object-fit: contain;
}

.lp-hero__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.lp-hero__headline-wrap {
  width: 100%;
  max-width: 540px;
}

.lp-hero__headline-img {
  width: 100%;
  height: auto;
  display: block;
}

.lp-hero__cta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px 18px;
  margin-top: clamp(22px, 4vw, 36px);
}

.lp-btn {
  border-radius: 999px !important;
  font-weight: 600;
  font-size: 15px;
  min-height: 50px;
  padding-left: 22px;
  padding-right: 22px;
}

.lp-btn--primary {
  background: var(--lp-purple) !important;
  color: #ffffff !important;
}

.lp-btn--primary :deep(.q-btn__wrapper) {
  box-shadow: none;
}

.lp-btn--wide {
  min-width: min(280px, 100%);
  padding-left: 36px;
  padding-right: 36px;
}

/* --- 2 Stats --- */
.lp-stats {
  background: var(--lp-stats-bg);
  padding: clamp(44px, 7vw, 88px) var(--spire-layout-gutter);
  box-sizing: border-box;
}

.lp-stats__container {
  width: 100%;
  max-width: min(1080px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: center;
  gap: clamp(16px, 3vw, 32px);
}

.lp-stats__card {
  flex: 1 1 0;
  min-height: clamp(168px, 22vw, 220px);
  max-width: 320px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: var(--lp-stats-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: clamp(20px, 3vw, 32px) clamp(16px, 2vw, 24px);
  box-sizing: border-box;
}

.lp-stats__number {
  font-size: clamp(30px, 4.5vw, 46px);
  font-weight: 700;
  color: #ffffff;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.lp-stats__label {
  margin-top: 10px;
  font-size: clamp(17px, 2.4vw, 22px);
  font-weight: 600;
  color: #ffffff;
  opacity: 0.95;
}

/* --- 3 Featured companies --- */
.lp-companies {
  background: #ffffff;
  padding: clamp(48px, 8vw, 88px) var(--spire-layout-gutter);
  box-sizing: border-box;
}

.lp-section-inner {
  width: 100%;
  max-width: min(1140px, 100%);
  margin: 0 auto;
}

.lp-section-title {
  margin: 0 0 clamp(32px, 5vw, 48px);
  text-align: center;
  font-size: clamp(22px, 3.2vw, 28px);
  font-weight: 700;
  color: var(--lp-purple);
  letter-spacing: 0.02em;
}

.lp-companies__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-start;
  gap: clamp(20px, 3vw, 36px) clamp(16px, 2.5vw, 28px);
}

.lp-companies__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: min(120px, 28vw);
  padding: 8px 6px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 12px;
  transition: background-color 0.2s ease, transform 0.15s ease;
  font: inherit;
  color: inherit;
  text-align: center;
}

.lp-companies__item:hover,
.lp-companies__item:focus-visible {
  background: var(--lp-purple-soft);
  outline: none;
}

.lp-companies__item:focus-visible {
  box-shadow: 0 0 0 2px var(--lp-purple);
}

.lp-companies__mark {
  width: clamp(56px, 12vw, 72px);
  height: clamp(56px, 12vw, 72px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.lp-companies__mark-text {
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 700;
  color: #ffffff;
}

.lp-companies__name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.25;
}

/* --- 4 Featured jobs --- */
.lp-jobs {
  background: #ffffff;
  padding: 0 var(--spire-layout-gutter) clamp(56px, 9vw, 96px);
  box-sizing: border-box;
}

.lp-section-inner--jobs {
  padding-top: clamp(8px, 2vw, 16px);
}

.lp-jobs__list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lp-jobs__row {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2vw, 20px);
  padding: clamp(18px, 2.5vw, 24px) 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.lp-jobs__row:last-of-type {
  border-bottom: none;
}

.lp-jobs__logo {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 800;
  font-size: 22px;
}

.lp-jobs__logo-letter {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.lp-jobs__body {
  flex: 1;
  min-width: 0;
}

.lp-jobs__title {
  font-size: clamp(15px, 2vw, 17px);
  font-weight: 700;
  color: #141414;
}

.lp-jobs__company {
  font-size: 14px;
  color: #5c5c5c;
  margin-top: 4px;
}

.lp-jobs__location {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: 13px;
  color: #6b6b6b;
}

.lp-jobs__pin {
  color: var(--lp-purple);
}

.lp-jobs__promoted {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #555;
  background: #f0f0f2;
}

.lp-jobs__apply {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 18px !important;
  font-size: 14px;
}

.lp-jobs__footer {
  display: flex;
  justify-content: center;
  margin-top: clamp(28px, 5vw, 40px);
}

@media (max-width: 1024px) {
  .lp-hero__grid {
    flex-direction: column;
  }

  .lp-hero__illustration {
    flex: 0 0 auto;
    max-width: min(380px, 88vw);
  }

  .lp-stats__container {
    flex-direction: column;
    align-items: stretch;
  }

  .lp-stats__card {
    max-width: none;
  }
}

@media (max-width: 600px) {
  .lp-jobs__row {
    flex-wrap: wrap;
  }

  .lp-jobs__apply {
    width: 100%;
    margin-top: 8px;
  }
}
</style>
