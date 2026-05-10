<template>
  <q-page class="upgrade-plans-page">
    <div class="plans-inner">

      <header class="plans-hero">
        <h1 class="page-title">Choose your plan</h1>
        <p class="page-lead">Upgrade to unlock more — or stay on Free and explore SPIRE.</p>
      </header>

      <div class="plans-stack">
        <TransitionGroup name="plan-stagger" tag="div" class="plans-stagger" appear>
          <button
            type="button"
            key="free"
            class="plan-card plan-card--free"
            @click="goFree"
          >
            <div class="plan-card-top">
              <span class="plan-badge">Current</span>
              <h2 class="plan-name">Free Plan</h2>
              <div class="plan-price">0 LE</div>
            </div>
            <ul class="plan-features">
              <li class="plan-feature">
                <q-icon name="search" class="feat-ic" size="20px" />
                <span class="feat-text">Search for jobs &amp; companies</span>
              </li>
              <li class="plan-feature">
                <q-icon name="tune" class="feat-ic" size="20px" />
                <span class="feat-text">Use search filters</span>
              </li>
              <li class="plan-feature">
                <q-icon name="groups" class="feat-ic" size="20px" />
                <span class="feat-text">Make connections and grow your network</span>
              </li>
              <li class="plan-feature">
                <q-icon name="chat_bubble_outline" class="feat-ic" size="20px" />
                <span class="feat-text">Message employers</span>
              </li>
              <li class="plan-feature">
                <q-icon name="smart_toy" class="feat-ic" size="20px" />
                <span class="feat-text">SPIRE chatbot for inquiries</span>
              </li>
            </ul>
            <div class="plan-cta">Continue on Free <span class="plan-cta-arrow" aria-hidden="true">→</span></div>
          </button>

          <button
            type="button"
            key="premium"
            class="plan-card plan-card--premium plan-card--featured"
            @click="goPremium"
          >
            <div class="plan-card-glow" aria-hidden="true" />
            <div class="plan-card-top">
              <span class="plan-badge plan-badge--accent">Popular</span>
              <h2 class="plan-name">Premium Plan</h2>
              <div class="plan-price">180 LE</div>
            </div>
            <ul class="plan-features">
              <li class="plan-feature">
                <q-icon name="notifications_active" class="feat-ic" size="20px" />
                <span class="feat-text">Job notifications matched to your skills, experience &amp; profile</span>
              </li>
              <li class="plan-feature">
                <q-icon name="check_circle_outline" class="feat-ic" size="20px" />
                <span class="feat-text">Includes all Free Plan features</span>
              </li>
            </ul>
            <div class="plan-cta">Pay with card <span class="plan-cta-arrow" aria-hidden="true">→</span></div>
          </button>

          <button
            type="button"
            key="golden"
            class="plan-card plan-card--golden"
            @click="goGolden"
          >
            <div class="plan-card-top">
              <span class="plan-badge plan-badge--gold">Best value</span>
              <h2 class="plan-name">Golden Plan</h2>
              <div class="plan-price">250 LE</div>
            </div>
            <ul class="plan-features">
              <li class="plan-feature">
                <q-icon name="upload_file" class="feat-ic" size="20px" />
                <span class="feat-text">Send your CV to matching job opportunities automatically</span>
              </li>
              <li class="plan-feature">
                <q-icon name="trending_up" class="feat-ic" size="20px" />
                <span class="feat-text">Higher visibility &amp; employment chances</span>
              </li>
              <li class="plan-feature">
                <q-icon name="layers" class="feat-ic" size="20px" />
                <span class="feat-text">Includes all Free + Premium features</span>
              </li>
            </ul>
            <div class="plan-cta">Pay with card <span class="plan-cta-arrow" aria-hidden="true">→</span></div>
          </button>
        </TransitionGroup>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goFree() {
  router.push('/home')
}

function goPremium() {
  router.push({ path: '/payment/checkout', query: { type: 'premium' } })
}

function goGolden() {
  router.push({ path: '/payment/checkout', query: { type: 'golden' } })
}
</script>

<style scoped>
.upgrade-plans-page {
  width: 100%;
  box-sizing: border-box;
  background: var(--spire-baby-purple);
  min-height: 100%;
}

.plans-inner {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: clamp(32px, 6vw, 56px) var(--spire-layout-gutter) clamp(32px, 5vw, 48px);
  box-sizing: border-box;
}

