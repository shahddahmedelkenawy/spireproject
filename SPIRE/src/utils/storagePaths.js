/**
 * Firebase Storage object keys with spaces or special characters can break the
 * REST upload endpoint (browser shows CORS/preflight errors; often status 404).
 */
export function sanitizeFileNameForStorage(originalName) {
  if (!originalName || typeof originalName !== 'string') {
    return `file-${Date.now()}.bin`
  }
  const trimmed = originalName.trim()
  const lastDot = trimmed.lastIndexOf('.')
  const ext = lastDot > 0 ? trimmed.slice(lastDot).replace(/[^.a-zA-Z0-9]/g, '').slice(0, 16) : ''
  const base = (lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120) || 'file'
  const suffix = ext && ext.startsWith('.') ? ext : '.bin'
  return `${base}${suffix}`
}
