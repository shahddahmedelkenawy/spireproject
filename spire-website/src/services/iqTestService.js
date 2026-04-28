import { db, storage } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { sanitizeFileNameForStorage } from 'src/utils/storagePaths'

export function calculateIqLevel(result) {
  if (result >= 85) return 'advanced'
  if (result >= 60) return 'intermediate'
  return 'beginner'
}

export async function saveIqTestResult({ userId, result }) {
  const level = calculateIqLevel(result)
  const ref = await addDoc(collection(db, 'iqTests'), {
    userId,
    date: serverTimestamp(),
    result,
    level,
  })
  await updateDoc(doc(db, 'iqTests', ref.id), { id: ref.id })
  return { id: ref.id, level }
}

export async function listIqTestsForUser(userId) {
  const q = query(collection(db, 'iqTests'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createMedicalProfile({
  userId,
  disabilityType,
  level,
  description,
  accessibilityNeed,
  disabilityCardFile,
  medicalReportFile,
}) {
  const ref = await addDoc(collection(db, 'medicalProfiles'), {
    userId,
    disabilityType: disabilityType || '',
    level: level || '',
    description: description || '',
    accessibilityNeed: accessibilityNeed || '',
    disabilityCardFile: disabilityCardFile || '',
    medicalReportFile: medicalReportFile || '',
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'medicalProfiles', ref.id), { id: ref.id })
  return ref.id
}

async function uploadMedicalFile(userId, folder, file) {
  const safeName = sanitizeFileNameForStorage(file.name)
  const path = `medicalProfiles/${userId}/${folder}/${Date.now()}-${safeName}`
  const fileRef = storageRef(storage, path)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

export async function uploadDisabilityCard(userId, file) {
  return uploadMedicalFile(userId, 'disabilityCards', file)
}

export async function uploadMedicalReport(userId, file) {
  return uploadMedicalFile(userId, 'medicalReports', file)
}

export async function getMedicalProfileByUser(userId) {
  const q = query(collection(db, 'medicalProfiles'), where('userId', '==', userId))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  rows.sort((a, b) => {
    const ta = a.createdAt?.toMillis?.() ?? 0
    const tb = b.createdAt?.toMillis?.() ?? 0
    return tb - ta
  })
  return rows[0]
}

/** Upload medical/disability file and save URL on existing medical profile or create one */
export async function attachMedicalFileToProfile(userId, field, file) {
  if (!file || !userId) return null
  const url =
    field === 'medicalReportFile'
      ? await uploadMedicalReport(userId, file)
      : await uploadDisabilityCard(userId, file)
  const med = await getMedicalProfileByUser(userId)
  if (med?.id) {
    await updateDoc(doc(db, 'medicalProfiles', med.id), { [field]: url })
  } else {
    await createMedicalProfile({
      userId,
      disabilityType: '',
      level: '',
      description: '',
      accessibilityNeed: '',
      disabilityCardFile: field === 'disabilityCardFile' ? url : '',
      medicalReportFile: field === 'medicalReportFile' ? url : '',
    })
  }
  return url
}

