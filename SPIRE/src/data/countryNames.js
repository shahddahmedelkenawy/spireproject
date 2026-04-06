/** English display names for all ISO regions (sorted). Fallback if Intl is unavailable. */
const FALLBACK = [
  'Egypt',
  'Saudi Arabia',
  'United Arab Emirates',
  'Qatar',
  'Jordan',
  'United States',
  'United Kingdom',
  'France',
  'Germany',
  'India',
  'China',
  'Japan',
]

export const countryNames = (() => {
  if (typeof Intl === 'undefined' || typeof Intl.supportedValuesOf !== 'function') {
    return [...FALLBACK].sort((a, b) => a.localeCompare(b))
  }
  try {
    const codes = Intl.supportedValuesOf('region')
    const dn = new Intl.DisplayNames(['en'], { type: 'region' })
    const seen = new Set()
    for (const code of codes) {
      if (!code || code.length < 2) continue
      let name
      try {
        name = dn.of(code)
      } catch {
        continue
      }
      if (!name || /^unknown/i.test(name)) continue
      seen.add(name)
    }
    return [...seen].sort((a, b) => a.localeCompare(b))
  } catch {
    return [...FALLBACK].sort((a, b) => a.localeCompare(b))
  }
})()
