<template>
  <div>
    <!--
      Teleport to body: #q-app uses zoom + filter for a11y. That creates a containing block and
      breaks position:fixed for children, so the FAB was clipped or off-screen. Same idea as the mask.
    -->
    <Teleport to="body">
      <button
        v-show="showTrigger && !panelOpen"
        type="button"
        class="a11y-float-btn"
        aria-label="Open accessibility settings"
        :style="{ top: `${fabTop}px`, left: `${fabLeft}px` }"
        @pointerdown="onFabPointerDown"
      >
        <q-icon name="accessibility_new" size="28px" />
      </button>
    </Teleport>

    <!-- Reading mask: two thick purple lines that move with the pointer (vertical tracking) -->
    <Teleport to="body">
      <template v-if="cursorMode === 'readingMask'">
        <div
          class="a11y-mask-line"
          aria-hidden="true"
          :style="{ top: `${maskUpperLineTop}px`, height: `${MASK_LINE_THICK}px` }"
        />
        <div
          class="a11y-mask-line"
          aria-hidden="true"
          :style="{ top: `${maskLowerLineTop}px`, height: `${MASK_LINE_THICK}px` }"
        />
      </template>
      <div
        v-if="cursorMode === 'readingGuide'"
        class="a11y-reading-guide"
        aria-hidden="true"
        :style="{ top: `${guideLineTop}px`, height: `${GUIDE_THICK}px` }"
      />
    </Teleport>

    <q-dialog
      v-model="panelOpen"
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
      class="a11y-dialog-outer"
    >
      <q-card
        class="a11y-panel column no-wrap"
        :class="{ 'a11y-panel--jumbo': panelOversized }"
        role="dialog"
        aria-labelledby="a11y-panel-title"
      >
        <q-card-section class="a11y-panel-header row items-start no-wrap q-pb-sm">
          <div class="col">
            <div id="a11y-panel-title" class="text-h6 text-white q-mb-sm">Accessibility</div>
            <div class="row items-center justify-between no-wrap">
              <span class="text-body2 text-white a11y-header-label">Larger accessibility panel</span>
              <q-toggle
                v-model="panelOversized"
                dark
                color="purple-3"
                aria-label="Make this panel larger (not app content)"
                @update:model-value="savePanelOversized"
              />
            </div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            class="a11y-close-btn"
            aria-label="Close"
            @click="closePanel"
          />
        </q-card-section>

        <div class="col a11y-panel-scroll">
          <div class="a11y-grid q-pa-md">
            <section
              v-for="block in cardBlocks"
              :key="block.id"
              class="a11y-card"
              :class="{ 'a11y-card--open': expandedId === block.id }"
            >
              <button
                type="button"
                class="a11y-card-hit"
                :aria-expanded="expandedId === block.id"
                @click="toggleExpand(block.id)"
              >
                <div class="a11y-card-icon-wrap">
                  <q-icon :name="block.icon" size="26px" color="primary" />
                </div>
                <div class="a11y-card-label">{{ block.label }}</div>
              </button>

              <transition name="a11y-expand">
                <div v-show="expandedId === block.id" class="a11y-card-body">
                  <div v-if="block.id === 'contrast'" class="a11y-options">
                    <button
                      v-for="opt in contrastOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': contrastPreset === opt.value }"
                      @click.stop="contrastPreset = opt.value"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'highlight'" class="a11y-options a11y-options--toggle">
                    <q-toggle v-model="highlightLinks" label="Highlight links & selection" color="primary" @click.stop />
                  </div>

                  <div v-else-if="block.id === 'textSize'" class="a11y-options">
                    <button
                      v-for="opt in textSizeOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': textSize === opt.value }"
                      @click.stop="selectTextSize(opt.value)"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'textSpacing'" class="a11y-options">
                    <button
                      v-for="opt in textSpacingOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': textSpacing === opt.value }"
                      @click.stop="textSpacing = opt.value"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'pause'" class="a11y-options a11y-options--toggle">
                    <q-toggle v-model="pauseAnimations" label="Reduce animations" color="primary" @click.stop />
                  </div>

                  <div v-else-if="block.id === 'hideImg'" class="a11y-options a11y-options--toggle">
                    <q-toggle v-model="hideImages" label="Hide images" color="primary" @click.stop />
                  </div>

                  <div v-else-if="block.id === 'dyslexia'" class="a11y-options a11y-options--toggle">
                    <q-toggle v-model="dyslexiaFriendly" label="Lexend font" color="primary" @click.stop />
                  </div>

                  <div v-else-if="block.id === 'cursor'" class="a11y-options">
                    <button
                      v-for="opt in cursorModeOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': cursorMode === opt.value }"
                      @click.stop="selectCursorMode(opt.value)"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'tooltips'" class="a11y-options a11y-options--toggle">
                    <q-toggle v-model="tooltipsShown" label="Show tooltips" color="primary" @click.stop />
                  </div>

                  <div v-else-if="block.id === 'lineHeight'" class="a11y-options">
                    <button
                      v-for="opt in lineHeightOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': lineHeight === opt.value }"
                      @click.stop="selectLineHeight(opt.value)"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'textAlign'" class="a11y-options">
                    <button
                      v-for="opt in textAlignOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': textAlign === opt.value }"
                      @click.stop="selectTextAlign(opt.value)"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'saturation'" class="a11y-options">
                    <button
                      v-for="opt in saturationOptions"
                      :key="opt.value"
                      type="button"
                      class="a11y-opt"
                      :class="{ 'a11y-opt--active': saturationPreset === opt.value }"
                      @click.stop="saturationPreset = opt.value"
                    >
                      <span class="a11y-opt-line" />
                      {{ opt.label }}
                    </button>
                  </div>

                  <div v-else-if="block.id === 'bw'" class="a11y-options a11y-options--toggle">
                    <q-toggle v-model="blackAndWhite" label="Black & white" color="primary" @click.stop />
                  </div>

                  <div v-else-if="block.id === 'sr'" class="a11y-options a11y-options--toggle">
                    <q-toggle
                      v-model="srMode"
                      label="Screen reader enhancements"
                      color="primary"
                      class="full-width"
                      @click.stop
                    />
                  </div>

                  <div v-else-if="block.id === 'tts'" class="a11y-options a11y-options--toggle-like">
                    <p class="a11y-help-text">Reads the title of the current page (heading or browser title).</p>
                    <q-btn
                      unelevated
                      color="primary"
                      icon="volume_up"
                      label="Read page title"
                      class="full-width a11y-action-btn"
                      no-caps
                      type="button"
                      @click.stop="speakPageTitle"
                    />
                  </div>

                  <div v-else-if="block.id === 'stt'" class="a11y-options a11y-options--toggle-like">
                    <p class="a11y-help-text">Speech is shown as live status messages. Tap again to stop.</p>
                    <q-btn
                      unelevated
                      :color="speechListening ? 'negative' : 'primary'"
                      icon="mic"
                      :label="speechListening ? 'Stop speech to text' : 'Start speech to text'"
                      class="full-width a11y-action-btn"
                      no-caps
                      type="button"
                      @click.stop="toggleSpeechToText"
                    />
                  </div>
                </div>
              </transition>
            </section>
          </div>
        </div>

        <q-card-actions class="a11y-reset-wrap q-pa-md q-pt-none">
          <q-btn
            unelevated
            no-caps
            class="a11y-reset-btn full-width"
            @click="resetDefaults"
          >
            <q-icon name="autorenew" size="22px" class="q-mr-sm" />
            Reset all accessibility settings
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useAccessibilityStore } from 'src/stores/accessibilityStore'
import { useJobSeekerUiStore } from 'src/stores/jobSeekerUiStore'
import { ASSISTANT_PEER_ID } from 'src/constants/messaging'

