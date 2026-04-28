/**
 * Capitalize only the first character of each word; keep the rest of each word as typed.
 */
export function titleCaseWords(str) {
  if (str == null || str === '') return str
  return String(str)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (w.length ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}

/** Same rule per comma-separated segment (each segment: first letter of each word only). */
export function titleCaseCommaSeparated(str) {
  if (str == null || str === '') return str
  return String(str)
    .split(',')
    .map((s) => titleCaseWords(s.trim()))
    .filter(Boolean)
    .join(', ')
}

/** Each line: first letter of each word only; preserves newlines. */
export function titleCaseMultiline(str) {
  if (str == null || str === '') return str
  return String(str)
    .split('\n')
    .map((line) => titleCaseWords(line))
    .join('\n')
}

/** Display helper: capitalize first letter of each word without changing the rest. */
export function capitalizeProseWords(str) {
  return titleCaseWords(str || '')
}
