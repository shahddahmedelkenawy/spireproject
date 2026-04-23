import { defineStore } from 'pinia'
import { ref, watch, nextTick } from 'vue'

const STORAGE_KEY = 'spire-accessibility-v4'
const STORAGE_KEY_V3 = 'spire-accessibility-v3'
const STORAGE_KEY_V2 = 'spire-accessibility-v2'

const SIZE_MAP = { default: 100, larger: 115, largest: 130 }

/** @typedef {'default'|'big'|'readingMask'|'readingGuide'} CursorMode */

function migrateV2(p) {
  const patch = {}
  if (typeof p.textScalePercent === 'number') {
    const x = p.textScalePercent
    if (x <= 100) patch.textSize = 'default'
    else if (x <= 112) patch.textSize = 'larger'
    else patch.textSize = 'largest'
  }
  if (typeof p.letterSpacing === 'string') {
    if (p.letterSpacing === 'moderate') patch.textSpacing = 'moderate'
    else if (p.letterSpacing === 'wide') patch.textSpacing = 'heavy'
    else patch.textSpacing = 'light'
  }
  if (typeof p.highlightText === 'boolean') patch.highlightLinks = p.highlightText
  if (typeof p.hideImages === 'boolean') patch.hideImages = p.hideImages
  if (typeof p.hideTooltips === 'boolean') patch.tooltipsShown = !p.hideTooltips
  if (typeof p.reduceMotion === 'boolean') patch.pauseAnimations = p.reduceMotion
  if (typeof p.screenReaderMode === 'boolean') patch.screenReaderMode = p.screenReaderMode
  if (typeof p.grayscaleEnabled === 'boolean') patch.blackAndWhite = p.grayscaleEnabled
  if (typeof p.contrastPercent === 'number' && p.contrastPercent > 118) patch.contrastPreset = 'light'
  if (typeof p.saturationPercent === 'number') {
    if (p.saturationPercent < 45) patch.saturationPreset = 'desaturate'
    else if (p.saturationPercent < 80) patch.saturationPreset = 'low'
    else if (p.saturationPercent > 118) patch.saturationPreset = 'high'
  }
  return patch
}

function migrateCursorFields(p) {
  if (typeof p.cursorMode === 'string') return p.cursorMode
  if (p.readingMask === true) return 'readingMask'
  if (p.readingGuide === true) return 'readingGuide'
  if (p.cursorSize === 'big') return 'big'
  return 'default'
}

