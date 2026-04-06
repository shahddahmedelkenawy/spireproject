import { defineStore } from 'pinia'
import { ref, watch, nextTick } from 'vue'

const STORAGE_KEY = 'spire-accessibility-v2'

const VALID_SCALES = [100, 115, 130]
const VALID_LETTER = ['none', 'moderate', 'wide']

function clampScale(n) {
  if (VALID_SCALES.includes(n)) return n
  return 100
}

function clampContrast(n) {
  const x = Number(n)
  if (Number.isFinite(x)) return Math.min(160, Math.max(80, Math.round(x)))
  return 100
}

function clampSaturation(n) {
  const x = Number(n)
  if (Number.isFinite(x)) return Math.min(100, Math.max(0, Math.round(x)))
  return 100
}

function clampLetter(s) {
  return VALID_LETTER.includes(s) ? s : 'none'
}

function applyFilterToApp(grayscaleEnabled, contrastPercent, saturationPercent) {
  if (typeof document === 'undefined') return
  const root = document.getElementById('q-app')
  if (!root) return
  const cVal = clampContrast(contrastPercent)
  const sVal = clampSaturation(saturationPercent)
  if (!grayscaleEnabled && cVal === 100 && sVal === 100) {
    root.style.filter = ''
    return
  }
  const c = cVal / 100
  const s = sVal / 100
  let f = `contrast(${c}) saturate(${s})`
  if (grayscaleEnabled) f += ' grayscale(1)'
  root.style.filter = f
}

function applyDataAttributes(state) {
  if (typeof document === 'undefined') return
  const html = document.documentElement

  const scale = clampScale(state.textScalePercent) / 100
  html.style.setProperty('--spire-text-scale', String(scale))

  applyFilterToApp(state.grayscaleEnabled, state.contrastPercent, state.saturationPercent)

  const setBool = (attr, val) => {
    if (val) html.setAttribute(attr, 'true')
    else html.removeAttribute(attr)
  }

  setBool('data-a11y-hide-images', state.hideImages)
  setBool('data-a11y-hide-tooltips', state.hideTooltips)
  setBool('data-a11y-highlight', state.highlightText)
  setBool('data-a11y-reduced-motion', state.reduceMotion)
  setBool('data-a11y-sr-mode', state.screenReaderMode)

  const letter = clampLetter(state.letterSpacing)
  if (letter === 'none') html.removeAttribute('data-a11y-letter-spacing')
  else html.setAttribute('data-a11y-letter-spacing', letter)
}

export const useAccessibilityStore = defineStore('accessibility', () => {
  const textScalePercent = ref(100)
  const contrastPercent = ref(100)
  const saturationPercent = ref(100)
  const grayscaleEnabled = ref(false)

  const hideImages = ref(false)
  const hideTooltips = ref(false)
  const highlightText = ref(false)
  const letterSpacing = ref('none')
  const reduceMotion = ref(false)
  const screenReaderMode = ref(false)

  const panelOpen = ref(false)
  /** For aria-live announcements (screen readers) */
  const liveAnnouncement = ref('')

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          textScalePercent: clampScale(textScalePercent.value),
          contrastPercent: clampContrast(contrastPercent.value),
          saturationPercent: clampSaturation(saturationPercent.value),
          grayscaleEnabled: !!grayscaleEnabled.value,
          hideImages: !!hideImages.value,
          hideTooltips: !!hideTooltips.value,
          highlightText: !!highlightText.value,
          letterSpacing: clampLetter(letterSpacing.value),
          reduceMotion: !!reduceMotion.value,
          screenReaderMode: !!screenReaderMode.value,
        })
      )
    } catch {
      /* ignore */
    }
  }

  function getState() {
    return {
      textScalePercent: textScalePercent.value,
      contrastPercent: contrastPercent.value,
      saturationPercent: saturationPercent.value,
      grayscaleEnabled: grayscaleEnabled.value,
      hideImages: hideImages.value,
      hideTooltips: hideTooltips.value,
      highlightText: highlightText.value,
      letterSpacing: letterSpacing.value,
      reduceMotion: reduceMotion.value,
      screenReaderMode: screenReaderMode.value,
    }
  }

  function apply() {
    applyDataAttributes(getState())
    persist()
  }

  function announce(message) {
    if (typeof document === 'undefined' || !message) return
    liveAnnouncement.value = ''
    nextTick(() => {
      liveAnnouncement.value = message
    })
  }

  function migrateV1(p) {
    if (typeof p.textScalePercent === 'number') textScalePercent.value = clampScale(p.textScalePercent)
    if (typeof p.colorMode === 'string') {
      if (p.colorMode === 'grayscale') grayscaleEnabled.value = true
      if (p.colorMode === 'high-contrast') {
        contrastPercent.value = 125
        saturationPercent.value = 100
      }
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const p = JSON.parse(raw)
        if (typeof p.textScalePercent === 'number') textScalePercent.value = clampScale(p.textScalePercent)
        if (typeof p.contrastPercent === 'number') contrastPercent.value = clampContrast(p.contrastPercent)
        if (typeof p.saturationPercent === 'number') saturationPercent.value = clampSaturation(p.saturationPercent)
        if (typeof p.grayscaleEnabled === 'boolean') grayscaleEnabled.value = p.grayscaleEnabled
        if (typeof p.hideImages === 'boolean') hideImages.value = p.hideImages
        if (typeof p.hideTooltips === 'boolean') hideTooltips.value = p.hideTooltips
        if (typeof p.highlightText === 'boolean') highlightText.value = p.highlightText
        if (typeof p.letterSpacing === 'string') letterSpacing.value = clampLetter(p.letterSpacing)
        if (typeof p.reduceMotion === 'boolean') reduceMotion.value = p.reduceMotion
        if (typeof p.screenReaderMode === 'boolean') screenReaderMode.value = p.screenReaderMode
      } else {
        const legacy = localStorage.getItem('spire-accessibility-v1')
        if (legacy) {
          try {
            migrateV1(JSON.parse(legacy))
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      /* ignore */
    }
    applyDataAttributes(getState())
  }

  function openPanel() {
    panelOpen.value = true
  }

  function closePanel() {
    panelOpen.value = false
  }

  function resetDefaults() {
    textScalePercent.value = 100
    contrastPercent.value = 100
    saturationPercent.value = 100
    grayscaleEnabled.value = false
    hideImages.value = false
    hideTooltips.value = false
    highlightText.value = false
    letterSpacing.value = 'none'
    reduceMotion.value = false
    screenReaderMode.value = false
    const root = typeof document !== 'undefined' ? document.getElementById('q-app') : null
    if (root) root.style.filter = ''
    apply()
    announce('Accessibility settings reset to default.')
  }

  function setScreenReaderMode(on) {
    screenReaderMode.value = on
    apply()
    if (on) {
      announce(
        'Screen reader enhancements on. Use Tab to reach Skip to main content. SPIRE does not replace your device screen reader—use VoiceOver, TalkBack, or Narrator in system settings.'
      )
    } else {
      announce('Screen reader enhancements off.')
    }
  }

  watch(
    [
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
    ],
    () => apply(),
    { deep: true }
  )

  return {
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
    liveAnnouncement,
    loadFromStorage,
    openPanel,
    closePanel,
    resetDefaults,
    apply,
    announce,
    setScreenReaderMode,
  }
})
