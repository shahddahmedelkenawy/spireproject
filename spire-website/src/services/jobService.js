import { db } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { notifyJobSeekersOfNewMatchingJob } from './notificationService'

function jobTimestampMs(data) {
  const c = data?.createdAt
  if (!c) return 0
  if (typeof c.toMillis === 'function') return c.toMillis()
  if (c.seconds != null) return c.seconds * 1000
  return 0
}

export async function createJob(payload) {
  const title = payload.title || payload.name || ''
  const ref = await addDoc(collection(db, 'jobs'), {
    companyId: payload.companyId,
    name: title,
    title,
    jobTitle: payload.jobTitle || title,
    description: payload.description || '',
    salary: payload.salary ?? '',
    department: payload.department || '',
    type: payload.type || 'fulltime',
    workingHours: payload.workingHours ?? '',
    workingDays: payload.workingDays ?? '',
    volunteerHours: payload.volunteerHours ?? '',
    task: payload.task || '',
    accessibilityFeatures: payload.accessibilityFeatures || '',
    insurance: payload.insurance ?? null,
    status: payload.status || 'open',
    createdAt: serverTimestamp(),
  })
  const job = {
    id: ref.id,
    companyId: payload.companyId,
    name: title,
    title,
    jobTitle: payload.jobTitle || title,
    description: payload.description || '',
    department: payload.department || '',
    task: payload.task || '',
  }
  notifyJobSeekersOfNewMatchingJob(job).catch((e) => {
    console.warn('Could not notify matching job seekers:', e)
  })
  return ref.id
}

export async function updateJob(jobId, updates) {
  await updateDoc(doc(db, 'jobs', jobId), updates)
}

export async function deleteJob(jobId) {
  await deleteDoc(doc(db, 'jobs', String(jobId)))
}

export async function getJobById(jobId) {
  const snap = await getDoc(doc(db, 'jobs', String(jobId)))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function listAllJobs() {
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function listCompanyJobs(companyId) {
  const q = query(collection(db, 'jobs'), where('companyId', '==', companyId))
  const snap = await getDocs(q)
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  rows.sort((a, b) => jobTimestampMs(b) - jobTimestampMs(a))
  return rows
}