const FAB_KEY = 'spire-a11y-fab-pos-v1'
const PANEL_OVERSIZED_KEY = 'spire-a11y-panel-oversized'

/** Reading mask: gap between the two purple lines (px); lines move with pointer Y */
const MASK_GAP = 140
const MASK_LINE_THICK = 10
const GUIDE_THICK = 10

const route = useRoute()
const store = useAccessibilityStore()
const jobSeekerUi = useJobSeekerUiStore()
const { messagesHubPeerId } = storeToRefs(jobSeekerUi)
const {
  contrastPreset,
  highlightLinks,
  textSize,
  textSpacing,
  pauseAnimations,
  hideImages,
  dyslexiaFriendly,
  cursorMode,
  tooltipsShown,
  lineHeight,
  textAlign,
  saturationPreset,
  blackAndWhite,
  screenReaderMode,
  panelOpen,
  pointerX,
  pointerY,
  speechListening,
} = storeToRefs(store)

const {
  openPanel,
  closePanel,
  resetDefaults,
  setScreenReaderMode,
  speakPageTitle,
  toggleSpeechToText,
  apply,
} = store

function selectCursorMode(mode) {
  cursorMode.value = mode
  nextTick(() => apply())
}

function selectTextSize(v) {
  textSize.value = v
  nextTick(() => apply())
}