function applyToDOM(state) {
  if (typeof document === 'undefined') return
  const html = document.documentElement
  const root = document.getElementById('q-app')

  const ts =
    state.textSize && SIZE_MAP[state.textSize] !== undefined ? state.textSize : 'default'
  const zoom = SIZE_MAP[ts] / 100
  html.style.setProperty('--spire-text-scale', String(zoom))
  html.style.setProperty('--spire-text-zoom', String(zoom))
  html.setAttribute('data-a11y-text-size', ts)

  if (state.lineHeight && state.lineHeight !== 'default') {
    html.style.setProperty('--spire-line-height', state.lineHeight)
    html.setAttribute('data-a11y-line-height', state.lineHeight)
  } else {
    html.style.setProperty('--spire-line-height', 'normal')
    html.removeAttribute('data-a11y-line-height')
  }

  const setBool = (attr, val) => {
    if (val) html.setAttribute(attr, 'true')
    else html.removeAttribute(attr)
  }

  if (state.contrastPreset && state.contrastPreset !== 'default') {
    html.setAttribute('data-a11y-contrast-preset', state.contrastPreset)
  } else {
    html.removeAttribute('data-a11y-contrast-preset')
  }

  setBool('data-a11y-highlight', !!state.highlightLinks)
  setBool('data-a11y-hide-images', !!state.hideImages)
  setBool('data-a11y-hide-tooltips', !state.tooltipsShown)
  setBool('data-a11y-pause-motion', !!state.pauseAnimations)
  setBool('data-a11y-sr-mode', !!state.screenReaderMode)
  setBool('data-a11y-bw', !!state.blackAndWhite)
  setBool('data-a11y-dyslexia', !!state.dyslexiaFriendly)

  const cm = state.cursorMode || 'default'
  setBool('data-a11y-big-cursor', cm === 'big')
  html.removeAttribute('data-a11y-cursor-mode')
  if (cm === 'readingMask' || cm === 'readingGuide') {
    html.setAttribute('data-a11y-cursor-mode', cm)
  }

  html.removeAttribute('data-a11y-text-spacing')
  if (state.textSpacing && state.textSpacing !== 'light') {
    html.setAttribute('data-a11y-text-spacing', state.textSpacing)
  }

  const ta = state.textAlign
  if (!ta || ta === 'default') {
    html.removeAttribute('data-a11y-text-align')
    html.style.removeProperty('--spire-text-align')
    if (root) root.style.removeProperty('--spire-text-align')
  } else if (['left', 'right', 'center', 'justify'].includes(ta)) {
    html.setAttribute('data-a11y-text-align', ta)
    html.style.setProperty('--spire-text-align', ta)
    /* Mirror on #q-app so var() always resolves for text-align (inheritance edge cases) */
    if (root) root.style.setProperty('--spire-text-align', ta)
  } else {
    html.removeAttribute('data-a11y-text-align')
    html.style.removeProperty('--spire-text-align')
    if (root) root.style.removeProperty('--spire-text-align')
  }

  if (state.saturationPreset && state.saturationPreset !== 'default') {
    html.setAttribute('data-a11y-saturation-preset', state.saturationPreset)
  } else {
    html.removeAttribute('data-a11y-saturation-preset')
  }

  const parts = []
  if (state.contrastPreset === 'invert') {
    parts.push('invert(1) hue-rotate(180deg)')
  }

  let sat = 1
  if (state.saturationPreset === 'low') sat = 0.55
  else if (state.saturationPreset === 'high') sat = 1.25
  else if (state.saturationPreset === 'desaturate') sat = 0.3

  let cont = 1
  if (state.contrastPreset === 'light') cont = 1.18
  else if (state.contrastPreset === 'dark') cont = 1.12

  if (state.contrastPreset !== 'invert') {
    parts.push(`contrast(${cont})`)
  }
  parts.push(`saturate(${sat})`)

  if (state.contrastPreset === 'dark') parts.push('brightness(0.88)')
  if (state.contrastPreset === 'light') parts.push('brightness(1.06)')
  if (state.blackAndWhite) parts.push('grayscale(1)')

  const identity =
    state.contrastPreset === 'default' &&
    state.saturationPreset === 'default' &&
    !state.blackAndWhite

  /* Inline zoom + filter on #q-app so scaling always wins over Quasar/CSS order */
  if (root) {
    if (zoom === 1) {
      root.style.removeProperty('zoom')
    } else {
      root.style.zoom = String(zoom)
    }
    if (identity) {
      root.style.filter = ''
    } else {
      root.style.filter = parts.join(' ')
    }
  }
}

