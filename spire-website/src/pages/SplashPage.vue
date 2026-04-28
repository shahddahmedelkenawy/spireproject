<template>
  <div class="splash">
    <div class="splash-logo">
      <span class="logo-s" aria-hidden="true">S</span>
      <span class="logo-pire" aria-hidden="true">PIRE</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
let timer = null

onMounted(() => {
  timer = setTimeout(() => {
    router.replace('/onboarding')
  }, 2600)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');

.splash {
  position: fixed;
  inset: 0;
  min-height: 100vh;
  min-height: 100dvh;
  background: #4b1f4f;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.splash-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  font-family: 'Playfair Display', 'Didot', 'Canela', serif;
  font-weight: 700;
  color: #ffffff;
  font-size: clamp(3rem, 18vw, 5.5rem);
  letter-spacing: 0.02em;
}

.logo-s {
  display: inline-block;
  animation: s-sequence 2.9s ease-in-out forwards;
}

.logo-pire {
  display: inline-block;
  opacity: 0;
  animation: pire-sequence 2.9s ease-in-out 0.7s forwards;
}

@keyframes s-sequence {
  0% {
    transform: scale(0.35) translateX(0);
    opacity: 1;
  }
  28% {
    transform: scale(1) translateX(0);
    opacity: 1;
  }
  42% {
    transform: scale(1) translateX(-0.01em);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateX(-0.01em);
    opacity: 1;
  }
}

@keyframes pire-sequence {
  0% {
    opacity: 0;
    transform: translateX(28px);
  }
  30% {
    opacity: 1;
    transform: translateX(0);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