function selectLineHeight(v) {
  lineHeight.value = v
  nextTick(() => apply())
}

function selectTextAlign(v) {
  textAlign.value = v
  nextTick(() => apply())
}

const srMode = computed({
  get: () => screenReaderMode.value,
  set: (v) => setScreenReaderMode(!!v),
})

const panelOversized = ref(false)
const expandedId = ref(null)
const fabTop = ref(10)
const fabLeft = ref(12)
let dragging = false
let dragStartX = 0
let dragStartY = 0
let fabStartLeft = 0
let fabStartTop = 0
let dragDistance = 0

function isSpiraChatRoute() {
  let pid = route.params?.peerId
  if (!pid && route.path === '/messages') pid = messagesHubPeerId.value
  if (!pid) return false
  try {
    return decodeURIComponent(String(pid)) === ASSISTANT_PEER_ID
  } catch {
    return false
  }
}

/** 1:1 (peer) chat screens use the dock a11y button; keep the floating one off to avoid two controls. */
function isPeerChatRoute() {
  if (route.path.startsWith('/employer/messages/chat/')) return true
  if (route.path.startsWith('/messages/chat/')) return true
  if (route.path !== '/messages') return false
  const pid = messagesHubPeerId.value
  if (!pid || pid === ASSISTANT_PEER_ID) return false
  return true
}

/**
 * Show the floating a11y button on splash, landing, and all non-chat routes.
 * On human chat, the input-dock a11y button is used instead.
 * On Spira (assistant) chat, the dock control is hidden — keep this FAB visible.
 */
const showTrigger = computed(() => {
  if (isSpiraChatRoute()) return true
  if (isPeerChatRoute()) return false
  return true
})

const maskUpperLineTop = computed(() =>
  Math.max(0, pointerY.value - MASK_GAP / 2 - MASK_LINE_THICK)
)
const maskLowerLineTop = computed(() => pointerY.value + MASK_GAP / 2)
const guideLineTop = computed(() => Math.max(0, pointerY.value - GUIDE_THICK / 2))

const cardBlocks = [
  { id: 'contrast', label: 'Contrast', icon: 'tonality' },
  { id: 'highlight', label: 'Highlight links', icon: 'link' },
  { id: 'textSize', label: 'Text size', icon: 'text_fields' },
  { id: 'textSpacing', label: 'Text spacing', icon: 'format_line_spacing' },
  { id: 'pause', label: 'Pause animations', icon: 'motion_photos_paused' },
  { id: 'hideImg', label: 'Hide images', icon: 'image_not_supported' },
  { id: 'dyslexia', label: 'Dyslexia friendly', icon: 'menu_book' },
  { id: 'cursor', label: 'Cursor', icon: 'near_me' },
  { id: 'tooltips', label: 'Tooltips', icon: 'chat_bubble_outline' },
  { id: 'lineHeight', label: 'Line height', icon: 'density_medium' },
  { id: 'textAlign', label: 'Text align', icon: 'format_align_left' },
  { id: 'saturation', label: 'Saturation', icon: 'palette' },
  { id: 'bw', label: 'Black & white', icon: 'gradient' },
  { id: 'sr', label: 'Screen reader', icon: 'record_voice_over' },
  { id: 'tts', label: 'Text to speech', icon: 'volume_up' },
  { id: 'stt', label: 'Speech to text', icon: 'mic' },
]

const contrastOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Invert colors', value: 'invert' },
  { label: 'Dark contrast', value: 'dark' },
  { label: 'Light contrast', value: 'light' },
]
const textSizeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Larger', value: 'larger' },
  { label: 'Largest', value: 'largest' },
]
const textSpacingOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Heavy', value: 'heavy' },
]
const cursorModeOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Big cursor', value: 'big' },
  { label: 'Reading mask', value: 'readingMask' },
  { label: 'Reading guide', value: 'readingGuide' },
]
const lineHeightOptions = [
  { label: 'Default', value: 'default' },
  { label: '1.5×', value: '1.5' },
  { label: '1.75×', value: '1.75' },
  { label: '2×', value: '2' },
]
const textAlignOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Align left', value: 'left' },
  { label: 'Align right', value: 'right' },
  { label: 'Center', value: 'center' },
  { label: 'Justify', value: 'justify' },
]
const saturationOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Low saturation', value: 'low' },
  { label: 'High saturation', value: 'high' },
  { label: 'Desaturate', value: 'desaturate' },
]

