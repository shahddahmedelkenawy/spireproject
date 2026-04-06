import { db } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { getCompany } from './companyService'

/** Short relative time, e.g. "58 min", "2 h", "3 d" */
function formatShortTime(ts) {
  if (!ts?.toDate) return ''
  const date = ts.toDate()
  const sec = Math.floor((Date.now() - date.getTime()) / 1000)
  if (sec < 60) return 'now'
  if (sec < 3600) return `${Math.floor(sec / 60)} min`
  if (sec < 86400) return `${Math.floor(sec / 3600)} h`
  if (sec < 604800) return `${Math.floor(sec / 86400)} d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function normalizeCanonicalType(raw) {
  const t = String(raw || '').toLowerCase()
  if (t === 'friend_request') return 'request'
  if (t === 'message') return 'message'
  return t || 'info'
}

/** Which filter tab this row belongs to: jobs | requests | all */
function filterTabFor(canonical, rawType) {
  if (canonical === 'job' || canonical === 'application') return 'jobs'
  if (
    canonical === 'connection' ||
    canonical === 'request' ||
    String(rawType || '').toLowerCase() === 'friend_request'
  ) {
    return 'requests'
  }
  if (canonical === 'message') return 'all'
  return 'all'
}

function buildDisplayMessage(data) {
  const m = (data.message && String(data.message).trim()) || ''
  if (m) return m
  const parts = [data.title, data.subtitle].filter((x) => x && String(x).trim())
  return parts.join(' ')
}

function toUiItem(id, data) {
  const rawType = data.type || 'info'
  const canonical = normalizeCanonicalType(rawType)
  const displayMessage = buildDisplayMessage(data)
  const jobLike = canonical === 'job' || canonical === 'application'
  const messageLike = canonical === 'message'
  const personLike =
    messageLike ||
    canonical === 'connection' ||
    canonical === 'request' ||
    String(rawType || '').toLowerCase() === 'friend_request'

  let avatarShape = 'circle'
  let avatarSrc = ''
  if (jobLike && (data.companyLogo || '').trim()) {
    avatarShape = 'square'
    avatarSrc = String(data.companyLogo).trim()
  } else if (personLike && (data.senderImage || '').trim()) {
    avatarSrc = String(data.senderImage).trim()
  } else if (jobLike) {
    avatarShape = 'square'
  }

  return {
    id,
    type: rawType,
    canonicalType: canonical,
    message: displayMessage,
    title: data.title || '',
    subtitle: data.subtitle || '',
    time: formatShortTime(data.createdAt),
    icon: data.icon || 'notifications',
    read: !!data.read,
    friendRequestId: data.friendRequestId || null,
    senderId: data.senderId || null,
    senderName: data.senderName || '',
    senderImage: data.senderImage || '',
    companyLogo: data.companyLogo || '',
    avatarShape,
    avatarSrc,
    filterTab: filterTabFor(canonical, rawType),
  }
}

export async function addNotification({
  userId,
  type,
  title,
  subtitle,
  message = '',
  icon = 'notifications',
  read = false,
  friendRequestId = null,
  senderId = null,
  triggeredBy = null,
  senderName = '',
  senderImage = '',
  companyLogo = '',
  jobId = null,
}) {
  if (!userId) return null
  const payload = {
    userId,
    type,
    title,
    subtitle,
    icon,
    read,
    createdAt: serverTimestamp(),
  }
  const msg = (message && String(message).trim()) || [title, subtitle].filter(Boolean).join(' ')
  if (msg) payload.message = msg
  if (senderName) payload.senderName = senderName
  if (senderImage) payload.senderImage = senderImage
  if (companyLogo) payload.companyLogo = companyLogo
  if (friendRequestId) payload.friendRequestId = friendRequestId
  if (senderId) payload.senderId = senderId
  if (triggeredBy) payload.triggeredBy = triggeredBy
  if (jobId) payload.jobId = jobId
  const ref = await addDoc(collection(db, 'notifications'), payload)
  return ref.id
}

function tokenizeForMatch(s) {
  return String(s || '')
    .toLowerCase()
    .split(/[^a-z0-9\u0600-\u06FF]+/)
    .filter((w) => w.length >= 3)
}

function buildJobHaystack(job) {
  return [
    job.title,
    job.name,
    job.jobTitle,
    job.department,
    job.task,
    (job.description || '').slice(0, 800),
  ]
    .map((x) => String(x || ''))
    .join(' ')
}

function seekerSpecialityMatchesJob(seeker, haystack) {
  const spec = `${seeker.speciality || ''} ${seeker.fieldDescription || ''}`.trim()
  if (!spec) return false
  const hay = haystack.toLowerCase()
  const specLower = spec.toLowerCase()
  if (specLower.length >= 4 && hay.includes(specLower)) return true
  for (const t of tokenizeForMatch(spec)) {
    if (hay.includes(t)) return true
  }
  for (const t of tokenizeForMatch(hay)) {
    if (t.length >= 4 && specLower.includes(t)) return true
  }
  return false
}

/**
 * After a new job is published, notify job seekers whose speciality / field overlaps the job text.
 * Skips the company owner and users with role employer.
 */
export async function notifyJobSeekersOfNewMatchingJob(job) {
  if (!job?.id || !job.companyId) return
  let company
  try {
    company = await getCompany(job.companyId)
  } catch (e) {
    console.warn('notifyJobSeekersOfNewMatchingJob: company', e)
    return
  }
  const ownerId = company?.ownerId || ''
  const haystack = buildJobHaystack(job)
  const jobTitle = job.title || job.name || job.jobTitle || 'New role'
  const companyLogo = company?.logo || ''

  let snap
  try {
    snap = await getDocs(collection(db, 'users'))
  } catch (e) {
    console.warn('notifyJobSeekersOfNewMatchingJob: users', e)
    return
  }

  for (const d of snap.docs) {
    const uid = d.id
    const u = d.data()
    if (uid === ownerId) continue
    const role = String(u.role || 'jobseeker').toLowerCase()
    if (role === 'employer') continue
    if (!seekerSpecialityMatchesJob(u, haystack)) continue
    try {
      await addNotification({
        userId: uid,
        type: 'job',
        message: `${jobTitle}: A new accessible job opportunity matches your profile.`,
        title: 'New job for you',
        subtitle: `${jobTitle} matches your profile.`,
        icon: 'work',
        companyLogo,
        jobId: job.id,
        triggeredBy: ownerId,
      })
    } catch (e) {
      console.warn('notifyJobSeekersOfNewMatchingJob: notify failed', uid, e)
    }
  }
}

function mapSnapshotToUiList(snap) {
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
  return items.map((row) => toUiItem(row.id, row))
}

export async function listNotificationsForUser(userId) {
  if (!userId) return []
  const q = query(collection(db, 'notifications'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return mapSnapshotToUiList(snap)
}

/**
 * Live updates for the signed-in user's notification inbox (notification center).
 * @returns {() => void} unsubscribe
 */
export function subscribeNotificationsForUser(userId, onUpdate, onError) {
  if (!userId) {
    onUpdate([])
    return () => {}
  }
  const q = query(collection(db, 'notifications'), where('userId', '==', userId))
  return onSnapshot(
    q,
    (snap) => onUpdate(mapSnapshotToUiList(snap)),
    (err) => {
      console.error('[notifications] subscribe', err)
      if (typeof onError === 'function') onError(err)
    }
  )
}

export async function markNotificationRead(notificationId) {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true })
}

export async function deleteNotification(notificationId) {
  if (!notificationId) return
  await deleteDoc(doc(db, 'notifications', notificationId))
}
