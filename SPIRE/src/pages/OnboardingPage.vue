<template>
  <div class="onboarding">
    <header class="onboarding-header">
      <q-btn        flat
        v-if="currentSlide < 2"
        dense
        no-caps
        label="Skip"
        class="skip-btn"
        @click="skipToThirdSlide"
      />
    </header>

    <q-carousel
      v-model="currentSlide"
      swipeable
      animated
      class="onboarding-carousel"
      @transition="onSlideChange"
    >
      <q-carousel-slide
        v-for="(slide, index) in slides"
        :key="index"
        :name="index"
        class="slide"
      >
        <div class="slide-content">
          <img
            :src="slide.image"
            :alt="slide.alt"
            class="slide-illustration"
          />

          <h2 class="slide-heading">
            {{ slide.heading }}
          </h2>

          <p class="slide-text">
            {{ slide.text }}
          </p>

          <p v-if="slide.caption" class="slide-caption">
            {{ slide.caption }}
          </p>

          <!-- Dots directly under the text -->
          <div class="onboarding-dots" role="tablist" aria-label="Onboarding steps">
            <button
              v-for="(_, i) in slides"
              :key="i"
              type="button"
              class="onboarding-dot"
              :class="{ 'onboarding-dot--active': currentSlide === i }"
              :aria-current="currentSlide === i ? 'step' : undefined"
              :aria-label="`Go to slide ${i + 1}`"
              @click="currentSlide = i"
            />
          </div>

          <div v-if="slide.showActions" class="slide-actions">
            <q-btn
              no-caps
              unelevated
              class="primary-btn"
              label="Join as a Job Seeker"
              @click="goToSignUp('seeker')"
            />
            <q-btn
              no-caps
              class="secondary-btn"
              label="Join as an Employer"
              @click="goToSignUp('employer')"
            />
          </div>
        </div>
      </q-carousel-slide>
    </q-carousel>

    <div class="bottom-arrows">
      <div class="bottom-arrows__side bottom-arrows__side--left">
        <q-btn
          v-if="currentSlide > 0"
          round
          unelevated
          color="primary"
          icon="arrow_back"
          class="nav-arrow"
          aria-label="Previous slide"
          @click="prevSlide"
        />
      </div>
      <div class="bottom-arrows__side bottom-arrows__side--right">
        <q-btn
          v-if="currentSlide < slides.length - 1"
          round
          unelevated
          color="primary"
          icon="arrow_forward"
          class="nav-arrow"
          aria-label="Next slide"
          @click="nextSlide"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import p1 from 'src/assets/page 1.png'
import p2 from 'src/assets/page 2.svg'
import p3 from 'src/assets/page 3.png'

const router = useRouter()
const route = useRoute()
const initialSlide = Number(route.query.slide)
const currentSlide = ref(initialSlide >= 0 && initialSlide <= 2 ? initialSlide : 0)

const slides = [
  {
    image: p1,
    alt: 'Person using a phone',
    heading: 'Everyone deserves equal opportunity',
    text: 'Spire connects talented people with disabilities to employers who value skills accessibility and inclusion',
  },
  {
    image: p2,
    alt: 'Person riding a bicycle',
    heading: 'Skills first always',
    text: 'Your abilities experience and preferences matter',
    caption: 'Not assumptions not labels',
  },
  {
    image: p3,
    alt: 'Person walking forward',
    heading: 'Your journey starts here',
    text: 'Spire helps people grow together',
    showActions: true,
  },
]

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

function onSlideChange() {
  // hook for analytics if needed
}

function skipToThirdSlide() {
  currentSlide.value = 2
}

function goToSignUp(role) {
  router.push({ path: '/signup', query: { role } })
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  min-height: 100dvh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.onboarding-header {
  padding: 16px 20px 8px;
  display: flex;
  justify-content: flex-end;
  min-height: 48px;
}

.skip-btn {
  color:#4b1f4f ;
  font-weight: 600;
  font-size: 14px;
}

.onboarding-carousel {
  flex: 1;
  background: #ffffff !important;
}

.onboarding-carousel :deep(.q-carousel__viewport),
.onboarding-carousel :deep(.q-carousel__slides-container),
.onboarding-carousel :deep(.q-carousel__slide),
.onboarding-carousel :deep(.q-panel) {
  background: #ffffff !important;
}

.onboarding-carousel :deep(.q-carousel__slide) {
  padding-bottom: 100px;
}

.slide {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 24px 24px;
}

.slide-content {
  text-align: center;
  max-width: 340px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
  flex: 1;
}

.slide-illustration {
  max-width: 320px;
  width: 70%;
  height: 280px;
  object-fit: contain;
  margin: 0 auto 24px;
  display: block;
}

.onboarding-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin: 16px 0 20px;
  flex-shrink: 0;
}

.onboarding-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(75, 31, 79, 0.35);
  padding: 0;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 1);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.onboarding-dot:focus-visible {
  outline: 2px solid #4b1f4f;
  outline-offset: 3px;
}

.onboarding-dot--active {
  background: #4b1f4f;
  border-color: #4b1f4f;
  box-shadow: 0 2px 8px rgba(75, 31, 79, 0.35);
  transform: scale(1.08);
}

.slide-heading {
  font-size: 22px;
  font-weight: 700;
  color: #111111;
  margin: 0 0 12px;
  line-height: 1.3;
}

.slide-text {
  font-size: 15px;
  color: #444444;
  line-height: 1.5;
  margin: 0 0 8px;
}

.slide-caption {
  font-size: 14px;
  color: #666666;
  margin: 0 0 24px;
}

.slide-actions {
  display: flex;
  flex-direction: row;      
  gap: 12px;               
  margin-top: 24px;
  align-items: center;
  justify-content: center;  
  flex-wrap: wrap; 
}

.primary-btn,
.secondary-btn {
  height: 38px;                /* تصغير الطول */
  border-radius: 999px;         /* rounded */
  font-size: 13px;
  padding: 0 14px;
  width: fit-content;
  background: #4b1f4f !important;
  color: #ffffff !important;
  border: 1.5px solid #4b1f4f;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.primary-btn:hover,
.primary-btn:active,
.primary-btn:focus,
.secondary-btn:hover,
.secondary-btn:active,
.secondary-btn:focus {
  background: #ffffff !important;
  color: #4b1f4f !important;
  border: 1.5px solid #4b1f4f;
}

.bottom-arrows {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  pointer-events: none;
  z-index: 2;
}

.bottom-arrows__side {
  pointer-events: auto;
  display: flex;
  min-height: 48px;
  align-items: center;
}

.bottom-arrows__side--left {
  justify-content: flex-start;
}

.bottom-arrows__side--right {
  justify-content: flex-end;
}

.nav-arrow {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.16);
}
</style>