function savePanelOversized() {
  try {
    localStorage.setItem(PANEL_OVERSIZED_KEY, panelOversized.value ? '1' : '0')
  } catch {
    /* ignore */
  }
}

function loadPanelOversized() {
  try {
    panelOversized.value = localStorage.getItem(PANEL_OVERSIZED_KEY) === '1'
  } catch {
    panelOversized.value = false
  }
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function saveFabPos() {
  try {
    localStorage.setItem(FAB_KEY, JSON.stringify({ top: fabTop.value, left: fabLeft.value }))
  } catch {
    /* ignore */
  }
}

function loadFabPos() {
  try {
    const raw = localStorage.getItem(FAB_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (typeof p.top === 'number') fabTop.value = p.top
      if (typeof p.left === 'number') fabLeft.value = p.left
      return
    }
  } catch {
    /* ignore */
  }
  const h = typeof window !== 'undefined' ? window.innerHeight : 800
  fabLeft.value = 16
  fabTop.value = Math.max(80, h - 72)
}

function clampFab() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 400
  const h = typeof window !== 'undefined' ? window.innerHeight : 800
  fabLeft.value = Math.min(Math.max(8, fabLeft.value), w - 56 - 8)
  fabTop.value = Math.min(Math.max(8, fabTop.value), h - 56 - 8)
}

function onFabPointerDown(e) {
  if (e.button !== 0) return
  dragging = true
  dragDistance = 0
  dragStartX = e.clientX
  dragStartY = e.clientY
  fabStartLeft = fabLeft.value
  fabStartTop = fabTop.value
  window.addEventListener('pointermove', onPointerMoveFab)
  window.addEventListener('pointerup', onPointerUpFab)
  try {
    e.currentTarget?.setPointerCapture?.(e.pointerId)
  } catch {
    /* ignore */
  }
  e.preventDefault()
}

let pointerRaf = 0
let pendingPointerEvent = null

function schedulePointerUpdate(e) {
  pendingPointerEvent = e
  if (pointerRaf) return
  pointerRaf = requestAnimationFrame(() => {
    pointerRaf = 0
    const ev = pendingPointerEvent
    pendingPointerEvent = null
    if (ev) {
      pointerX.value = ev.clientX
      pointerY.value = ev.clientY
    }
  })
}

function onPointerMoveFab(e) {
  if (!dragging) return
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  dragDistance = Math.hypot(dx, dy)
  fabLeft.value = fabStartLeft + dx
  fabTop.value = fabStartTop + dy
  clampFab()
  schedulePointerUpdate(e)
}

function onPointerUpFab() {
  window.removeEventListener('pointermove', onPointerMoveFab)
  window.removeEventListener('pointerup', onPointerUpFab)
  if (!dragging) return
  dragging = false
  if (dragDistance > 10) {
    saveFabPos()
  } else {
    openPanel()
  }
}

function trackPointer(e) {
  schedulePointerUpdate(e)
}

watch(
  cursorMode,
  (cm) => {
    if (cm === 'readingMask' || cm === 'readingGuide') {
      pointerX.value = window.innerWidth / 2
      pointerY.value = window.innerHeight / 2
      window.addEventListener('pointermove', trackPointer, { passive: true })
      window.addEventListener('pointerdown', trackPointer, { passive: true })
    } else {
      window.removeEventListener('pointermove', trackPointer)
      window.removeEventListener('pointerdown', trackPointer)
    }
  },
  { immediate: true }
)

function onWindowResize() {
  clampFab()
}

onMounted(() => {
  loadFabPos()
  loadPanelOversized()
  clampFab()
  pointerX.value = window.innerWidth / 2
  pointerY.value = window.innerHeight / 2
  window.addEventListener('resize', onWindowResize, { passive: true })
})

onUnmounted(() => {
  if (pointerRaf) {
    cancelAnimationFrame(pointerRaf)
    pointerRaf = 0
  }
  window.removeEventListener('resize', onWindowResize)
  window.removeEventListener('pointermove', onPointerMoveFab)
  window.removeEventListener('pointerup', onPointerUpFab)
  window.removeEventListener('pointermove', trackPointer)
  window.removeEventListener('pointerdown', trackPointer)
})

