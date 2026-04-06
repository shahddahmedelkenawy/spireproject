<template>
  <div>
    <q-btn
      round
      unelevated
      icon="accessibility_new"
      class="spire-a11y-fab"
      :class="{ 'spire-a11y-fab--compact': compactBottom }"
      aria-label="Display and accessibility settings"
      aria-haspopup="dialog"
      @click="openPanel"
    />

    <q-dialog
      v-model="panelOpen"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="spire-a11y-dialog" role="dialog" aria-labelledby="a11y-dialog-title">
        <q-card-section class="row items-center q-pb-none">
          <div id="a11y-dialog-title" class="text-h6">Accessibility</div>
          <q-space />
          <q-btn flat round dense icon="close" aria-label="Close" @click="closePanel" />
        </q-card-section>

        <q-card-section class="q-pt-sm q-pb-none">
          <p class="text-caption text-grey-8 q-mb-none">
            Adjust display, motion, and assistive options. Settings are saved on this device.
          </p>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-none">
          <q-scroll-area class="spire-a11y-scroll">
            <div class="q-px-md q-pb-md q-pt-sm">
              <section class="q-mb-lg" aria-labelledby="a11y-text-size">
                <div id="a11y-text-size" class="text-subtitle2 text-weight-medium q-mb-sm">Text size</div>
                <q-btn-toggle
                  v-model="textScalePercent"
                  spread
                  no-caps
                  unelevated
                  toggle-color="primary"
                  color="grey-3"
                  text-color="grey-9"
                  :options="textOptions"
                  class="full-width"
                />
              </section>

              <section class="q-mb-lg" aria-labelledby="a11y-visual">
                <div id="a11y-visual" class="text-subtitle2 text-weight-medium q-mb-sm">Contrast &amp; color</div>
                <p class="text-caption text-grey-7 q-mb-md">
                  Contrast and saturation apply to the whole app. Grayscale removes color.
                </p>
                <div class="q-mb-md">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-body2">Contrast</span>
                    <span class="text-caption text-grey-7">{{ contrastPercent }}%</span>
                  </div>
                  <q-slider
                    v-model="contrastPercent"
                    :min="80"
                    :max="160"
                    :step="5"
                    color="primary"
                    aria-label="Contrast"
                  />
                </div>
                <div class="q-mb-md">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-body2">Saturation</span>
                    <span class="text-caption text-grey-7">{{ saturationPercent }}%</span>
                  </div>
                  <q-slider
                    v-model="saturationPercent"
                    :min="0"
                    :max="100"
                    :step="5"
                    color="primary"
                    aria-label="Saturation"
                  />
                </div>
                <q-toggle
                  v-model="grayscaleEnabled"
                  label="Grayscale (black &amp; white)"
                  color="primary"
                />
              </section>

              <section class="q-mb-lg" aria-labelledby="a11y-reading">
                <div id="a11y-reading" class="text-subtitle2 text-weight-medium q-mb-sm">Reading</div>
                <div class="q-mb-md">
                  <div class="text-body2 q-mb-xs">Letter spacing</div>
                  <q-btn-toggle
                    v-model="letterSpacing"
                    spread
                    no-caps
                    unelevated
                    toggle-color="primary"
                    color="grey-3"
                    text-color="grey-9"
                    :options="letterOptions"
                    class="full-width"
                  />
                </div>
                <q-toggle
                  v-model="highlightText"
                  label="Highlight text &amp; underline links"
                  color="primary"
                />
              </section>

              <section class="q-mb-lg" aria-labelledby="a11y-content">
                <div id="a11y-content" class="text-subtitle2 text-weight-medium q-mb-sm">Content</div>
                <q-toggle
                  v-model="hideImages"
                  class="q-mb-sm"
                  label="Hide images"
                  color="primary"
                />
                <p class="text-caption text-grey-7 q-mb-md q-ml-sm">
                  Hides photos and image widgets. Icons and buttons stay visible.
                </p>
                <q-toggle
                  v-model="hideTooltips"
                  label="Hide tooltips"
                  color="primary"
                />
              </section>

              <section class="q-mb-lg" aria-labelledby="a11y-motion">
                <div id="a11y-motion" class="text-subtitle2 text-weight-medium q-mb-sm">Motion</div>
                <q-toggle
                  v-model="reduceMotion"
                  label="Pause / reduce animations"
                  color="primary"
                />
              </section>

              <section class="q-mb-sm" aria-labelledby="a11y-sr">
                <div id="a11y-sr" class="text-subtitle2 text-weight-medium q-mb-sm">Screen reader</div>
                <q-banner rounded class="bg-blue-1 text-dark q-mb-md">
                  <template #avatar>
                    <q-icon name="record_voice_over" color="primary" />
                  </template>
                  <strong>Important:</strong> SPIRE cannot turn on your device screen reader.
                  Use <strong>VoiceOver</strong> (Apple), <strong>TalkBack</strong> (Android), or
                  <strong>Narrator</strong> (Windows) in your system accessibility settings.
                </q-banner>
                <q-toggle
                  :model-value="screenReaderMode"
                  label="Screen reader enhancements"
                  color="primary"
                  @update:model-value="setScreenReaderMode"
                />
                <p class="text-caption text-grey-7 q-mt-sm q-mb-none">
                  When on: clearer focus rings, stronger keyboard focus, and spoken announcements when you
                  change settings.                   Use <strong>Skip to main content</strong> at the top of the page (press Tab first).
                </p>
              </section>
            </div>
          </q-scroll-area>
        </q-card-section>

        <q-separator />

        <q-card-actions align="between" class="q-px-md q-pb-md">
          <q-btn flat no-caps color="grey-8" label="Reset all" @click="resetDefaults" />
          <q-btn unelevated no-caps color="primary" label="Done" @click="closePanel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAccessibilityStore } from 'src/stores/accessibilityStore'