export const useAccessibilityStore = defineStore('accessibility', () => {
  const contrastPreset = ref('default')
  const highlightLinks = ref(false)
  const textSize = ref('default')
  const textSpacing = ref('light')
  const pauseAnimations = ref(false)
  const hideImages = ref(false)
  const dyslexiaFriendly = ref(false)
  /** default | big | readingMask | readingGuide */
  const cursorMode = ref('default')
  const tooltipsShown = ref(true)
  const lineHeight = ref('default')
  const textAlign = ref('default')
  const saturationPreset = ref('default')
  const blackAndWhite = ref(false)
  const screenReaderMode = ref(false)

  const panelOpen = ref(false)
  const liveAnnouncement = ref('')
  const pointerX = ref(typeof window !== 'undefined' ? window.innerWidth / 2 : 0)
  const pointerY = ref(typeof window !== 'undefined' ? window.innerHeight / 2 : 0)

  const speechListening = ref(false)

  function getState() {
    return {
      contrastPreset: contrastPreset.value,
      highlightLinks: highlightLinks.value,
      textSize: textSize.value,
      textSpacing: textSpacing.value,
      pauseAnimations: pauseAnimations.value,
      hideImages: hideImages.value,
      dyslexiaFriendly: dyslexiaFriendly.value,
      cursorMode: cursorMode.value,
      tooltipsShown: tooltipsShown.value,
      lineHeight: lineHeight.value,
      textAlign: textAlign.value,
      saturationPreset: saturationPreset.value,
      blackAndWhite: blackAndWhite.value,
      screenReaderMode: screenReaderMode.value,
    }
  }

  let persistTimer = null

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(getState()))
    } catch {
      /* ignore */
    }
  }

  /** Batched localStorage write so rapid option changes stay responsive */
  function schedulePersist() {
    if (persistTimer != null) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      persistTimer = null
      persist()
    }, 160)
  }

  function flushPersist() {
    if (persistTimer != null) {
      clearTimeout(persistTimer)
      persistTimer = null
    }
    persist()
  }

  function apply() {
    applyToDOM(getState())
    schedulePersist()
  }

  function announce(message) {
    if (!message) return
    liveAnnouncement.value = ''
    nextTick(() => {
      liveAnnouncement.value = message
    })
  }

  function loadFromStorage() {
    try {
      const rawV4 = localStorage.getItem(STORAGE_KEY)
      const rawV3 = localStorage.getItem(STORAGE_KEY_V3)
      const raw = rawV4 || rawV3
      const migratedFromV3Only = !rawV4 && !!rawV3
      if (raw) {
        const p = JSON.parse(raw)
        if (typeof p.contrastPreset === 'string') contrastPreset.value = p.contrastPreset
        if (typeof p.highlightLinks === 'boolean') highlightLinks.value = p.highlightLinks
        if (typeof p.textSize === 'string') textSize.value = p.textSize
        if (typeof p.textSpacing === 'string') textSpacing.value = p.textSpacing
        if (typeof p.pauseAnimations === 'boolean') pauseAnimations.value = p.pauseAnimations
        if (typeof p.hideImages === 'boolean') hideImages.value = p.hideImages
        if (typeof p.dyslexiaFriendly === 'boolean') dyslexiaFriendly.value = p.dyslexiaFriendly
        if (typeof p.cursorMode === 'string') cursorMode.value = p.cursorMode
        else cursorMode.value = migrateCursorFields(p)
        if (typeof p.tooltipsShown === 'boolean') tooltipsShown.value = p.tooltipsShown
        if (typeof p.lineHeight === 'string') lineHeight.value = p.lineHeight
        if (typeof p.textAlign === 'string') {
          if (['default', 'left', 'right', 'center', 'justify'].includes(p.textAlign)) {
            if (migratedFromV3Only && p.textAlign === 'left') {
              textAlign.value = 'default'
            } else {
              textAlign.value = p.textAlign
            }
          } else {
            textAlign.value = 'default'
          }
        }
        if (typeof p.saturationPreset === 'string') saturationPreset.value = p.saturationPreset
        if (typeof p.blackAndWhite === 'boolean') blackAndWhite.value = p.blackAndWhite
        if (typeof p.screenReaderMode === 'boolean') screenReaderMode.value = p.screenReaderMode
      } else {
        const v2 = localStorage.getItem(STORAGE_KEY_V2)
        if (v2) {
          try {
            const patch = migrateV2(JSON.parse(v2))
            if (patch.textSize) textSize.value = patch.textSize
            if (patch.textSpacing) textSpacing.value = patch.textSpacing
            if (patch.highlightLinks !== undefined) highlightLinks.value = patch.highlightLinks
            if (patch.hideImages !== undefined) hideImages.value = patch.hideImages
            if (patch.tooltipsShown !== undefined) tooltipsShown.value = patch.tooltipsShown
            if (patch.pauseAnimations !== undefined) pauseAnimations.value = patch.pauseAnimations
            if (patch.screenReaderMode !== undefined) screenReaderMode.value = patch.screenReaderMode
            if (patch.blackAndWhite !== undefined) blackAndWhite.value = patch.blackAndWhite
            if (patch.contrastPreset) contrastPreset.value = patch.contrastPreset
            if (patch.saturationPreset) saturationPreset.value = patch.saturationPreset
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      /* ignore */
    }
    applyToDOM(getState())
  }

  function openPanel() {
    panelOpen.value = true
  }

  function closePanel() {
    panelOpen.value = false
  }

  function resetDefaults() {
    contrastPreset.value = 'default'
    highlightLinks.value = false
    textSize.value = 'default'
    textSpacing.value = 'light'
    pauseAnimations.value = false
    hideImages.value = false
    dyslexiaFriendly.value = false
    cursorMode.value = 'default'
    tooltipsShown.value = true
    lineHeight.value = 'default'
    textAlign.value = 'default'
    saturationPreset.value = 'default'
    blackAndWhite.value = false
    screenReaderMode.value = false
    stopSpeechToText()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    flushPersist()
    announce('All accessibility settings were reset to default.')
  }

  function getPageTitleText() {
    if (typeof document === 'undefined') return ''
    const main = document.getElementById('spire-main-content')
    const selectors = [
      'h1',
      '[data-page-title]',
      '.q-toolbar__title',
      '.q-header .text-h6',
      '.text-h4',
      '.text-h5',
      '.text-h6',
    ]
    if (main) {
      for (const sel of selectors) {
        const el = main.querySelector(sel)
        if (el) {
          const t = el.textContent?.replace(/\s+/g, ' ').trim()
          if (t && t.length > 0 && t.length < 400) return t
        }
      }
    }
    const raw = document.title || ''
    const stripped = raw.replace(/\s*[|–—-]\s*.*$/, '').trim()
    return stripped || raw.trim() || ''
  }

  function speakPageTitle() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      announce('Text to speech is not available in this browser.')
      return
    }
    const title = getPageTitleText()
    if (!title || title.length < 1) {
      announce('No page title found.')
      return
    }
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(title)
    u.rate = 0.92
    u.onerror = () => announce('Speech stopped.')
    window.speechSynthesis.speak(u)
    announce('Reading page title.')
  }

  let recognition = null
  function stopSpeechToText() {
    try {
      recognition?.stop?.()
      recognition?.abort?.()
    } catch {
      /* ignore */
    }
    speechListening.value = false
  }

  function toggleSpeechToText() {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!SR) {
      announce('Speech recognition is not supported in this browser.')
      return
    }
    if (speechListening.value) {
      stopSpeechToText()
      announce('Speech recognition stopped.')
      return
    }
    try {
      recognition = new SR()
      recognition.lang = navigator.language || 'en-US'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      let lastSttAnnounce = 0
      recognition.onresult = (e) => {
        let finalText = ''
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]
          if (r.isFinal) finalText += r[0].transcript
          else interim += r[0].transcript
        }
        const line = (finalText || interim).trim()
        if (!line) return
        const now = Date.now()
        const isFinal = Boolean(finalText)
        if (isFinal || now - lastSttAnnounce > 380) {
          lastSttAnnounce = now
          announce(line)
        }
      }

      recognition.onerror = (ev) => {
        speechListening.value = false
        if (ev.error === 'not-allowed') announce('Microphone permission denied.')
        else if (ev.error === 'no-speech') announce('No speech detected. Try again.')
        else announce('Speech recognition ended.')
      }

      recognition.onend = () => {
        speechListening.value = false
      }

      recognition.start()
      speechListening.value = true
      announce('Listening. Speak clearly. Tap again to stop.')
    } catch (e) {
      console.warn(e)
      announce('Could not start speech recognition.')
      speechListening.value = false
    }
  }

  function setScreenReaderMode(on) {
    screenReaderMode.value = on
    announce(on ? 'Screen reader enhancements enabled.' : 'Screen reader enhancements disabled.')
  }

  watch(
    [
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
    ],
    () => apply(),
    { flush: 'sync' }
  )

  return {
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
    liveAnnouncement,
    pointerX,
    pointerY,
    speechListening,
    loadFromStorage,
    openPanel,
    closePanel,
    resetDefaults,
    apply,
    announce,
    setScreenReaderMode,
    speakPageTitle,
    toggleSpeechToText,
    stopSpeechToText,
  }
})