.plans-hero {
  text-align: center;
  margin-bottom: clamp(22px, 3vw, 32px);
  padding-top: clamp(8px, 2vw, 16px);
  animation: hero-in 0.5s ease-out;
}

@keyframes hero-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.page-title {
  margin: 0 0 8px;
  font-size: clamp(1.35rem, 4.2vw, 1.55rem);
  font-weight: 800;
  color: #1a1520;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.page-lead {
  margin: 0 auto;
  max-width: min(52ch, 100%);
  font-size: clamp(0.875rem, 2vw, 0.95rem);
  line-height: 1.6;
  color: #5c5670;
  font-weight: 500;
}

.plans-stagger {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(16px, 2.5vw, 24px);
  width: 100%;
  align-items: stretch;
}

@media (min-width: 640px) and (max-width: 899px) {
  .plans-stagger {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 900px) {
  .plans-stagger {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Staggered enter */
.plan-stagger-enter-active {
  transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.plan-stagger-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.plan-card {
  --plan-purple: #4b1e5a;
  --plan-purple-border: #7b4d92;
  text-align: left;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border: 2px solid var(--plan-purple-border);
  border-radius: 24px;
  padding: 22px 20px 20px;
  background: #ffffff;
  box-shadow: 0 2px 12px rgba(75, 30, 90, 0.08);
  cursor: pointer;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease,
    border-color 0.25s ease, background 0.25s ease, color 0.22s ease;
  font: inherit;
  color: #1a1520;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}

.plan-card:hover {
  background: var(--plan-purple);
  border-color: var(--plan-purple);
  box-shadow: 0 12px 40px rgba(75, 30, 90, 0.35);
  transform: translateY(-3px) scale(1.01);
  color: #ffffff;
}

.plan-card:hover .plan-name,
.plan-card:hover .plan-price {
  color: #ffffff;
}

.plan-card:hover .plan-feature,
.plan-card:hover .feat-text {
  color: rgba(255, 255, 255, 0.95);
}

.plan-card:hover .feat-ic {
  color: rgba(255, 255, 255, 0.95);
  opacity: 1;
}

.plan-card:hover .plan-cta {
  color: #ffffff;
}

.plan-card:hover .plan-card-top {
  border-bottom-color: rgba(255, 255, 255, 0.25);
}

.plan-card:hover .plan-badge,
.plan-card:hover .plan-badge--accent,
.plan-card:hover .plan-badge--gold {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: none;
}

.plan-card:active {
  transform: translateY(0) scale(0.995);
  transition-duration: 0.12s;
}

.plan-card--featured {
  z-index: 1;
}

.plan-card-glow {
  display: none;
}

.plan-card--free,
.plan-card--premium,
.plan-card--golden {
  background: #ffffff;
}

.plan-card-top {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(30, 20, 40, 0.07);
  flex-shrink: 0;
}

@media (min-width: 900px) {
  .plan-card-top {
    min-height: 118px;
  }
}

.plan-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6a5c78;
  background: #efe8f3;
  padding: 5px 12px;
  border-radius: 100px;
  margin-bottom: 10px;
}

.plan-badge--accent {
  background: linear-gradient(135deg, #ede4f5 0%, #e4d7f0 100%);
  color: #4b1e5a;
  box-shadow: 0 1px 3px rgba(75, 30, 90, 0.12);
}

.plan-badge--gold {
  background: linear-gradient(135deg, #f5ebd4 0%, #f0e0c0 100%);
  color: #5c4518;
}

.plan-name {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 800;
  color: #1a1520;
  letter-spacing: -0.02em;
}

.plan-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #4b1e5a;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.plan-features {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
  flex: 1 1 auto;
}

.plan-feature {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #3a3540;
  font-weight: 500;
  min-height: 2.35em;
}

.feat-ic {
  color: #7b4d92;
  flex-shrink: 0;
  margin-top: 1px;
  opacity: 0.92;
}

.feat-text {
  flex: 1;
  min-width: 0;
}

.plan-cta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #4b1e5a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: auto;
  flex-shrink: 0;
  padding-top: 4px;
}

.plan-cta-arrow {
  transition: transform 0.25s ease;
}

.plan-card:hover .plan-cta-arrow {
  transform: translateX(4px);
}
</style>