const route = useRoute()
const store = useAccessibilityStore()
const {
  textScalePercent,
  contrastPercent,
  saturationPercent,
  grayscaleEnabled,
  hideImages,
  hideTooltips,
  highlightText,
  letterSpacing,
  reduceMotion,
  screenReaderMode,
  panelOpen,
} = storeToRefs(store)
const { openPanel, closePanel, resetDefaults, setScreenReaderMode } = store

const textOptions = [
  { label: 'Default', value: 100 },
  { label: 'Larger', value: 115 },
  { label: 'Largest', value: 130 },
]

const letterOptions = [
  { label: 'Default', value: 'none' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Wide', value: 'wide' },
]

/** Screens without main bottom tab bar — keep FAB closer to the bottom edge */
const compactBottom = computed(() => {
  const p = route.path
  if (p === '/login' || p === '/signup' || p === '/role-selection' || p === '/onboarding') return true
  if (p === '/' || p === '') return true
  if (p.startsWith('/job-seeker/')) return true
  if (p.startsWith('/jobseeker/')) return true
  if (p.startsWith('/employer/company-profile')) return true
  if (p.startsWith('/upgrade')) return true
  if (p.startsWith('/shared/')) return true
  if (p.includes('/messages/chat')) return true
  return false
})
</script>

<style scoped>
.spire-a11y-fab {
  position: fixed;
  left: max(16px, env(safe-area-inset-left));
  bottom: calc(72px + env(safe-area-inset-bottom));
  width: 48px;
  height: 48px;
  min-height: 48px;
  z-index: 6000;
  background: #4b1e5a !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(75, 30, 90, 0.35);
}

.spire-a11y-fab--compact {
  bottom: calc(24px + env(safe-area-inset-bottom));
}

.spire-a11y-dialog {
  width: 100%;
  max-width: 420px;
  border-radius: 16px 16px 0 0;
}

.spire-a11y-scroll {
  height: min(70vh, 520px);
}

@media (min-width: 420px) {
  .spire-a11y-dialog {
    border-radius: 16px;
  }
}
</style>