watch(
  () => route.fullPath,
  () => {
    nextTick(() => clampFab())
  }
)
</script>

<style scoped>
.a11y-mask-line {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 2147482000;
  pointer-events: none;
  background: #9b59b6;
  border-radius: 2px;
  box-shadow: 0 0 16px rgba(155, 89, 182, 0.85), 0 0 4px rgba(75, 30, 90, 0.45);
  box-sizing: border-box;
}

.a11y-reading-guide {
  position: fixed;
  left: 0;
  right: 0;
  z-index: 2147482001;
  pointer-events: none;
  background: #9b59b6;
  border-radius: 2px;
  box-shadow: 0 0 16px rgba(155, 89, 182, 0.85), 0 0 4px rgba(75, 30, 90, 0.45);
  box-sizing: border-box;
}

.a11y-dialog-outer :deep(.q-dialog__inner) {
  padding: 0;
  align-items: flex-end;
}

.a11y-panel {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  max-height: min(92vh, 900px);
  height: min(88vh, 820px);
  background: #2d1438 !important;
  border-radius: 22px 22px 0 0;
  overflow: hidden;
}

.a11y-panel--jumbo {
  max-height: min(96vh, 960px);
  height: min(94vh, 900px);
}

.a11y-panel--jumbo .a11y-card-label {
  font-size: 14px;
}

.a11y-panel--jumbo .a11y-opt {
  font-size: 14px;
  padding: 12px 12px 12px 16px;
}

.a11y-panel--jumbo .a11y-card-hit {
  padding: 18px 12px 14px;
}

.a11y-panel--jumbo .a11y-card-icon-wrap :deep(.q-icon) {
  font-size: 32px !important;
  width: 32px;
  height: 32px;
}

.a11y-panel-header {
  background: linear-gradient(180deg, #3a1d45 0%, #2d1438 100%);
  padding: 16px 12px 12px 16px;
  padding-top: max(16px, env(safe-area-inset-top));
}

.a11y-header-label {
  opacity: 0.95;
}

.a11y-close-btn {
  margin-top: -4px;
}

.a11y-panel-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.a11y-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.a11y-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.a11y-card--open {
  box-shadow: 0 6px 20px rgba(75, 30, 90, 0.22);
}

.a11y-card-hit {
  width: 100%;
  border: none;
  background: transparent;
  padding: 14px 10px 10px;
  cursor: pointer;
  text-align: center;
}

.a11y-card-icon-wrap {
  margin-bottom: 8px;
}

.a11y-card-label {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  line-height: 1.25;
}

.a11y-card-body {
  border-top: 1px solid rgba(75, 30, 90, 0.12);
  padding: 8px 10px 12px;
  background: #faf8fc;
}

.a11y-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.a11y-options--toggle {
  align-items: stretch;
}

.a11y-options--toggle-like {
  gap: 10px;
}

.a11y-help-text {
  font-size: 11px;
  color: #555;
  margin: 0 0 4px;
  line-height: 1.35;
}

.a11y-action-btn {
  font-weight: 600;
  padding: 12px !important;
}

.a11y-opt {
  position: relative;
  border: none;
  background: #fff;
  border-radius: 10px;
  padding: 8px 10px 8px 14px;
  font-size: 12px;
  text-align: left;
  color: #333;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.a11y-opt-line {
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  width: 4px;
  border-radius: 2px;
  background: transparent;
  transition: background 0.15s ease;
}

.a11y-opt--active {
  background: rgba(75, 30, 90, 0.12);
  color: #4b1e5a;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(123, 63, 142, 0.2);
}

.a11y-opt--active .a11y-opt-line {
  background: #7b3f8e;
  box-shadow: 0 0 8px rgba(123, 63, 142, 0.45);
}

.a11y-reset-wrap {
  background: rgba(0, 0, 0, 0.15);
  padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
}

.a11y-reset-btn {
  background: #ffffff !important;
  color: #4b1e5a !important;
  border-radius: 16px !important;
  font-weight: 700 !important;
  font-size: 15px !important;
  padding: 16px 18px !important;
  min-height: 54px !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2) !important;
  border: 2px solid #9b59b6 !important;
}

.a11y-expand-enter-active,
.a11y-expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.a11y-expand-enter-from,
.a11y-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
